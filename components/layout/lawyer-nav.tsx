"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Scale } from "lucide-react";

export function LawyerNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/lawyer" className="flex items-center gap-2 font-semibold">
            <Scale className="h-6 w-6" />
            <span>ImmigrationAssist</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="/lawyer" className="text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link
              href="/lawyer/cases"
              className="text-slate-600 hover:text-slate-900"
            >
              Cases
            </Link>
          </nav>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
