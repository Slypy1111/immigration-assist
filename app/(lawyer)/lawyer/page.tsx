import Link from "next/link";
import { Plus, AlertCircle, Briefcase } from "lucide-react";
import { getLawyerCases } from "@/lib/actions/cases";
import { getNeedsAttention } from "@/lib/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CaseStatusBadge } from "@/components/case/case-status-badge";
import { EmptyState, StatCard } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default async function LawyerDashboardPage() {
  const [cases, attention] = await Promise.all([
    getLawyerCases(),
    getNeedsAttention(),
  ]);

  const stats = {
    total: cases.length,
    intake: cases.filter((c) => c.status === "INTAKE").length,
    collecting: cases.filter((c) => c.status === "COLLECTING").length,
    drafting: cases.filter((c) => c.status === "DRAFTING").length,
  };

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">Dashboard</h1>
          <p className="text-[var(--muted)]">
            Overview of your immigration cases
          </p>
        </div>
        <Button asChild>
          <Link href="/lawyer/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Cases" value={stats.total} />
        <StatCard label="Intake" value={stats.intake} />
        <StatCard label="Collecting" value={stats.collecting} />
        <StatCard label="Drafting" value={stats.drafting} />
      </div>

      {attention.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--primary)]">
            <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
            Needs Attention
          </h2>
          <div className="space-y-2">
            {attention.map((item, i) => (
              <Link key={`${item.caseId}-${item.type}-${i}`} href={`/lawyer/cases/${item.caseId}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{item.caseTitle}</p>
                      <p className="text-sm text-[var(--muted)]">{item.message}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--primary)]">
          Recent Cases
        </h2>
        {cases.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No cases yet"
            description="Create your first immigration case to start collecting client documents and generating AI-assisted drafts."
            actionLabel="Create your first case"
            actionHref="/lawyer/cases/new"
          />
        ) : (
          <div className="space-y-3">
            {cases.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/lawyer/cases/${c.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {c.visaTemplate.name} · Updated {formatDate(c.updatedAt)}
                      </p>
                    </div>
                    <CaseStatusBadge status={c.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
