"use client";

import { UserButton } from "@clerk/nextjs";

export function ClerkUserMenu() {
  return (
    <div className="flex justify-center">
      <UserButton />
    </div>
  );
}
