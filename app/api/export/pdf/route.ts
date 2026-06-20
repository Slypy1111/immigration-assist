import { NextRequest, NextResponse } from "next/server";
import { syncUserFromClerk, userHasCaseAccess } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { AI_DISCLAIMER } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await syncUserFromClerk();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draftId = request.nextUrl.searchParams.get("draftId");
    if (!draftId) {
      return NextResponse.json({ error: "Missing draftId" }, { status: 400 });
    }

    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      include: {
        case: { include: { visaTemplate: true } },
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!draft) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const hasAccess = await userHasCaseAccess(
      user.id,
      draft.caseId,
      user.role,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const content = draft.versions[0]?.content ?? "";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${draft.title} - ${draft.case.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1 { font-size: 1.5em; border-bottom: 2px solid #333; padding-bottom: 8px; }
    h2 { font-size: 1.2em; margin-top: 24px; }
    .disclaimer { font-size: 0.8em; color: #666; border-top: 1px solid #ccc; margin-top: 40px; padding-top: 12px; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 24px; }
    pre { white-space: pre-wrap; font-family: Georgia, serif; }
  </style>
</head>
<body>
  <h1>${draft.title}</h1>
  <div class="meta">
    Case: ${draft.case.title} | Visa: ${draft.case.visaTemplate.name} |
    Status: ${draft.status}
  </div>
  <pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  <div class="disclaimer">${AI_DISCLAIMER}</div>
  <script>window.print()</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
