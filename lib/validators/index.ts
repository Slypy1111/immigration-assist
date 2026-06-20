import { z } from "zod";

export const createCaseSchema = z.object({
  title: z.string().min(3).max(200),
  visaTemplateId: z.string().cuid(),
  clientEmail: z.string().email().optional(),
  assignedLawyerId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateCaseStatusSchema = z.object({
  caseId: z.string().cuid(),
  status: z.enum(["INTAKE", "COLLECTING", "DRAFTING", "REVIEW", "READY"]),
});

export const inviteClientSchema = z.object({
  caseId: z.string().cuid(),
  email: z.string().email(),
});

export const intakeUpdateSchema = z.object({
  caseId: z.string().cuid(),
  data: z.record(z.string(), z.unknown()),
  completed: z.boolean().optional(),
});

export const checklistUpdateSchema = z.object({
  itemId: z.string().cuid(),
  status: z.enum(["PENDING", "UPLOADED", "VERIFIED", "REJECTED", "WAIVED"]),
  lawyerFeedback: z.string().max(2000).optional(),
});

export const messageSchema = z.object({
  caseId: z.string().cuid(),
  content: z
    .preprocess(
      (val) => (typeof val === "string" ? val : String(val ?? "")).trim(),
      z.string().min(1).max(10000),
    ),
});

export const draftGenerateSchema = z.object({
  caseId: z.string().cuid(),
  draftType: z.string().min(1),
});

export const draftUpdateSchema = z.object({
  draftId: z.string().cuid(),
  content: z.string().min(1),
});

export const draftApproveSchema = z.object({
  draftId: z.string().cuid(),
});

export const uploadDocumentSchema = z.object({
  caseId: z.string().cuid(),
  checklistItemId: z.string().cuid().optional(),
});

export type IntakeField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "number";
  required?: boolean;
  options?: string[];
  step: number;
  placeholder?: string;
};

export type IntakeSchema = {
  steps: { id: number; title: string; description?: string }[];
  fields: IntakeField[];
};

export type DraftTypeConfig = {
  type: string;
  title: string;
  description: string;
  promptKey: string;
};
