import { redirect } from "next/navigation";
import { syncUserFromClerk, isLawyerRole, getLoginUrl } from "@/lib/auth";
import { ClientNav } from "@/components/layout/client-nav";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await syncUserFromClerk();
  if (!user) redirect(await getLoginUrl());

  if (isLawyerRole(user.role)) {
    redirect("/lawyer");
  }

  return (
    <>
      <ClientNav
        userName={
          [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
        }
      />
      <main className="flex-1">{children}</main>
    </>
  );
}
