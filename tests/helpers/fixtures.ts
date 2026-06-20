import type { IntakeSchema } from "@/lib/validators";
import {
  buildContextPack,
  resolvePromptKey,
  type ContextPackInput,
} from "@/lib/ai/context-builder";
import type {
  Case,
  CaseChecklistItem,
  Document,
  IntakeResponse,
  VisaTemplate,
} from "@prisma/client";

export { buildContextPack, resolvePromptKey };

export function createTestContextInput(
  overrides: Partial<ContextPackInput> = {},
): ContextPackInput {
  const visaTemplate: VisaTemplate = {
    id: "template-1",
    organizationId: null,
    code: "partner-820",
    name: "Partner Visa (820/801)",
    description: "Test template",
    intakeSchema: {
      steps: [{ id: 1, title: "Personal" }],
      fields: [
        {
          key: "applicantFullName",
          label: "Applicant Full Name",
          type: "text",
          required: true,
          step: 1,
        },
        {
          key: "howMet",
          label: "How did you meet?",
          type: "textarea",
          step: 1,
        },
      ],
    } as IntakeSchema,
    draftTypes: [
      {
        type: "relationship_statement",
        title: "Relationship Statement",
        promptKey: "relationship_statement",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const caseRecord: Case & { visaTemplate: VisaTemplate } = {
    id: "case-1",
    organizationId: "org-1",
    visaTemplateId: "template-1",
    title: "Smith - Partner Visa",
    status: "COLLECTING",
    assignedLawyerId: "lawyer-1",
    clientEmail: "client@example.com",
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    visaTemplate,
  };

  const intake: IntakeResponse = {
    id: "intake-1",
    caseId: "case-1",
    data: {
      applicantFullName: "John Smith",
      howMet: "We met at a conference in Sydney in 2019.",
    },
    completed: true,
    updatedAt: new Date(),
  };

  const checklistItems: CaseChecklistItem[] = [
    {
      id: "item-1",
      caseId: "case-1",
      templateItemId: null,
      title: "Passport",
      description: null,
      required: true,
      status: "VERIFIED",
      lawyerFeedback: null,
      sortOrder: 1,
    },
  ];

  const documents: Document[] = [
    {
      id: "doc-1",
      caseId: "case-1",
      checklistItemId: "item-1",
      fileName: "passport.pdf",
      fileKey: "cases/case-1/passport.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      extractedText: "Passport bio page text content.",
      uploadedById: "client-1",
      createdAt: new Date(),
    },
  ];

  return {
    caseRecord,
    intake,
    checklistItems,
    documents,
    draftType: "relationship_statement",
    promptKey: "relationship_statement",
    ...overrides,
  };
}
