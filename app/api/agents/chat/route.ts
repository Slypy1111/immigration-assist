import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { requireLawyerUser } from "@/lib/auth";
import { agentChatSchema } from "@/lib/agents/chat";
import { getAgentById, isAgentAllowed } from "@/lib/agents/agent-registry";
import {
  buildAgentCaseContext,
  buildAgentUserPrompt,
} from "@/lib/agents/chat";
import { getModelName } from "@/lib/ai/providers";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const user = await requireLawyerUser();
    const body = await request.json();
    const parsed = agentChatSchema.parse(body);

    if (!isAgentAllowed(parsed.agentId, user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const agent = getAgentById(parsed.agentId);
    if (!agent) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
      });
    }

    const caseContext = await buildAgentCaseContext(
      parsed.caseId,
      user.organizationId,
    );
    if (!caseContext) {
      return new Response(JSON.stringify({ error: "Case not found" }), {
        status: 404,
      });
    }

    const userPrompt = buildAgentUserPrompt(caseContext, parsed.message);

    if (process.env.MOCK_AI === "true") {
      const mockText = `**${agent.name}**\n\nRegarding "${caseContext.title}":\n\n${parsed.message}\n\nBased on the case data, I recommend reviewing pending checklist items and ensuring intake is complete before proceeding.\n\n---\n*${agent.disclaimer}*`;
      return new Response(mockText, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const result = streamText({
      model: openai(getModelName()),
      system: `${agent.systemPrompt}\n\n${agent.disclaimer}`,
      prompt: userPrompt,
      maxOutputTokens: 2048,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent chat failed";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
