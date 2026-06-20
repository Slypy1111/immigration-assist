"use client";

import { updateCaseStatus } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";

const STATUSES = [
  "INTAKE",
  "COLLECTING",
  "DRAFTING",
  "REVIEW",
  "READY",
] as const;

export function LawyerCaseActions({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  async function handleStatusChange(status: string) {
    const formData = new FormData();
    formData.set("caseId", caseId);
    formData.set("status", status);
    await updateCaseStatus(formData);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">Update status:</span>
      {STATUSES.map((status) => (
        <Button
          key={status}
          size="sm"
          variant={currentStatus === status ? "default" : "outline"}
          onClick={() => handleStatusChange(status)}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}
