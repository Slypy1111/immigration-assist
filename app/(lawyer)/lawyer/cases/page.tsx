import Link from "next/link";
import { Plus } from "lucide-react";
import { getLawyerCases } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CaseStatusBadge } from "@/components/case/case-status-badge";
import { formatDate } from "@/lib/utils";

export default async function CasesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const cases = await getLawyerCases(status);

  const statuses = ["INTAKE", "COLLECTING", "DRAFTING", "REVIEW", "READY"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cases</h1>
        <Button asChild>
          <Link href="/lawyer/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/lawyer/cases"
          className={`rounded-full px-3 py-1 text-sm ${
            !status ? "bg-slate-900 text-white" : "bg-slate-100"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/lawyer/cases?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm ${
              status === s ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              No cases found.
            </CardContent>
          </Card>
        ) : (
          cases.map((c) => (
            <Link key={c.id} href={`/lawyer/cases/${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-slate-500">
                      {c.visaTemplate.name}
                      {c.clientEmail && ` · ${c.clientEmail}`}
                      {" · "}
                      {formatDate(c.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">
                      {c._count.documents} docs · {c._count.drafts} drafts
                    </span>
                    <CaseStatusBadge status={c.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
