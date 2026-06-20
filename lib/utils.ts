import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export const AI_DISCLAIMER =
  "AI-assisted draft — lawyer review required. This document does not guarantee visa approval.";

export const CASE_STATUS_LABELS: Record<string, string> = {
  INTAKE: "Intake",
  COLLECTING: "Collecting Documents",
  DRAFTING: "Drafting",
  REVIEW: "Under Review",
  READY: "Ready to Lodge",
};

export const CHECKLIST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  WAIVED: "Waived",
};
