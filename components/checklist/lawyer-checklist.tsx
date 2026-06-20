"use client";

import { useRouter } from "next/navigation";
import { updateChecklistItem } from "@/lib/actions/cases";
import { ChecklistPanel } from "@/components/checklist/checklist-panel";
import { useToast } from "@/components/ui/toast";

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  status: string;
  lawyerFeedback: string | null;
};

export function LawyerChecklist({
  caseId,
  items,
}: {
  caseId: string;
  items: ChecklistItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  async function handleVerify(
    itemId: string,
    status: string,
    feedback?: string,
  ) {
    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("status", status);
    if (feedback) formData.set("lawyerFeedback", feedback);
    await updateChecklistItem(formData);
    toast("Checklist updated", "success");
    router.refresh();
  }

  return (
    <ChecklistPanel
      items={items}
      caseId={caseId}
      mode="lawyer"
      onVerify={handleVerify}
    />
  );
}
