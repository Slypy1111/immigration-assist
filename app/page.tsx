import Link from "next/link";
import { redirect } from "next/navigation";
import { Scale, FileText, Users, Sparkles } from "lucide-react";
import {
  isAuthenticated,
  getLoginUrl,
  getCurrentAppUser,
  isLawyerRole,
} from "@/lib/auth";
import { isDevAuthMode } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HomePage() {
  if (await isAuthenticated()) {
    const user = await getCurrentAppUser();
    if (user && isLawyerRole(user.role)) {
      redirect("/lawyer");
    }
    redirect("/client");
  }

  const loginUrl = await getLoginUrl();
  const signUpUrl = isDevAuthMode() ? "/dev-login" : "/sign-up";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-[var(--primary)]">
            <Scale className="h-6 w-6" />
            ImmigrationAssist
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={loginUrl}>Sign In</Link>
            </Button>
            <Button asChild>
              <Link href={signUpUrl}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--primary)] sm:text-5xl">
            Australian Immigration
            <br />
            Lawyer Assistant
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            Manage visa cases, collect client documents, and generate
            AI-assisted drafts for Partner, TSS 482, and Student 500
            applications — with full lawyer review.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={signUpUrl}>Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={loginUrl}>Sign In</Link>
            </Button>
          </div>
          {isDevAuthMode() && (
            <p className="mt-4 text-sm text-[var(--accent)]">
              Dev mode active —{" "}
              <Link href="/dev-login" className="underline">
                quick login without Clerk
              </Link>
              {" · "}
              <Link href="/help" className="underline">
                lawyer guide
              </Link>
            </p>
          )}
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--card)] py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-[var(--accent)]" />
                <CardTitle className="text-lg">Case CRM</CardTitle>
                <CardDescription>
                  Track cases from intake through lodgement preparation
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-[var(--accent)]" />
                <CardTitle className="text-lg">Document Checklists</CardTitle>
                <CardDescription>
                  Visa-specific templates for Partner 820, TSS 482, Student 500
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-[var(--accent)]" />
                <CardTitle className="text-lg">AI Assistants</CardTitle>
                <CardDescription>
                  Specialist agents for drafting, checklists, and client comms
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Scale className="h-8 w-8 text-[var(--accent)]" />
                <CardTitle className="text-lg">Client Portal</CardTitle>
                <CardDescription>
                  Secure intake forms and document upload for clients
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
        AI-assisted drafts require lawyer review. No guarantee of visa approval.
      </footer>
    </div>
  );
}
