import Link from "next/link";
import { Scale } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth/config";
import { DevUserMenu } from "@/components/layout/dev-user-menu";
import { ClerkUserMenu } from "@/components/layout/clerk-user-menu";

export function ClientNav({ userName }: { userName: string }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/client"
          className="flex items-center gap-2 font-semibold text-[var(--primary)]"
        >
          <Scale className="h-6 w-6" />
          <span>Client Portal</span>
        </Link>
        {isClerkConfigured() ? (
          <ClerkUserMenu />
        ) : (
          <DevUserMenu name={userName} role="CLIENT" />
        )}
      </div>
    </header>
  );
}
