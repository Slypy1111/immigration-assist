export type AuthMode = "dev" | "clerk";

export const DEV_AUTH_COOKIE = "dev-auth-role";

export function getAuthMode(): AuthMode {
  if (process.env.AUTH_MODE === "dev") return "dev";
  if (process.env.AUTH_MODE === "clerk") return "clerk";

  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (
    !key ||
    key.includes("placeholder") ||
    key.includes("your_key") ||
    (!key.startsWith("pk_test_") && !key.startsWith("pk_live_"))
  ) {
    return "dev";
  }

  return "clerk";
}

export function isClerkConfigured(): boolean {
  return getAuthMode() === "clerk";
}

export function isDevAuthMode(): boolean {
  return getAuthMode() === "dev";
}

export function isClerkKeyInvalid(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    !key ||
    key.includes("placeholder") ||
    key.includes("your_key") ||
    (!key.startsWith("pk_test_") && !key.startsWith("pk_live_"))
  );
}
