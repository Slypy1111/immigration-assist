import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { syncUserFromClerk, isLawyerRole, getLoginUrl } from "@/lib/auth";
import { LawyerSidebar } from "@/components/layout/lawyer-sidebar";

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await syncUserFromClerk();
  if (!user) redirect(await getLoginUrl());

  if (user.role === UserRole.CLIENT) {
    redirect("/client");
  }

  if (!isLawyerRole(user.role)) {
    redirect("/client");
  }

  return (
    <div className="flex min-h-screen">
      <LawyerSidebar
        userName={
          [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
        }
        userRole={user.role}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
