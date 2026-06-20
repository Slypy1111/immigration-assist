"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProgressBar } from "@/components/case/case-status-badge";
import type { IntakeSchema } from "@/lib/validators";
import { updateIntake } from "@/lib/actions/cases";
import { useToast } from "@/components/ui/toast";

type Props = {
  caseId: string;
  schema: IntakeSchema;
  initialData: Record<string, unknown>;
  completed: boolean;
  readOnly?: boolean;
};

export function IntakeForm({
  caseId,
  schema,
  initialData,
  completed,
  readOnly = false,
}: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { toast } = useToast();

  const currentStep = schema.steps.find((s) => s.id === step);
  const stepFields = schema.fields.filter((f) => f.step === step);
  const totalSteps = schema.steps.length;
  const progressPercent = Math.round((step / totalSteps) * 100);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("caseId", caseId);
      formData.set("data", JSON.stringify(data));
      await updateIntake(formData);
      setLastSaved(new Date().toLocaleTimeString());
    } catch {
      toast("Failed to auto-save", "error");
    } finally {
      setSaving(false);
    }
  }, [caseId, data, toast]);

  useEffect(() => {
    if (readOnly || completed) return;
    const timer = setTimeout(() => {
      if (Object.keys(data).length > 0) saveDraft();
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, readOnly, completed, saveDraft]);

  async function handleSave(markComplete = false) {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("caseId", caseId);
      formData.set("data", JSON.stringify(data));
      if (markComplete) formData.set("completed", "true");
      await updateIntake(formData);
      toast(markComplete ? "Intake completed!" : "Saved", "success");
      setLastSaved(new Date().toLocaleTimeString());
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-[var(--primary)]">
            Step {step} of {totalSteps}
          </span>
          {lastSaved && (
            <span className="text-[var(--muted)]">
              {saving ? "Saving..." : `Saved at ${lastSaved}`}
            </span>
          )}
        </div>
        <ProgressBar percentage={progressPercent} />
      </div>

      <div className="flex gap-2">
        {schema.steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              step === s.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--border)]"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {currentStep && (
        <div>
          <h3 className="text-lg font-medium">{currentStep.title}</h3>
          {currentStep.description && (
            <p className="text-sm text-[var(--muted)]">
              {currentStep.description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {stepFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.key}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={readOnly}
                rows={4}
              />
            ) : field.type === "select" && field.options ? (
              <select
                id={field.key}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                disabled={readOnly}
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={field.key}
                type={field.type === "number" ? "number" : field.type}
                value={(data[field.key] as string) ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={readOnly}
              />
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Previous
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            Save Draft
          </Button>
          {step === totalSteps && !completed && (
            <Button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              Complete Intake
            </Button>
          )}
        </div>
      )}

      {completed && (
        <p className="text-sm text-[var(--success)]">Intake completed.</p>
      )}
    </div>
  );
}
