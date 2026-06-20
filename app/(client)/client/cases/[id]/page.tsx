import { notFound } from "next/navigation";
import { getCaseById, getCaseProgress } from "@/lib/actions/cases";
import { syncUserFromClerk } from "@/lib/auth";
import { ClientCaseGuide } from "./client-case-guide";
import type { IntakeSchema } from "@/lib/validators";

export default async function ClientCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await syncUserFromClerk();
  const caseRecord = await getCaseById(id);

  if (!caseRecord) notFound();

  const progress = await getCaseProgress(id);
  const intakeSchema = caseRecord.visaTemplate.intakeSchema as IntakeSchema;
  const intakeData = (caseRecord.intakeResponse?.data ?? {}) as Record<
    string,
    unknown
  >;

  return (
    <ClientCaseGuide
      caseId={id}
      caseTitle={caseRecord.title}
      visaName={caseRecord.visaTemplate.name}
      intakeSchema={intakeSchema}
      intakeData={intakeData}
      intakeCompleted={caseRecord.intakeResponse?.completed ?? false}
      checklistItems={caseRecord.checklistItems}
      messages={caseRecord.messages}
      currentUserId={user?.id ?? ""}
      progressPercentage={progress.percentage}
    />
  );
}
