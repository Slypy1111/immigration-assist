import { CASE_STATUS_LABELS, CHECKLIST_STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CaseStatusBadge({ status }: { status: string }) {
  const variant =
    status === "READY"
      ? "success"
      : status === "REVIEW"
        ? "warning"
        : "secondary";

  return (
    <Badge variant={variant}>
      {CASE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function ChecklistStatusBadge({ status }: { status: string }) {
  const variant =
    status === "VERIFIED"
      ? "success"
      : status === "REJECTED"
        ? "destructive"
        : status === "UPLOADED"
          ? "warning"
          : "secondary";

  return (
    <Badge variant={variant}>
      {CHECKLIST_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function ProgressBar({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-sm text-slate-600">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-slate-900 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
