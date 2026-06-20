"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function AuthProvider({
  useClerk,
  children,
}: {
  useClerk: boolean;
  children: React.ReactNode;
}) {
  if (useClerk) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <>{children}</>;
}
