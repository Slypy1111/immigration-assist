import { NextRequest, NextResponse } from "next/server";
import { syncUserFromClerk, userHasCaseAccess } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  storeFile,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  assertUploadStorageAvailable,
} from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const user = await syncUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caseId = formData.get("caseId") as string;
    const checklistItemId = formData.get("checklistItemId") as string | null;

    if (!file || !caseId) {
      return NextResponse.json({ error: "Missing file or caseId" }, { status: 400 });
    }

    const hasAccess = await userHasCaseAccess(user.id, caseId, user.role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      assertUploadStorageAvailable();
    } catch (storageError) {
      const message =
        storageError instanceof Error ? storageError.message : "Upload not configured";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileKey, fileSize } = await storeFile(
      buffer,
      file.name,
      file.type,
      caseId,
    );

    let extractedText: string | null = null;
    if (file.type === "application/pdf") {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedText = result.text.slice(0, 50000);
        await parser.destroy();
      } catch {
        extractedText = null;
      }
    }

    const document = await prisma.document.create({
      data: {
        caseId,
        checklistItemId: checklistItemId || null,
        fileName: file.name,
        fileKey,
        mimeType: file.type,
        fileSize,
        extractedText,
        uploadedById: user.id,
      },
    });

    if (checklistItemId) {
      await prisma.caseChecklistItem.update({
        where: { id: checklistItemId },
        data: { status: "UPLOADED" },
      });
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
