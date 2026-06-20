import { prisma } from "@/lib/db/prisma";
import { requireLawyerUser } from "@/lib/auth";

export type AttentionItem = {
  caseId: string;
  caseTitle: string;
  type: "checklist" | "intake" | "draft";
  message: string;
  priority: "high" | "medium";
};

export async function getNeedsAttention(): Promise<AttentionItem[]> {
  const user = await requireLawyerUser();
  const items: AttentionItem[] = [];

  const cases = await prisma.case.findMany({
    where: { organizationId: user.organizationId },
    include: {
      checklistItems: true,
      intakeResponse: true,
      drafts: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  for (const c of cases) {
    const pendingRequired = c.checklistItems.filter(
      (i) => i.required && (i.status === "PENDING" || i.status === "REJECTED"),
    );
    if (pendingRequired.length > 0) {
      items.push({
        caseId: c.id,
        caseTitle: c.title,
        type: "checklist",
        message: `${pendingRequired.length} required document(s) missing or rejected`,
        priority: "high",
      });
    }

    if (!c.intakeResponse?.completed && c.status === "INTAKE") {
      items.push({
        caseId: c.id,
        caseTitle: c.title,
        type: "intake",
        message: "Intake questionnaire not completed",
        priority: "medium",
      });
    }

    const pendingDrafts = c.drafts.filter((d) => d.status === "DRAFT");
    if (pendingDrafts.length > 0) {
      items.push({
        caseId: c.id,
        caseTitle: c.title,
        type: "draft",
        message: `${pendingDrafts.length} AI draft(s) awaiting review`,
        priority: "medium",
      });
    }
  }

  return items.slice(0, 8);
}
