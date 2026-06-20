import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Scale,
} from "lucide-react";
import { isClerkConfigured } from "@/lib/auth/config";
import { DevUserMenu } from "@/components/layout/dev-user-menu";
import { ClerkUserMenu } from "@/components/layout/clerk-user-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/lawyer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lawyer/cases", label: "Cases", icon: Briefcase },
];

export function LawyerSidebar({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--primary)] text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <Scale className="h-6 w-6 text-[var(--accent)]" />
        <span className="font-semibold">ImmigrationAssist</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-3">
        <Link
          href="/help"
          className="block text-xs text-white/60 hover:text-white underline"
        >
          Lawyer & client guide
        </Link>
        {isClerkConfigured() ? (
          <ClerkUserMenu />
        ) : (
          <DevUserMenu name={userName} role={userRole} />
        )}
      </div>
    </aside>
  );
}
