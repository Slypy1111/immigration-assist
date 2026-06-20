"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { devLogout } from "@/lib/actions/dev-auth";

export function DevUserMenu({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-md bg-[var(--surface)] px-3 py-1.5 text-sm">
        <User className="h-4 w-4 text-[var(--muted)]" />
        <span className="font-medium">{name}</span>
        <span className="text-[var(--muted)]">({role})</span>
      </div>
      <form action={devLogout}>
        <Button type="submit" variant="ghost" size="icon" title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
