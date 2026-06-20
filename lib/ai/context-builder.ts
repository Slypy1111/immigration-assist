import { createHash } from "crypto";
import type { Case, IntakeResponse, VisaTemplate, Document, CaseChecklistItem } from "@prisma/client";
import type { IntakeSchema } from "@/lib/validators";
import { getPromptForType, SYSTEM_PROMPT } from "./prompts";

export type ContextPackInput = {
  caseRecord: Case & { visaTemplate: VisaTemplate };
  intake: IntakeResponse | null;
  checklistItems: CaseChecklistItem[];
  documents: Document[];
  draftType: string;
  promptKey: string;
};

export type ContextPack = {
  systemPrompt: string;
  userPrompt: string;
  promptHash: string;
  metadata: {
    visaType: string;
    caseTitle: string;
    draftType: string;
  };
};

function formatIntakeData(
  intake: IntakeResponse | null,
  schema: IntakeSchema,
): string {
  if (!intake || !intake.data) return "No intake data provided yet.";

  const data = intake.data as Record<string, unknown>;
  const lines: string[] = [];

  for (const field of schema.fields) {
    const value = data[field.key];
    const display =
      value === undefined || value === null || value === ""
        ? "[NOT PROVIDED]"
        : String(value);
    lines.push(`- ${field.label}: ${display}`);
  }

  return lines.join("\n");
}

function formatChecklistSummary(items: CaseChecklistItem[]): string {
  if (items.length === 0) return "No checklist items.";

  return items
    .map(
      (item) =>
        `- ${item.title} [${item.status}]${item.required ? " (required)" : ""}`,
    )
    .join("\n");
}

function formatDocumentExcerpts(documents: Document[]): string {
  const withText = documents.filter((d) => d.extractedText);
  if (withText.length === 0) return "No verified document text available.";

  return withText
    .map(
      (doc) =>
        `### ${doc.fileName}\n${doc.extractedText!.slice(0, 3000)}${doc.extractedText!.length > 3000 ? "\n[truncated]" : ""}`,
    )
    .join("\n\n");
}

export function buildContextPack(input: ContextPackInput): ContextPack {
  const { caseRecord, intake, checklistItems, documents, draftType, promptKey } =
    input;

  const intakeSchema = caseRecord.visaTemplate.intakeSchema as IntakeSchema;
  const taskPrompt = getPromptForType(promptKey);

  const userPrompt = `# Document Draft Request

## Case Information
- Case: ${caseRecord.title}
- Visa Type: ${caseRecord.visaTemplate.name} (${caseRecord.visaTemplate.code})
- Document Type: ${draftType}

## Client Intake Responses
${formatIntakeData(intake, intakeSchema)}

## Document Checklist Status
${formatChecklistSummary(checklistItems)}

## Verified Document Excerpts
${formatDocumentExcerpts(documents)}

## Task
${taskPrompt}

Remember: Use ONLY the information above. Insert [NEEDS CLIENT INPUT] for any missing required details.`;

  const promptHash = createHash("sha256")
    .update(userPrompt)
    .digest("hex")
    .slice(0, 16);

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    promptHash,
    metadata: {
      visaType: caseRecord.visaTemplate.code,
      caseTitle: caseRecord.title,
      draftType,
    },
  };
}

export function resolvePromptKey(
  visaTemplate: VisaTemplate,
  draftType: string,
): string {
  const draftTypes = visaTemplate.draftTypes as Array<{
    type: string;
    promptKey: string;
  }>;
  const match = draftTypes.find((d) => d.type === draftType);
  return match?.promptKey ?? "cover_letter";
}
