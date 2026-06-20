"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChecklistStatusBadge } from "@/components/case/case-status-badge";

type ChecklistItem = {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  status: string;
  lawyerFeedback: string | null;
};

type Props = {
  items: ChecklistItem[];
  caseId: string;
  onUpload?: (itemId: string, file: File) => Promise<void>;
  onVerify?: (itemId: string, status: string, feedback?: string) => Promise<void>;
  mode: "client" | "lawyer";
};

export function ChecklistPanel({
  items,
  caseId,
  onUpload,
  onVerify,
  mode,
}: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  async function handleFileChange(itemId: string, file: File) {
    if (!onUpload) return;
    setUploading(itemId);
    try {
      await onUpload(itemId, file);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-medium">
                {item.title}
                {item.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </h4>
              {item.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {item.description}
                </p>
              )}
              {item.lawyerFeedback && (
                <p className="mt-2 text-sm text-amber-700">
                  Lawyer feedback: {item.lawyerFeedback}
                </p>
              )}
            </div>
            <ChecklistStatusBadge status={item.status} />
          </div>

          {mode === "client" &&
            (item.status === "PENDING" || item.status === "REJECTED") &&
            onUpload && (
              <div className="mt-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(item.id, file);
                  }}
                  disabled={uploading === item.id}
                  className="text-sm"
                />
                {uploading === item.id && (
                  <span className="ml-2 text-sm text-slate-500">
                    Uploading...
                  </span>
                )}
              </div>
            )}

          {mode === "lawyer" &&
            (item.status === "UPLOADED" || item.status === "VERIFIED") &&
            onVerify && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Feedback (optional)"
                  value={feedback[item.id] ?? ""}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  className="rounded border border-slate-200 px-2 py-1 text-sm"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    onVerify(item.id, "VERIFIED", feedback[item.id])
                  }
                >
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    onVerify(item.id, "REJECTED", feedback[item.id])
                  }
                >
                  Reject
                </Button>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
