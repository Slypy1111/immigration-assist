"use server";

import { revalidatePath } from "next/cache";
import { requireLawyerUser, syncUserFromClerk, userHasCaseAccess } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { draftUpdateSchema, draftApproveSchema } from "@/lib/validators";
import {
  buildContextPack,
  resolvePromptKey,
} from "@/lib/ai/context-builder";
import { generateDraftText } from "@/lib/ai/providers";
import { getModelName } from "@/lib/ai/providers";

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
    throw new Error("Rate limit exceeded. Try again later.");
  }

  await prisma.aiDraftRateLimit.update({
    where: { caseId },
    data: { count: record.count + 1 },
  });
}

export async function generateDraft(caseId: string, draftType: string) {
  const user = await requireLawyerUser();
  await checkRateLimit(caseId);

  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, organizationId: user.organizationId },
    include: {
      visaTemplate: true,
      intakeResponse: true,
      checklistItems: true,
      documents: { where: { extractedText: { not: null } } },
    },
  });

  if (!caseRecord) throw new Error("Case not found");

  const draftTypes = caseRecord.visaTemplate.draftTypes as Array<{
    type: string;
    title: string;
    promptKey: string;
  }>;
  const draftConfig = draftTypes.find((d) => d.type === draftType);
  if (!draftConfig) throw new Error("Invalid draft type");

  const promptKey = resolvePromptKey(caseRecord.visaTemplate, draftType);
  const context = buildContextPack({
    caseRecord,
    intake: caseRecord.intakeResponse,
    checklistItems: caseRecord.checklistItems,
    documents: caseRecord.documents,
    draftType,
    promptKey,
  });

  const { text, modelUsed } = await generateDraftText(context);

  let draft = await prisma.draft.findFirst({
    where: { caseId, draftType },
  });

  if (draft) {
    draft = await prisma.draft.update({
      where: { id: draft.id },
      data: { updatedAt: new Date() },
    });
  } else {
    draft = await prisma.draft.create({
      data: {
        caseId,
        draftType,
        title: draftConfig.title,
      },
    });
  }

  await prisma.draftVersion.create({
    data: {
      draftId: draft.id,
      content: text,
      modelUsed,
      promptHash: context.promptHash,
      createdById: user.id,
    },
  });

  await prisma.case.update({
    where: { id: caseId },
    data: { status: "DRAFTING" },
  });

  revalidatePath(`/lawyer/cases/${caseId}`);
  return { draftId: draft.id, content: text };
}

export async function saveDraftVersion(formData: FormData) {
  const user = await requireLawyerUser();
  const parsed = draftUpdateSchema.parse({
    draftId: formData.get("draftId"),
    content: formData.get("content"),
  });

  const draft = await prisma.draft.findUnique({
    where: { id: parsed.draftId },
    include: { case: true },
  });

  if (!draft || draft.case.organizationId !== user.organizationId) {
    throw new Error("Not found");
  }

  await prisma.draftVersion.create({
    data: {
      draftId: parsed.draftId,
      content: parsed.content,
      createdById: user.id,
    },
  });

  revalidatePath(`/lawyer/cases/${draft.caseId}`);
}

export async function approveDraft(formData: FormData) {
  const user = await requireLawyerUser();
  const parsed = draftApproveSchema.parse({
    draftId: formData.get("draftId"),
  });

  const draft = await prisma.draft.findUnique({
    where: { id: parsed.draftId },
    include: { case: true },
  });

  if (!draft || draft.case.organizationId !== user.organizationId) {
    throw new Error("Not found");
  }

  await prisma.draft.update({
    where: { id: parsed.draftId },
    data: { status: "APPROVED" },
  });

  await prisma.case.update({
    where: { id: draft.caseId },
    data: { status: "REVIEW" },
  });

  revalidatePath(`/lawyer/cases/${draft.caseId}`);
}

export async function getDraftWithVersions(draftId: string) {
  const user = await syncUserFromClerk();
  if (!user) throw new Error("Unauthorized");

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      case: true,
      versions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!draft) throw new Error("Not found");

  const hasAccess = await userHasCaseAccess(
    user.id,
    draft.caseId,
    user.role,
  );
  if (!hasAccess) throw new Error("Forbidden");

  return draft;
}

export async function saveGeneratedDraft(
  caseId: string,
  draftType: string,
  content: string,
) {
  const user = await requireLawyerUser();

  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, organizationId: user.organizationId },
    include: { visaTemplate: true },
  });

  if (!caseRecord) throw new Error("Case not found");

  const draftTypes = caseRecord.visaTemplate.draftTypes as Array<{
    type: string;
    title: string;
    promptKey: string;
  }>;
  const draftConfig = draftTypes.find((d) => d.type === draftType);
  if (!draftConfig) throw new Error("Invalid draft type");

  let draft = await prisma.draft.findFirst({
    where: { caseId, draftType },
  });

  if (!draft) {
    draft = await prisma.draft.create({
      data: {
        caseId,
        draftType,
        title: draftConfig.title,
      },
    });
  } else {
    await prisma.draft.update({
      where: { id: draft.id },
      data: { updatedAt: new Date() },
    });
  }

  await prisma.draftVersion.create({
    data: {
      draftId: draft.id,
      content,
      modelUsed: process.env.MOCK_AI === "true" ? "mock" : getModelName(),
      createdById: user.id,
    },
  });

  await prisma.case.update({
    where: { id: caseId },
    data: { status: "DRAFTING" },
  });

  revalidatePath(`/lawyer/cases/${caseId}`);
  return { draftId: draft.id };
}

export async function getDraftsForCase(caseId: string) {
  const user = await syncUserFromClerk();
  if (!user) throw new Error("Unauthorized");

  const hasAccess = await userHasCaseAccess(user.id, caseId, user.role);
  if (!hasAccess) throw new Error("Forbidden");

  return prisma.draft.findMany({
    where: { caseId },
    include: {
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
}
