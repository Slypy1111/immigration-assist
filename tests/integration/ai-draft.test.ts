import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireLawyerUser: vi.fn().mockResolvedValue({
    id: "lawyer-1",
    organizationId: "org-1",
    role: "LAWYER",
  }),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    aiDraftRateLimit: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    case: {
      findFirst: vi.fn().mockResolvedValue({
        id: "case-1",
        organizationId: "org-1",
        title: "Test Case",
        visaTemplate: {
          code: "partner-820",
          name: "Partner Visa",
          draftTypes: [
            {
              type: "relationship_statement",
              title: "Relationship Statement",
              promptKey: "relationship_statement",
            },
          ],
          intakeSchema: { steps: [], fields: [] },
        },
        intakeResponse: { data: { applicantFullName: "John" } },
        checklistItems: [],
        documents: [],
      }),
    },
  },
}));

vi.mock("@/lib/ai/providers", () => ({
  streamDraftText: vi.fn().mockReturnValue({
    toTextStreamResponse: () =>
      new Response("Mock draft content", {
        headers: { "Content-Type": "text/plain" },
      }),
  }),
  getModelName: vi.fn().mockReturnValue("mock"),
}));

describe("AI draft API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns stream response for valid request", async () => {
    const { POST } = await import("@/app/api/ai/draft/route");

    const request = new Request("http://localhost/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: "cm4abc1234567890123456789",
        draftType: "relationship_statement",
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain("Mock draft content");
  });

  it("rejects invalid body", async () => {
    const { POST } = await import("@/app/api/ai/draft/route");

    const request = new Request("http://localhost/api/ai/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: "invalid" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(500);
  });
});
