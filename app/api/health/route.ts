import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "connected",
      authMode: process.env.AUTH_MODE ?? "dev",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      {
        ok: false,
        db: "disconnected",
        hint: "Check DATABASE_URL in .env — use a permanent Neon PostgreSQL connection string.",
        error: message,
      },
      { status: 503 },
    );
  }
}
