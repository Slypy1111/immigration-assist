import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import type { ContextPack } from "./context-builder";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function getModelName(): string {
  return process.env.AI_MODEL ?? "gpt-4o-mini";
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateDraftText(context: ContextPack): Promise<{
  text: string;
  modelUsed: string;
}> {
  if (process.env.MOCK_AI === "true") {
    return {
      text: `# Mock Draft: ${context.metadata.draftType}\n\nThis is a mock AI-generated draft for testing.\n\n## Section 1\nBased on the provided intake data for ${context.metadata.caseTitle}.\n\n[NEEDS CLIENT INPUT] for any missing details.\n\n---\n*AI-assisted draft — lawyer review required.*`,
      modelUsed: "mock",
    };
  }

  const model = openai(getModelName());
  const result = await generateText({
    model,
    system: context.systemPrompt,
    prompt: context.userPrompt,
    maxOutputTokens: 4096,
  });

  return {
    text: result.text,
    modelUsed: getModelName(),
  };
}

export function streamDraftText(context: ContextPack) {
  if (process.env.MOCK_AI === "true") {
    const mockText = `# Mock Draft: ${context.metadata.draftType}\n\nMock streaming content for ${context.metadata.caseTitle}.`;
    return streamText({
      model: openai("gpt-4o-mini"),
      system: context.systemPrompt,
      prompt: mockText,
    });
  }

  const model = openai(getModelName());
  return streamText({
    model,
    system: context.systemPrompt,
    prompt: context.userPrompt,
    maxOutputTokens: 4096,
  });
}
