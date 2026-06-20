import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ClipboardList,
  FileInput,
  Files,
  Sparkles,
  MessageSquare,
  UserPlus,
  Bot,
} from "lucide-react";
import {
  getCaseById,
  getCaseProgress,
  inviteClient,
  sendChecklistReminder,
} from "@/lib/actions/cases";
import { syncUserFromClerk } from "@/lib/auth";
import { getAgentsForRole } from "@/lib/agents/agent-registry";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseStatusBadge, ProgressBar } from "@/components/case/case-status-badge";
import { CaseWorkflowStepper } from "@/components/case/case-workflow-stepper";
import { IntakeForm } from "@/components/case/intake-form";
import { LawyerChecklist } from "@/components/checklist/lawyer-checklist";
import { DraftEditor } from "@/components/draft-editor/draft-editor";
import { MessageThread } from "@/components/case/message-thread";
import { AgentHub } from "@/components/agents/agent-hub";
import { formatDate } from "@/lib/utils";
import type { IntakeSchema, DraftTypeConfig } from "@/lib/validators";
import { CaseStatusSelect } from "./case-status-select";

export default async function LawyerCaseDetailPage({
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
  const draftTypes = caseRecord.visaTemplate.draftTypes as DraftTypeConfig[];
  const intakeData = (caseRecord.intakeResponse?.data ?? {}) as Record<
    string,
    unknown
  >;

  const pendingChecklist = caseRecord.checklistItems.filter(
    (i) => i.required && (i.status === "PENDING" || i.status === "REJECTED"),
  ).length;

  const pendingDrafts = caseRecord.drafts.filter(
    (d) => d.status === "DRAFT",
  ).length;

  const agents = user ? getAgentsForRole(user.role) : [];

  async function handleInvite(formData: FormData) {
    "use server";
    await inviteClient(formData);
  }

  async function handleReminder() {
    "use server";
    await sendChecklistReminder(id);
  }

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mb-6">
        <Link
          href="/lawyer/cases"
          className="text-sm text-[var(--muted)] hover:underline"
        >
          ← Back to Cases
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary)]">
              {caseRecord.title}
            </h1>
            <p className="text-[var(--muted)]">
              {caseRecord.visaTemplate.name}
              {caseRecord.clientEmail && ` · ${caseRecord.clientEmail}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CaseStatusSelect
              caseId={id}
              currentStatus={caseRecord.status}
            />
            <CaseStatusBadge status={caseRecord.status} />
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <CaseWorkflowStepper currentStatus={caseRecord.status} />
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted)]">
              Document Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressBar percentage={progress.percentage} />
            <p className="mt-2 text-sm text-[var(--muted)]">
              {progress.completed} of {progress.total} required items verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted)]">
              Assigned Lawyer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {caseRecord.assignedLawyer
                ? [
                    caseRecord.assignedLawyer.firstName,
                    caseRecord.assignedLawyer.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") || caseRecord.assignedLawyer.email
                : "Unassigned"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted)]">
              Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(caseRecord.createdAt)}</p>
            {caseRecord.dueDate && (
              <p className="text-sm text-[var(--muted)]">
                Due: {formatDate(caseRecord.dueDate)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checklist" className="mt-6">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="checklist" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Checklist
            {pendingChecklist > 0 && (
              <span className="rounded-full bg-red-100 px-1.5 text-xs text-red-700">
                {pendingChecklist}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="intake" className="gap-1.5">
            <FileInput className="h-4 w-4" />
            Intake
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <Files className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            Drafts
            {pendingDrafts > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 text-xs text-amber-700">
                {pendingDrafts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-1.5">
            <Bot className="h-4 w-4" />
            AI Assistants
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="invite" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Invite
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="mt-4">
          <div className="mb-4 flex gap-2">
            <form action={handleReminder}>
              <Button type="submit" variant="outline" size="sm">
                Send Reminder Email
              </Button>
            </form>
          </div>
          <LawyerChecklist caseId={id} items={caseRecord.checklistItems} />
        </TabsContent>

        <TabsContent value="intake" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <IntakeForm
                caseId={id}
                schema={intakeSchema}
                initialData={intakeData}
                completed={caseRecord.intakeResponse?.completed ?? false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="space-y-3">
            {caseRecord.documents.length === 0 ? (
              <p className="text-[var(--muted)]">No documents uploaded yet.</p>
            ) : (
              caseRecord.documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {(doc.fileSize / 1024).toFixed(1)} KB ·{" "}
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/api/files/${encodeURIComponent(doc.fileKey)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <DraftEditor
                caseId={id}
                draftTypes={draftTypes}
                existingDrafts={caseRecord.drafts}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <AgentHub caseId={id} agents={agents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <MessageThread
                caseId={id}
                messages={caseRecord.messages}
                currentUserId={user?.id ?? ""}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invite Client</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleInvite} className="flex gap-3">
                <input type="hidden" name="caseId" value={id} />
                <Input
                  name="email"
                  type="email"
                  placeholder="client@example.com"
                  defaultValue={caseRecord.clientEmail ?? ""}
                  required
                  className="max-w-sm"
                />
                <Button type="submit">Send Invite</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
