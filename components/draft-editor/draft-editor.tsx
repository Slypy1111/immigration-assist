"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AI_DISCLAIMER } from "@/lib/utils";
import { saveDraftVersion, approveDraft, saveGeneratedDraft } from "@/lib/actions/drafts";

type DraftType = {
  type: string;
  title: string;
  description: string;
};

type Draft = {
  id: string;
  draftType: string;
  title: string;
  status: string;
  versions: Array<{ content: string; createdAt: Date }>;
};

type Props = {
  caseId: string;
  draftTypes: DraftType[];
  existingDrafts: Draft[];
};

export function DraftEditor({ caseId, draftTypes, existingDrafts }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleGenerate(draftType: string) {
    setSelectedType(draftType);
    setGenerating(true);
    setMessage("");
    setContent("");

    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, draftType }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setContent(fullText);
        }
      }

      const saved = await saveGeneratedDraft(caseId, draftType, fullText);
      setDraftId(saved.draftId);

      setMessage("Draft generated. Review and save before approving.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Generation failed",
      );
    } finally {
      setGenerating(false);
    }
  }

  function loadExisting(draft: Draft) {
    setSelectedType(draft.draftType);
    setDraftId(draft.id);
    setContent(draft.versions[0]?.content ?? "");
  }

  async function handleSave() {
    if (!draftId) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("draftId", draftId);
      formData.set("content", content);
      await saveDraftVersion(formData);
      setMessage("Version saved.");
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!draftId) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("draftId", draftId);
      await approveDraft(formData);
      setMessage("Draft approved.");
    } catch {
      setMessage("Failed to approve.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        {AI_DISCLAIMER}
      </div>

      <div>
        <h3 className="mb-3 font-medium">Generate New Draft</h3>
        <div className="flex flex-wrap gap-2">
          {draftTypes.map((dt) => (
            <Button
              key={dt.type}
              variant="outline"
              size="sm"
              onClick={() => handleGenerate(dt.type)}
              disabled={generating}
            >
              {generating && selectedType === dt.type
                ? "Generating..."
                : dt.title}
            </Button>
          ))}
        </div>
      </div>

      {existingDrafts.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium">Existing Drafts</h3>
          <div className="flex flex-wrap gap-2">
            {existingDrafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => loadExisting(draft)}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                {draft.title}
                <Badge
                  variant={
                    draft.status === "APPROVED" ? "success" : "secondary"
                  }
                >
                  {draft.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {(content || selectedType) && (
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            {draftId && (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  Save Version
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleApprove}
                  disabled={saving}
                >
                  Approve Draft
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`/api/export/pdf?draftId=${draftId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Export PDF
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
