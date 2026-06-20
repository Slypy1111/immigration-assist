import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        {
          default: "bg-slate-900 text-white",
          secondary: "bg-slate-100 text-slate-900",
          success: "bg-green-100 text-green-800",
          warning: "bg-amber-100 text-amber-800",
          destructive: "bg-red-100 text-red-800",
        }[variant],
        className,
      )}
      {...props}
    />
  );
}
