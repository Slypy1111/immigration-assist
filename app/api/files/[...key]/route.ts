import { NextRequest, NextResponse } from "next/server";
import { syncUserFromClerk, userHasCaseAccess } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  try {
    const user = await syncUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key } = await params;
    const fileKey = key.map(decodeURIComponent).join("/");

    const document = await prisma.document.findFirst({
      where: { fileKey },
    });

    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const hasAccess = await userHasCaseAccess(
      user.id,
      document.caseId,
      user.role,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await readStoredFile(fileKey);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `inline; filename="${document.fileName}"`,
      },
    });
  } catch (error) {
    console.error("File read error:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
