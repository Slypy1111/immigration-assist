import { NextRequest } from "next/server";
import { requireLawyerUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { draftGenerateSchema } from "@/lib/validators";
import {
  buildContextPack,
  resolvePromptKey,
} from "@/lib/ai/context-builder";
import { streamDraftText, getModelName } from "@/lib/ai/providers";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

async function checkRateLimit(caseId: string): Promise<void> {
  const now = new Date();
  const record = await prisma.aiDraftRateLimit.findUnique({
    where: { caseId },
  });

  if (!record) {
    await prisma.aiDraftRateLimit.create({
      data: { caseId, count: 1, windowStart: now },
    });
    return;
  }

  const elapsed = now.getTime() - record.windowStart.getTime();
  if (elapsed > RATE_WINDOW_MS) {
    await prisma.aiDraftRateLimit.update({
      where: { caseId },
      data: { count: 1, windowStart: now },
    });
    return;
  }

  if (record.count >= RATE_LIMIT) {
    throw new Error("Rate limit exceeded");
  }

  await prisma.aiDraftRateLimit.update({
    where: { caseId },
    data: { count: record.count + 1 },
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireLawyerUser();
    const body = await request.json();
    const parsed = draftGenerateSchema.parse(body);

    await checkRateLimit(parsed.caseId);

    const caseRecord = await prisma.case.findFirst({
      where: { id: parsed.caseId, organizationId: user.organizationId },
      include: {
        visaTemplate: true,
        intakeResponse: true,
        checklistItems: true,
        documents: { where: { extractedText: { not: null } } },
      },
    });

    if (!caseRecord) {
      return new Response(JSON.stringify({ error: "Case not found" }), {
        status: 404,
      });
    }

    const draftTypes = caseRecord.visaTemplate.draftTypes as Array<{
      type: string;
      title: string;
      promptKey: string;
    }>;
    const draftConfig = draftTypes.find((d) => d.type === parsed.draftType);
    if (!draftConfig) {
      return new Response(JSON.stringify({ error: "Invalid draft type" }), {
        status: 400,
      });
    }

    const promptKey = resolvePromptKey(
      caseRecord.visaTemplate,
      parsed.draftType,
    );
    const context = buildContextPack({
      caseRecord,
      intake: caseRecord.intakeResponse,
      checklistItems: caseRecord.checklistItems,
      documents: caseRecord.documents,
      draftType: parsed.draftType,
      promptKey,
    });

    const result = streamDraftText(context);

    return result.toTextStreamResponse({
      headers: {
        "X-Draft-Type": parsed.draftType,
        "X-Model": getModelName(),
        "X-Prompt-Hash": context.promptHash,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Generation failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
