"use client";

import { useRouter } from "next/navigation";
import { ChecklistPanel } from "@/components/checklist/checklist-panel";

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  status: string;
  lawyerFeedback: string | null;
};

export function ClientChecklist({
  caseId,
  items,
}: {
  caseId: string;
  items: ChecklistItem[];
}) {
  const router = useRouter();

  async function handleUpload(itemId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caseId", caseId);
    formData.append("checklistItemId", itemId);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error ?? "Upload failed");
    }

    router.refresh();
  }

  return (
    <ChecklistPanel
      items={items}
      caseId={caseId}
      mode="client"
      onUpload={handleUpload}
    />
  );
}
