import { getAuthMode, isClerkKeyInvalid } from "@/lib/auth/config";

export function logAuthModeOnStartup(): void {
  const mode = getAuthMode();
  if (mode === "dev") {
    console.warn(
      "[ImmigrationAssist] Auth mode: DEV — using /dev-login (no Clerk required)",
    );
    return;
  }

  if (isClerkKeyInvalid()) {
    console.error(
      "[ImmigrationAssist] AUTH_MODE=clerk but Clerk keys are invalid. Visit /setup/clerk",
    );
    return;
  }

  console.info("[ImmigrationAssist] Auth mode: CLERK");
}
