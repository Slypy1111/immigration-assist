import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

export const agentChatSchema = z.object({
  caseId: z.string().min(1),
  agentId: z.string().min(1),
  message: z.string().min(1).max(5000),
});

export async function buildAgentCaseContext(
  caseId: string,
  organizationId: string,
) {
  return prisma.case.findFirst({
    where: { id: caseId, organizationId },
    include: {
      visaTemplate: true,
      intakeResponse: true,
      checklistItems: { orderBy: { sortOrder: "asc" } },
      documents: true,
      drafts: {
        include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

export function buildAgentUserPrompt(
  caseContext: NonNullable<Awaited<ReturnType<typeof buildAgentCaseContext>>>,
  userMessage: string,
): string {
  const checklistSummary = caseContext.checklistItems
    .map((i) => `- ${i.title}: ${i.status}${i.required ? " (required)" : ""}`)
    .join("\n");

  const draftSummary = caseContext.drafts
    .map((d) => `- ${d.title}: ${d.status}`)
    .join("\n");

  return `# Case Context
- Title: ${caseContext.title}
- Visa: ${caseContext.visaTemplate.name} (${caseContext.visaTemplate.code})
- Status: ${caseContext.status}
- Intake completed: ${caseContext.intakeResponse?.completed ?? false}

## Intake Data
${JSON.stringify(caseContext.intakeResponse?.data ?? {}, null, 2)}

## Checklist
${checklistSummary || "No items"}

## Drafts
${draftSummary || "No drafts"}

## Lawyer Question
${userMessage}`;
}
