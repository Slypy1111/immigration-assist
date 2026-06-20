"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_AUTH_COOKIE, isDevAuthMode } from "@/lib/auth/config";
import { ensureDevUsersSeeded } from "@/lib/auth/dev-auth";

export async function devLoginAs(role: "lawyer" | "client", redirectTo?: string) {
  if (!isDevAuthMode()) {
    throw new Error("Dev auth is not enabled");
  }

  await ensureDevUsersSeeded();

  const cookieStore = await cookies();
  cookieStore.set(DEV_AUTH_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (role === "lawyer") {
    redirect(redirectTo ?? "/lawyer");
  }
  redirect(redirectTo ?? "/client");
}

export async function devLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_AUTH_COOKIE);
  redirect("/dev-login");
}
