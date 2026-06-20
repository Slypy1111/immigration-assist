import Link from "next/link";
import { Scale, ExternalLink } from "lucide-react";
import { isClerkKeyInvalid, isDevAuthMode } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClerkSetupPage() {
  if (!isClerkKeyInvalid() && !isDevAuthMode()) {
    redirect("/lawyer");
  }

  const steps = [
    {
      step: 1,
      title: "Create a Clerk application",
      description: "Sign up at clerk.com and create a new application.",
      link: "https://dashboard.clerk.com/sign-up",
    },
    {
      step: 2,
      title: "Copy your API keys",
      description:
        "From Clerk Dashboard → API Keys, copy the Publishable key and Secret key.",
    },
    {
      step: 3,
      title: "Update your .env file",
      description: `Set AUTH_MODE=clerk and paste your keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`,
    },
    {
      step: 4,
      title: "Restart the dev server",
      description: "Run npm run dev again and sign in via /sign-in.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-2 text-xl font-semibold text-[var(--primary)]">
          <Scale className="h-7 w-7" />
          Clerk Setup Required
        </div>

        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            Clerk publishable key is missing or invalid. Use Dev Auth for local
            testing, or complete the steps below for production authentication.
          </CardContent>
        </Card>

        <div className="space-y-4">
          {steps.map((item) => (
            <Card key={item.step}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-sm text-white">
                    {item.step}
                  </span>
                  {item.title}
                </CardTitle>
                <CardDescription className="whitespace-pre-line pl-9">
                  {item.description}
                </CardDescription>
              </CardHeader>
              {item.link && (
                <CardContent className="pl-9">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
                  >
                    Open Clerk Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/dev-login"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Use Dev Login instead
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface)]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
