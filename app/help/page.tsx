import Link from "next/link";
import { Scale, Briefcase, UserCircle, FileUp, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isDevAuthMode } from "@/lib/auth/config";

export default function HelpPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isDev = isDevAuthMode();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[var(--primary)]">
            <Scale className="h-6 w-6" />
            ImmigrationAssist
          </Link>
          <Button variant="outline" asChild>
            <Link href={isDev ? "/dev-login" : "/sign-in"}>Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-[var(--primary)]">Lawyer & Client Guide</h1>
        <p className="mt-2 text-[var(--muted)]">
          No software to install — use this link in any modern browser:{" "}
          <a href={appUrl} className="text-[var(--accent)] underline">
            {appUrl}
          </a>
        </p>

        <section className="mt-10 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                For lawyers
              </CardTitle>
              <CardDescription>Case management and client collaboration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--foreground)]">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Open <strong>{appUrl}</strong>
                  {isDev ? (
                    <> → click <strong>Enter as Lawyer</strong> on the dev login page</>
                  ) : (
                    <> → sign in with your firm account</>
                  )}
                </li>
                <li>
                  <strong>New case:</strong> Dashboard → New Case → choose visa template → add
                  client email
                </li>
                <li>
                  <strong>Invite client:</strong> Case detail → Invite tab → enter client email
                </li>
                <li>
                  <strong>Review documents:</strong> Checklist tab → verify or reject uploads
                </li>
                <li>
                  <strong>AI drafts:</strong> Drafts tab → generate → review → Approve
                </li>
                <li>
                  <strong>AI assistants:</strong> AI Assistants tab for checklist and comms help
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="h-5 w-5" />
                For clients
              </CardTitle>
              <CardDescription>Complete your visa application materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Use the <strong>same link</strong> as your lawyer: {appUrl}
                </li>
                <li>
                  {isDev ? (
                    <>Click <strong>Enter as Client</strong> (demo) or sign in if your firm uses Clerk</>
                  ) : (
                    <>Sign in with the email your lawyer invited</>
                  )}
                </li>
                <li>
                  Open your case → follow the <strong>3-step guide</strong>:
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" /> Step 1: Complete intake form
                    </li>
                    <li className="flex items-center gap-2">
                      <FileUp className="h-4 w-4" /> Step 2: Upload required documents
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Step 3: Message your lawyer
                    </li>
                  </ul>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Document uploads (important)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--muted)]">
              <p>
                If document upload fails on the hosted site, your administrator may need to
                configure cloud storage (S3 / Cloudflare R2). Intake forms, messages, and AI
                drafts work without uploads.
              </p>
              <p className="mt-2">
                Supported formats: PDF, JPEG, PNG, Word (.doc / .docx). Max 10 MB per file.
              </p>
            </CardContent>
          </Card>
        </section>

        <p className="mt-10 text-center text-xs text-[var(--muted)]">
          AI-assisted drafts require lawyer review. No guarantee of visa approval.
        </p>
      </main>
    </div>
  );
}
