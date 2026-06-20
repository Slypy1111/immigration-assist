import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    console.log("[Email Mock]", params.to, params.subject);
    return { success: true, id: "mock-email-id" };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function clientInviteEmail(params: {
  clientEmail: string;
  caseTitle: string;
  inviteUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Invitation: ${params.caseTitle} — Document Portal`,
    html: `
      <h2>You've been invited to a visa case portal</h2>
      <p>Your migration lawyer has opened a case: <strong>${params.caseTitle}</strong></p>
      <p>Please sign in to complete your intake questionnaire and upload required documents.</p>
      <p><a href="${params.inviteUrl}">Access Client Portal</a></p>
      <p><small>This is a secure portal for sharing visa application materials.</small></p>
    `,
  };
}

export function checklistReminderEmail(params: {
  clientEmail: string;
  caseTitle: string;
  pendingItems: string[];
  portalUrl: string;
}): { subject: string; html: string } {
  const itemsList = params.pendingItems.map((i) => `<li>${i}</li>`).join("");
  return {
    subject: `Action Required: Documents needed for ${params.caseTitle}`,
    html: `
      <h2>Documents Required</h2>
      <p>Your lawyer needs the following documents for <strong>${params.caseTitle}</strong>:</p>
      <ul>${itemsList}</ul>
      <p><a href="${params.portalUrl}">Upload Documents</a></p>
    `,
  };
}

export function messageNotificationEmail(params: {
  recipientEmail: string;
  caseTitle: string;
  senderName: string;
  preview: string;
  portalUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `New message: ${params.caseTitle}`,
    html: `
      <h2>New message from ${params.senderName}</h2>
      <p>Case: <strong>${params.caseTitle}</strong></p>
      <blockquote>${params.preview.slice(0, 300)}${params.preview.length > 300 ? "..." : ""}</blockquote>
      <p><a href="${params.portalUrl}">View in Portal</a></p>
    `,
  };
}

export function documentFeedbackEmail(params: {
  clientEmail: string;
  caseTitle: string;
  documentName: string;
  status: "VERIFIED" | "REJECTED";
  feedback?: string;
  portalUrl: string;
}): { subject: string; html: string } {
  const statusText =
    params.status === "VERIFIED"
      ? "has been verified"
      : "needs to be re-uploaded";
  return {
    subject: `Document ${params.status === "VERIFIED" ? "Verified" : "Rejected"}: ${params.documentName}`,
    html: `
      <h2>Document Update</h2>
      <p>Your document <strong>${params.documentName}</strong> for case <strong>${params.caseTitle}</strong> ${statusText}.</p>
      ${params.feedback ? `<p>Lawyer feedback: ${params.feedback}</p>` : ""}
      <p><a href="${params.portalUrl}">View in Portal</a></p>
    `,
  };
}
