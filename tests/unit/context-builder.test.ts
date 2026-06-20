import { describe, it, expect } from "vitest";
import { buildContextPack, resolvePromptKey } from "@/lib/ai/context-builder";
import { getPromptForType, PROMPTS } from "@/lib/ai/prompts";
import { createTestContextInput } from "../helpers/fixtures";

describe("context-builder", () => {
  it("includes case metadata in user prompt", () => {
    const input = createTestContextInput();
    const pack = buildContextPack(input);

    expect(pack.userPrompt).toContain("Smith - Partner Visa");
    expect(pack.userPrompt).toContain("Partner Visa (820/801)");
    expect(pack.userPrompt).toContain("relationship_statement");
  });

  it("formats intake data with provided and missing fields", () => {
    const input = createTestContextInput();
    const pack = buildContextPack(input);

    expect(pack.userPrompt).toContain("John Smith");
    expect(pack.userPrompt).toContain(
      "We met at a conference in Sydney in 2019.",
    );
  });

  it("includes verified document excerpts", () => {
    const input = createTestContextInput();
    const pack = buildContextPack(input);

    expect(pack.userPrompt).toContain("passport.pdf");
    expect(pack.userPrompt).toContain("Passport bio page text content.");
  });

  it("generates stable prompt hash for same input", () => {
    const input = createTestContextInput();
    const pack1 = buildContextPack(input);
    const pack2 = buildContextPack(input);

    expect(pack1.promptHash).toBe(pack2.promptHash);
    expect(pack1.promptHash).toHaveLength(16);
  });

  it("uses system prompt with no-fabrication rules", () => {
    const input = createTestContextInput();
    const pack = buildContextPack(input);

    expect(pack.systemPrompt).toContain("Never invent");
    expect(pack.systemPrompt).toContain("[NEEDS CLIENT INPUT]");
  });

  it("resolves prompt key from visa template draft types", () => {
    const input = createTestContextInput();
    const key = resolvePromptKey(
      input.caseRecord.visaTemplate,
      "relationship_statement",
    );

    expect(key).toBe("relationship_statement");
  });

  it("falls back to cover_letter for unknown draft type", () => {
    const input = createTestContextInput();
    const key = resolvePromptKey(
      input.caseRecord.visaTemplate,
      "unknown_type",
    );

    expect(key).toBe("cover_letter");
  });
});

describe("prompts", () => {
  it("has prompts for all MVP visa document types", () => {
    expect(PROMPTS.relationship_statement).toBeDefined();
    expect(PROMPTS.employer_support_letter).toBeDefined();
    expect(PROMPTS.gte_statement).toBeDefined();
  });

  it("returns cover letter as fallback", () => {
    const prompt = getPromptForType("nonexistent");
    expect(prompt).toBe(PROMPTS.cover_letter);
  });
});

describe("intake validation schema", () => {
  it("validates create case input", async () => {
    const { createCaseSchema } = await import("@/lib/validators");
    const result = createCaseSchema.safeParse({
      title: "Test Case",
      visaTemplateId: "cm4abc1234567890123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email on invite", async () => {
    const { inviteClientSchema } = await import("@/lib/validators");
    const result = inviteClientSchema.safeParse({
      caseId: "cm4abc1234567890123456789",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
