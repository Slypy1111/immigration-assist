import Link from "next/link";
import { Scale, Briefcase, UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { isDevAuthMode } from "@/lib/auth/config";
import { isAuthenticated, getLoginUrl } from "@/lib/auth";
import { devLoginAs } from "@/lib/actions/dev-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DevLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  if (!isDevAuthMode()) {
    redirect("/sign-in");
  }

  const { redirect: redirectTo } = await searchParams;
  const loggedIn = await isAuthenticated();
  if (loggedIn) {
    redirect(redirectTo ?? "/lawyer");
  }

  async function loginAsLawyer() {
    "use server";
    await devLoginAs("lawyer", redirectTo);
  }

  async function loginAsClient() {
    "use server";
    await devLoginAs("client", redirectTo);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="mb-8 flex items-center gap-2 text-xl font-semibold text-[var(--primary)]">
        <Scale className="h-7 w-7" />
        ImmigrationAssist
      </div>

      <Card className="w-full max-w-md border-[var(--border)] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Development Login</CardTitle>
          <CardDescription>
            Dev Auth mode — no Clerk account required. Choose a role to explore
            the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={loginAsLawyer}>
            <Button type="submit" className="h-12 w-full justify-start gap-3">
              <Briefcase className="h-5 w-5" />
              Enter as Lawyer
            </Button>
          </form>
          <form action={loginAsClient}>
            <Button
              type="submit"
              variant="outline"
              className="h-12 w-full justify-start gap-3"
            >
              <UserCircle className="h-5 w-5" />
              Enter as Client
            </Button>
          </form>
          <p className="pt-2 text-center text-xs text-[var(--muted)]">
            Configure real Clerk keys and set{" "}
            <code className="rounded bg-[var(--surface)] px-1">AUTH_MODE=clerk</code>{" "}
            for production auth.
          </p>
        </CardContent>
      </Card>

      <Link
        href="/setup/clerk"
        className="mt-6 text-sm text-[var(--accent)] hover:underline"
      >
        Set up Clerk authentication →
      </Link>
    </div>
  );
}
