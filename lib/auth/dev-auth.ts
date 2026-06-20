import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { AppUser } from "@/lib/auth/types";
import { DEV_AUTH_COOKIE } from "@/lib/auth/config";

export type DevAuthRole = "lawyer" | "client";

const DEV_USERS: Record<
  DevAuthRole,
  { clerkId: string; email: string; firstName: string; lastName: string; role: UserRole }
> = {
  lawyer: {
    clerkId: "dev-lawyer",
    email: "lawyer@dev.local",
    firstName: "Dev",
    lastName: "Lawyer",
    role: UserRole.LAWYER,
  },
  client: {
    clerkId: "dev-client",
    email: "client@dev.local",
    firstName: "Dev",
    lastName: "Client",
    role: UserRole.CLIENT,
  },
};

async function getOrCreateOrganization() {
  let organization = await prisma.organization.findFirst({
    where: { name: "Default Law Firm" },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: { id: "default-org", name: "Default Law Firm" },
    });
  }

  return organization;
}

export async function getDevAuthRole(): Promise<DevAuthRole | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(DEV_AUTH_COOKIE)?.value;
  if (value === "lawyer" || value === "client") return value;
  return null;
}

export async function syncDevUser(): Promise<AppUser | null> {
  const devRole = await getDevAuthRole();
  if (!devRole) return null;

  const profile = DEV_USERS[devRole];
  const organization = await getOrCreateOrganization();

  const user = await prisma.user.upsert({
    where: { clerkId: profile.clerkId },
    update: {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
    },
    create: {
      clerkId: profile.clerkId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
      organizationId: organization.id,
    },
  });

  return user;
}

export async function ensureDevUsersSeeded(): Promise<void> {
  const organization = await getOrCreateOrganization();
  for (const profile of Object.values(DEV_USERS)) {
    await prisma.user.upsert({
      where: { clerkId: profile.clerkId },
      update: {},
      create: {
        ...profile,
        organizationId: organization.id,
      },
    });
  }
}
