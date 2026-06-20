import type { UserRole } from "@prisma/client";

export type AppUser = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  organizationId: string;
};
