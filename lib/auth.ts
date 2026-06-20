import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { isClerkConfigured, isDevAuthMode } from "@/lib/auth/config";
import { syncDevUser, getDevAuthRole } from "@/lib/auth/dev-auth";
import type { AppUser } from "@/lib/auth/types";

export type { AppUser } from "@/lib/auth/types";

export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (isDevAuthMode()) {
    return syncDevUser();
  }

  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkId: userId },
  });
}

export async function requireAppUser(): Promise<AppUser> {
  const user = await getCurrentAppUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireLawyerUser(): Promise<AppUser> {
  const user = await requireAppUser();
  if (user.role !== UserRole.LAWYER && user.role !== UserRole.PARALEGAL) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function syncUserFromClerk(): Promise<AppUser | null> {
  if (isDevAuthMode()) {
    return syncDevUser();
  }
  return syncClerkUser();
}

async function syncClerkUser(): Promise<AppUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ??
    clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) return null;

  let organization = await prisma.organization.findFirst({
    where: { name: "Default Law Firm" },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: { name: "Default Law Firm" },
    });
  }

  const lawyerCount = await prisma.user.count({
    where: {
      organizationId: organization.id,
      role: { in: [UserRole.LAWYER, UserRole.PARALEGAL] },
    },
  });

  const roleFromMetadata = clerkUser.publicMetadata?.role as
    | UserRole
    | undefined;

  const role =
    roleFromMetadata ??
    (lawyerCount === 0 ? UserRole.LAWYER : UserRole.CLIENT);

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role,
      organizationId: organization.id,
    },
  });
}

export async function isAuthenticated(): Promise<boolean> {
  if (isDevAuthMode()) {
    const role = await getDevAuthRole();
    return role !== null;
  }

  const { userId } = await auth();
  return userId !== null;
}

export async function getLoginUrl(): Promise<string> {
  return isDevAuthMode() ? "/dev-login" : "/sign-in";
}

export async function userHasCaseAccess(
  userId: string,
  caseId: string,
  role: UserRole,
): Promise<boolean> {
  if (role === UserRole.LAWYER || role === UserRole.PARALEGAL) {
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        OR: [
          { assignedLawyerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });
    return !!caseRecord;
  }

  const membership = await prisma.caseMember.findUnique({
    where: { caseId_userId: { caseId, userId } },
  });
  return !!membership;
}

export function isLawyerRole(role: UserRole): boolean {
  return role === UserRole.LAWYER || role === UserRole.PARALEGAL;
}

export { isClerkConfigured, isDevAuthMode } from "@/lib/auth/config";
