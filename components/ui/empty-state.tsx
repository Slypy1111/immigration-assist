import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)]">
        <Icon className="h-7 w-7 text-[var(--accent)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--primary)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[var(--primary)]">{value}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--border)]",
        className,
      )}
    />
  );
}
