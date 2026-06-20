"use client";

import { updateCaseStatus } from "@/lib/actions/cases";
import { useToast } from "@/components/ui/toast";
import { CASE_STATUS_LABELS } from "@/lib/utils";

const STATUSES = [
  "INTAKE",
  "COLLECTING",
  "DRAFTING",
  "REVIEW",
  "READY",
] as const;

export function CaseStatusSelect({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  const { toast } = useToast();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData();
    formData.set("caseId", caseId);
    formData.set("status", e.target.value);
    try {
      await updateCaseStatus(formData);
      toast("Case status updated", "success");
    } catch {
      toast("Failed to update status", "error");
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--primary)]"
    >
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {CASE_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
