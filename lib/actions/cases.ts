"use server";

import { revalidatePath } from "next/cache";
import { UserRole, Prisma } from "@prisma/client";
import {
  requireLawyerUser,
  syncUserFromClerk,
  userHasCaseAccess,
} from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  createCaseSchema,
  updateCaseStatusSchema,
  inviteClientSchema,
  intakeUpdateSchema,
  checklistUpdateSchema,
  messageSchema,
} from "@/lib/validators";
import {
  sendEmail,
  clientInviteEmail,
  checklistReminderEmail,
  messageNotificationEmail,
  documentFeedbackEmail,
} from "@/lib/email";

export async function ensureUserSynced() {
  return syncUserFromClerk();
}

export async function getVisaTemplates() {
  await syncUserFromClerk();
  return prisma.visaTemplate.findMany({
    include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function createCase(formData: FormData) {
  const user = await requireLawyerUser();

  const parsed = createCaseSchema.parse({
    title: formData.get("title"),
    visaTemplateId: formData.get("visaTemplateId"),
    clientEmail: formData.get("clientEmail") || undefined,
    dueDate: formData.get("dueDate")
      ? new Date(formData.get("dueDate") as string).toISOString()
      : undefined,
  });

  const template = await prisma.visaTemplate.findUnique({
    where: { id: parsed.visaTemplateId },
    include: { checklistItems: { orderBy: { sortOrder: "asc" } } },
  });

  if (!template) throw new Error("Visa template not found");

  const caseRecord = await prisma.case.create({
    data: {
      title: parsed.title,
      visaTemplateId: parsed.visaTemplateId,
      organizationId: user.organizationId,
      assignedLawyerId: user.id,
      clientEmail: parsed.clientEmail,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      members: { create: { userId: user.id } },
      intakeResponse: { create: { data: {} } },
      checklistItems: {
        create: template.checklistItems.map((item) => ({
          templateItemId: item.id,
          title: item.title,
          description: item.description,
          required: item.required,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  revalidatePath("/lawyer/cases");
  return caseRecord;
}

export async function getLawyerCases(status?: string) {
  const user = await requireLawyerUser();

  return prisma.case.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      visaTemplate: true,
      assignedLawyer: true,
      _count: { select: { checklistItems: true, documents: true, drafts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCaseById(caseId: string) {
  const user = await syncUserFromClerk();
  if (!user) throw new Error("Unauthorized");

  const hasAccess = await userHasCaseAccess(user.id, caseId, user.role);
  if (!hasAccess) throw new Error("Forbidden");

  return prisma.case.findUnique({
    where: { id: caseId },
    include: {
      visaTemplate: true,
      assignedLawyer: true,
      members: { include: { user: true } },
      checklistItems: { orderBy: { sortOrder: "asc" }, include: { documents: true } },
      documents: { orderBy: { createdAt: "desc" } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      },
      intakeResponse: true,
      drafts: {
        include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function updateCaseStatus(formData: FormData) {
  const user = await requireLawyerUser();
  const parsed = updateCaseStatusSchema.parse({
    caseId: formData.get("caseId"),
    status: formData.get("status"),
  });

  await prisma.case.update({
    where: { id: parsed.caseId, organizationId: user.organizationId },
    data: { status: parsed.status },
  });

  revalidatePath(`/lawyer/cases/${parsed.caseId}`);
}

export async function inviteClient(formData: FormData) {
  const user = await requireLawyerUser();
  const parsed = inviteClientSchema.parse({
    caseId: formData.get("caseId"),
    email: formData.get("email"),
  });

  const caseRecord = await prisma.case.findFirst({
    where: { id: parsed.caseId, organizationId: user.organizationId },
  });
  if (!caseRecord) throw new Error("Case not found");

  await prisma.case.update({
    where: { id: parsed.caseId },
    data: { clientEmail: parsed.email },
  });

  let clientUser = await prisma.user.findFirst({
    where: { email: parsed.email, organizationId: user.organizationId },
  });

  if (!clientUser) {
    clientUser = await prisma.user.create({
      data: {
        clerkId: `pending-${parsed.email}-${Date.now()}`,
        email: parsed.email,
        role: UserRole.CLIENT,
        organizationId: user.organizationId,
      },
    });
  }

  await prisma.caseMember.upsert({
    where: { caseId_userId: { caseId: parsed.caseId, userId: clientUser.id } },
    update: {},
    create: { caseId: parsed.caseId, userId: clientUser.id },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/client/cases/${parsed.caseId}`;
  const emailContent = clientInviteEmail({
    clientEmail: parsed.email,
    caseTitle: caseRecord.title,
    inviteUrl,
  });

  await sendEmail({
    to: parsed.email,
    ...emailContent,
  });

  revalidatePath(`/lawyer/cases/${parsed.caseId}`);
}

export async function updateIntake(formData: FormData) {
  const user = await syncUserFromClerk();
  if (!user) throw new Error("Unauthorized");

  const parsed = intakeUpdateSchema.parse({
    caseId: formData.get("caseId"),
    data: JSON.parse(formData.get("data") as string),
    completed: formData.get("completed") === "true",
  });

  const hasAccess = await userHasCaseAccess(user.id, parsed.caseId, user.role);
  if (!hasAccess) throw new Error("Forbidden");

  await prisma.intakeResponse.upsert({
    where: { caseId: parsed.caseId },
    update: {
      data: parsed.data as Prisma.InputJsonValue,
      completed: parsed.completed ?? false,
    },
    create: {
      caseId: parsed.caseId,
      data: parsed.data as Prisma.InputJsonValue,
      completed: parsed.completed ?? false,
    },
  });

  if (parsed.completed) {
    await prisma.case.update({
      where: { id: parsed.caseId },
      data: { status: "COLLECTING" },
    });
  }

  revalidatePath(`/client/cases/${parsed.caseId}`);
  revalidatePath(`/lawyer/cases/${parsed.caseId}`);
}

export async function updateChecklistItem(formData: FormData) {
  const user = await requireLawyerUser();
  const parsed = checklistUpdateSchema.parse({
    itemId: formData.get("itemId"),
    status: formData.get("status"),
    lawyerFeedback: formData.get("lawyerFeedback") || undefined,
  });

  const item = await prisma.caseChecklistItem.findUnique({
    where: { id: parsed.itemId },
    include: { case: true, documents: true },
  });
  if (!item || item.case.organizationId !== user.organizationId) {
    throw new Error("Not found");
  }

  await prisma.caseChecklistItem.update({
    where: { id: parsed.itemId },
    data: {
      status: parsed.status,
      lawyerFeedback: parsed.lawyerFeedback,
    },
  });

  if (
    (parsed.status === "VERIFIED" || parsed.status === "REJECTED") &&
    item.case.clientEmail
  ) {
    const docName = item.documents[0]?.fileName ?? item.title;
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/client/cases/${item.caseId}`;
    const emailContent = documentFeedbackEmail({
      clientEmail: item.case.clientEmail,
      caseTitle: item.case.title,
      documentName: docName,
      status: parsed.status,
      feedback: parsed.lawyerFeedback,
      portalUrl,
    });
    await sendEmail({ to: item.case.clientEmail, ...emailContent });
  }

  revalidatePath(`/lawyer/cases/${item.caseId}`);
  revalidatePath(`/client/cases/${item.caseId}`);
}

export async function sendMessage(formData: FormData) {
  const user = await syncUserFromClerk();
  if (!user) throw new Error("Unauthorized");

  const parsed = messageSchema.parse({
    caseId: formData.get("caseId"),
    content: formData.get("content"),
  });

  const hasAccess = await userHasCaseAccess(user.id, parsed.caseId, user.role);
  if (!hasAccess) throw new Error("Forbidden");

  const caseRecord = await prisma.case.findUnique({
    where: { id: parsed.caseId },
    include: { members: { include: { user: true } } },
  });
  if (!caseRecord) throw new Error("Case not found");

  await prisma.message.create({
    data: {
      caseId: parsed.caseId,
      senderId: user.id,
      content: parsed.content,
    },
  });

  const senderName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const portalBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  for (const member of caseRecord.members) {
    if (member.userId === user.id) continue;
    const emailContent = messageNotificationEmail({
      recipientEmail: member.user.email,
      caseTitle: caseRecord.title,
      senderName,
      preview: parsed.content,
      portalUrl: `${portalBase}/${member.user.role === UserRole.CLIENT ? "client" : "lawyer"}/cases/${parsed.caseId}`,
    });
    await sendEmail({ to: member.user.email, ...emailContent });
  }

  revalidatePath(`/lawyer/cases/${parsed.caseId}`);
  revalidatePath(`/client/cases/${parsed.caseId}`);
}

export async function sendChecklistReminder(caseId: string) {
  const user = await requireLawyerUser();

  const caseRecord = await prisma.case.findFirst({
    where: { id: caseId, organizationId: user.organizationId },
    include: {
      checklistItems: {
        where: { status: "PENDING", required: true },
      },
    },
  });

  if (!caseRecord?.clientEmail) throw new Error("No client email");

  const pendingItems = caseRecord.checklistItems.map((i) => i.title);
  if (pendingItems.length === 0) return;

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/client/cases/${caseId}`;
  const emailContent = checklistReminderEmail({
    clientEmail: caseRecord.clientEmail,
    caseTitle: caseRecord.title,
    pendingItems,
    portalUrl,
  });

  await sendEmail({ to: caseRecord.clientEmail, ...emailContent });
}

export async function getClientCases() {
  const user = await syncUserFromClerk();
  if (!user) throw new Error("Unauthorized");

  return prisma.case.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      visaTemplate: true,
      checklistItems: true,
      intakeResponse: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCaseProgress(caseId: string) {
  const items = await prisma.caseChecklistItem.findMany({
    where: { caseId },
  });

  const required = items.filter((i) => i.required);
  const completed = required.filter(
    (i) => i.status === "VERIFIED" || i.status === "WAIVED",
  );

  return {
    total: required.length,
    completed: completed.length,
    percentage: required.length
      ? Math.round((completed.length / required.length) * 100)
      : 0,
  };
}
