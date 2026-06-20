"use client";

import { CASE_STATUS_LABELS, cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = ["INTAKE", "COLLECTING", "DRAFTING", "REVIEW", "READY"] as const;

export function CaseWorkflowStepper({
  currentStatus,
  className,
}: {
  currentStatus: string;
  className?: string;
}) {
  const currentIndex = STEPS.indexOf(currentStatus as (typeof STEPS)[number]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete || isCurrent
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--border)]",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isComplete &&
                      "border-[var(--accent)] bg-[var(--accent)] text-white",
                    isCurrent &&
                      "border-[var(--accent)] bg-[var(--card)] text-[var(--accent)]",
                    !isComplete &&
                      !isCurrent &&
                      "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]",
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete ? "bg-[var(--accent)]" : "bg-[var(--border)]",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-center text-xs sm:block",
                  isCurrent
                    ? "font-semibold text-[var(--accent)]"
                    : "text-[var(--muted)]",
                )}
              >
                {CASE_STATUS_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
