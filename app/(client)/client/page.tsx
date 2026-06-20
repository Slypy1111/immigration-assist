import Link from "next/link";
import { getClientCases, getCaseProgress } from "@/lib/actions/cases";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CaseStatusBadge, ProgressBar } from "@/components/case/case-status-badge";
import { formatDate } from "@/lib/utils";

export default async function ClientDashboardPage() {
  const cases = await getClientCases();

  const casesWithProgress = await Promise.all(
    cases.map(async (c) => ({
      ...c,
      progress: await getCaseProgress(c.id),
    })),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Your Cases</h1>
      <p className="text-slate-600">
        Complete your intake forms and upload required documents
      </p>

      <div className="mt-8 space-y-4">
        {casesWithProgress.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              No cases assigned yet. Your lawyer will invite you to a case.
            </CardContent>
          </Card>
        ) : (
          casesWithProgress.map((c) => (
            <Link key={c.id} href={`/client/cases/${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-sm text-slate-500">
                        {c.visaTemplate.name} · Updated {formatDate(c.updatedAt)}
                      </p>
                    </div>
                    <CaseStatusBadge status={c.status} />
                  </div>
                  <div className="mt-4">
                    <ProgressBar percentage={c.progress.percentage} />
                  </div>
                  {!c.intakeResponse?.completed && (
                    <p className="mt-2 text-sm text-amber-600">
                      Action required: Complete intake questionnaire
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
