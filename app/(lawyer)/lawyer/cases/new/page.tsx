import Link from "next/link";
import { redirect } from "next/navigation";
import { getVisaTemplates, createCase } from "@/lib/actions/cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewCasePage() {
  const templates = await getVisaTemplates();

  async function handleCreate(formData: FormData) {
    "use server";
    const caseRecord = await createCase(formData);
    redirect(`/lawyer/cases/${caseRecord.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/lawyer/cases" className="text-sm text-slate-500 hover:underline">
          ← Back to Cases
        </Link>
        <h1 className="mt-2 text-2xl font-bold">New Case</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Immigration Case</CardTitle>
          <CardDescription>
            Select a visa type and enter client details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Smith - Partner Visa 820"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visaTemplateId">Visa Type</Label>
              <select
                id="visaTemplateId"
                name="visaTemplateId"
                required
                className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              >
                <option value="">Select visa type...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email (optional)</Label>
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                placeholder="client@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Target Due Date (optional)</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>

            <Button type="submit">Create Case</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
