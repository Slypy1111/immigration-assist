"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { IntakeForm } from "@/components/case/intake-form";
import { ClientChecklist } from "./client-checklist";
import { MessageThread } from "@/components/case/message-thread";
import { ProgressBar } from "@/components/case/case-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntakeSchema } from "@/lib/validators";
type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  status: string;
  lawyerFeedback: string | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
};

export function ClientCaseGuide({
  caseId,
  caseTitle,
  visaName,
  intakeSchema,
  intakeData,
  intakeCompleted,
  checklistItems,
  messages,
  currentUserId,
  progressPercentage,
}: {
  caseId: string;
  caseTitle: string;
  visaName: string;
  intakeSchema: IntakeSchema;
  intakeData: Record<string, unknown>;
  intakeCompleted: boolean;
  checklistItems: ChecklistItem[];
  messages: Message[];
  currentUserId: string;
  progressPercentage: number;
}) {
  const [openSection, setOpenSection] = useState<string>(
    intakeCompleted ? "documents" : "intake",
  );

  const pendingDocs = checklistItems.filter(
    (i) => i.required && (i.status === "PENDING" || i.status === "REJECTED"),
  ).length;

  const sections = [
    {
      id: "intake",
      title: "Step 1: Complete Intake Form",
      done: intakeCompleted,
      description: "Tell us about yourself and your visa application",
    },
    {
      id: "documents",
      title: "Step 2: Upload Documents",
      done: pendingDocs === 0 && intakeCompleted,
      description: `${pendingDocs} required document(s) remaining`,
    },
    {
      id: "messages",
      title: "Step 3: Communicate with Your Lawyer",
      done: messages.length > 0,
      description: "Ask questions or respond to your lawyer",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/client"
        className="text-sm text-[var(--muted)] hover:underline"
      >
        ← Back to My Cases
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">{caseTitle}</h1>
        <p className="text-[var(--muted)]">{visaName}</p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar percentage={progressPercentage} />
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? "" : section.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-[var(--surface)]"
              >
                <div className="flex items-center gap-3">
                  {section.done ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                  ) : (
                    <Circle className="h-5 w-5 text-[var(--muted)]" />
                  )}
                  <div>
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {section.description}
                    </p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {isOpen && (
                <CardContent className="border-t border-[var(--border)] pt-4">
                  {section.id === "intake" && (
                    <IntakeForm
                      caseId={caseId}
                      schema={intakeSchema}
                      initialData={intakeData}
                      completed={intakeCompleted}
                    />
                  )}
                  {section.id === "documents" && (
                    <ClientChecklist
                      caseId={caseId}
                      items={checklistItems}
                    />
                  )}
                  {section.id === "messages" && (
                    <MessageThread
                      caseId={caseId}
                      messages={messages}
                      currentUserId={currentUserId}
                    />
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
