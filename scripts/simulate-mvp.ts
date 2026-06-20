import {
  PrismaClient,
  UserRole,
  CaseStatus,
  ChecklistItemStatus,
  DraftStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== MVP Simulation ===");

  let org = await prisma.organization.findFirst({
    where: { name: "Default Law Firm" },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { id: "default-org", name: "Default Law Firm" },
    });
  }

  const lawyer = await prisma.user.upsert({
    where: { clerkId: "dev-lawyer" },
    update: {},
    create: {
      clerkId: "dev-lawyer",
      email: "lawyer@dev.local",
      firstName: "Dev",
      lastName: "Lawyer",
      role: UserRole.LAWYER,
      organizationId: org.id,
    },
  });

  const client = await prisma.user.upsert({
    where: { clerkId: "dev-client" },
    update: {},
    create: {
      clerkId: "dev-client",
      email: "client@dev.local",
      firstName: "Dev",
      lastName: "Client",
      role: UserRole.CLIENT,
      organizationId: org.id,
    },
  });

  const template = await prisma.visaTemplate.findUnique({
    where: { code: "partner-820" },
    include: { checklistItems: true },
  });
  if (!template) throw new Error("Template not found — run npm run db:seed first");

  const caseRecord = await prisma.case.create({
    data: {
      title: "Demo - Smith Partner Visa 820",
      organizationId: org.id,
      visaTemplateId: template.id,
      assignedLawyerId: lawyer.id,
      clientEmail: client.email,
      status: CaseStatus.COLLECTING,
      members: {
        create: [{ userId: lawyer.id }, { userId: client.id }],
      },
      intakeResponse: {
        create: {
          completed: true,
          data: {
            applicantFullName: "John Smith",
            applicantNationality: "United Kingdom",
            sponsorFullName: "Jane Smith",
            howMet: "We met at a work conference in Melbourne in March 2020.",
            relationshipMilestones:
              "Moved in together January 2021. Engaged December 2023.",
            futurePlans: "Build life together in Sydney.",
          },
        },
      },
      checklistItems: {
        create: template.checklistItems.map((item) => ({
          templateItemId: item.id,
          title: item.title,
          description: item.description,
          required: item.required,
          sortOrder: item.sortOrder,
          status: item.title.includes("Passport")
            ? ChecklistItemStatus.VERIFIED
            : ChecklistItemStatus.PENDING,
        })),
      },
    },
    include: { checklistItems: true },
  });

  await prisma.message.create({
    data: {
      caseId: caseRecord.id,
      senderId: client.id,
      content:
        "Hi, I have uploaded my passport. Please let me know what else you need.",
    },
  });

  const draft = await prisma.draft.create({
    data: {
      caseId: caseRecord.id,
      draftType: "relationship_statement",
      title: "Relationship Statement",
      status: DraftStatus.DRAFT,
      versions: {
        create: {
          content: `# Relationship Statement (Mock AI Draft)

I, John Smith, met Jane Smith at a conference in Melbourne...

[NEEDS CLIENT INPUT]: exact cohabitation address dates

---
*AI-assisted draft — lawyer review required.*`,
          modelUsed: "mock",
          createdById: lawyer.id,
        },
      },
    },
  });

  console.log("Lawyer:", lawyer.email);
  console.log("Client:", client.email);
  console.log("Case ID:", caseRecord.id);
  console.log("Lawyer URL:", `http://localhost:3000/lawyer/cases/${caseRecord.id}`);
  console.log("Client URL:", `http://localhost:3000/client/cases/${caseRecord.id}`);
  console.log("Draft ID:", draft.id);
  console.log("=== Simulation data ready ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
