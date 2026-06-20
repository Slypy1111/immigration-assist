import { PrismaClient } from "@prisma/client";
import type { IntakeSchema, DraftTypeConfig } from "../lib/validators";

const prisma = new PrismaClient();

const partner820Intake: IntakeSchema = {
  steps: [
    { id: 1, title: "Personal Details", description: "Applicant information" },
    { id: 2, title: "Relationship", description: "Relationship history" },
    { id: 3, title: "Immigration History", description: "Previous visas and travel" },
  ],
  fields: [
    { key: "applicantFullName", label: "Applicant Full Name", type: "text", required: true, step: 1 },
    { key: "applicantDateOfBirth", label: "Date of Birth", type: "date", required: true, step: 1 },
    { key: "applicantNationality", label: "Nationality", type: "text", required: true, step: 1 },
    { key: "sponsorFullName", label: "Sponsor Full Name", type: "text", required: true, step: 1 },
    { key: "relationshipStartDate", label: "Relationship Start Date", type: "date", required: true, step: 2 },
    { key: "howMet", label: "How did you meet?", type: "textarea", required: true, step: 2 },
    { key: "cohabitationStart", label: "Cohabitation Start Date", type: "date", step: 2 },
    { key: "relationshipMilestones", label: "Key Relationship Milestones", type: "textarea", required: true, step: 2 },
    { key: "financialArrangements", label: "Financial Arrangements", type: "textarea", step: 2 },
    { key: "futurePlans", label: "Future Plans in Australia", type: "textarea", required: true, step: 2 },
    { key: "previousVisas", label: "Previous Australian Visas", type: "textarea", step: 3 },
    { key: "immigrationHistory", label: "Other Immigration History", type: "textarea", step: 3 },
  ],
};

const partner820Drafts: DraftTypeConfig[] = [
  { type: "relationship_statement", title: "Relationship Statement", description: "Applicant relationship statement", promptKey: "relationship_statement" },
  { type: "relationship_timeline", title: "Relationship Timeline", description: "Chronological relationship timeline", promptKey: "relationship_timeline" },
  { type: "sponsor_statement", title: "Sponsor Statement", description: "Sponsor's statement", promptKey: "sponsor_statement" },
  { type: "cover_letter", title: "Cover Letter", description: "Application cover letter", promptKey: "cover_letter" },
];

const tss482Intake: IntakeSchema = {
  steps: [
    { id: 1, title: "Applicant Details", description: "Personal information" },
    { id: 2, title: "Employment", description: "Nominated position details" },
    { id: 3, title: "Qualifications", description: "Skills and experience" },
  ],
  fields: [
    { key: "applicantFullName", label: "Applicant Full Name", type: "text", required: true, step: 1 },
    { key: "applicantDateOfBirth", label: "Date of Birth", type: "date", required: true, step: 1 },
    { key: "passportNumber", label: "Passport Number", type: "text", required: true, step: 1 },
    { key: "employerName", label: "Employer Name", type: "text", required: true, step: 2 },
    { key: "employerABN", label: "Employer ABN", type: "text", step: 2 },
    { key: "nominatedPosition", label: "Nominated Position", type: "text", required: true, step: 2 },
    { key: "anzscoCode", label: "ANZSCO Code", type: "text", step: 2 },
    { key: "salary", label: "Annual Salary (AUD)", type: "number", step: 2 },
    { key: "employmentStartDate", label: "Proposed Employment Start", type: "date", step: 2 },
    { key: "qualifications", label: "Qualifications", type: "textarea", required: true, step: 3 },
    { key: "workExperience", label: "Relevant Work Experience", type: "textarea", required: true, step: 3 },
    { key: "skillsSummary", label: "Key Skills", type: "textarea", required: true, step: 3 },
  ],
};

const tss482Drafts: DraftTypeConfig[] = [
  { type: "employer_support_letter", title: "Employer Support Letter", description: "Draft employer nomination letter", promptKey: "employer_support_letter" },
  { type: "skills_experience_summary", title: "Skills & Experience Summary", description: "Applicant skills summary", promptKey: "skills_experience_summary" },
  { type: "cover_letter", title: "Cover Letter", description: "Application cover letter", promptKey: "cover_letter" },
];

const student500Intake: IntakeSchema = {
  steps: [
    { id: 1, title: "Personal Details", description: "Applicant information" },
    { id: 2, title: "Course Details", description: "Study plans in Australia" },
    { id: 3, title: "GTE Factors", description: "Genuine Temporary Entrant factors" },
  ],
  fields: [
    { key: "applicantFullName", label: "Applicant Full Name", type: "text", required: true, step: 1 },
    { key: "applicantDateOfBirth", label: "Date of Birth", type: "date", required: true, step: 1 },
    { key: "homeCountry", label: "Home Country", type: "text", required: true, step: 1 },
    { key: "institutionName", label: "Institution Name", type: "text", required: true, step: 2 },
    { key: "courseName", label: "Course Name", type: "text", required: true, step: 2 },
    { key: "courseDuration", label: "Course Duration", type: "text", required: true, step: 2 },
    { key: "courseStartDate", label: "Course Start Date", type: "date", required: true, step: 2 },
    { key: "tuitionFees", label: "Tuition Fees (AUD)", type: "number", step: 2 },
    { key: "homeCountryCircumstances", label: "Circumstances in Home Country", type: "textarea", required: true, step: 3 },
    { key: "courseValue", label: "Value of Course to Future", type: "textarea", required: true, step: 3 },
    { key: "immigrationHistory", label: "Immigration History", type: "textarea", step: 3 },
    { key: "returnIntent", label: "Intent to Return Home", type: "textarea", required: true, step: 3 },
  ],
};

const student500Drafts: DraftTypeConfig[] = [
  { type: "gte_statement", title: "GTE Statement", description: "Genuine Temporary Entrant statement", promptKey: "gte_statement" },
  { type: "cover_letter", title: "Cover Letter", description: "Application cover letter", promptKey: "cover_letter" },
];

const templates = [
  {
    code: "partner-820",
    name: "Partner Visa (820/801)",
    description: "Temporary and permanent partner visa for onshore applicants",
    intakeSchema: partner820Intake,
    draftTypes: partner820Drafts,
    checklist: [
      { title: "Passport (Applicant)", description: "Bio page and any visa stamps", required: true, sortOrder: 1 },
      { title: "Passport (Sponsor)", description: "Bio page — Australian citizen or PR", required: true, sortOrder: 2 },
      { title: "Birth Certificate (Applicant)", required: true, sortOrder: 3 },
      { title: "Evidence of Relationship", description: "Photos, messages, joint accounts, leases", required: true, sortOrder: 4 },
      { title: "Cohabitation Evidence", description: "Joint lease, utility bills, mail", required: true, sortOrder: 5 },
      { title: "Statutory Declarations", description: "Form 888 from friends/family", required: false, sortOrder: 6 },
      { title: "Police Certificates", description: "From each country lived 12+ months since 16", required: true, sortOrder: 7 },
      { title: "Health Examination", description: "Completed health exam results", required: true, sortOrder: 8 },
    ],
  },
  {
    code: "tss-482",
    name: "TSS Visa (482)",
    description: "Temporary Skill Shortage visa — employer sponsored",
    intakeSchema: tss482Intake,
    draftTypes: tss482Drafts,
    checklist: [
      { title: "Passport", description: "Bio page and visa history", required: true, sortOrder: 1 },
      { title: "Skills Assessment", description: "If required for occupation", required: false, sortOrder: 2 },
      { title: "Qualifications", description: "Degrees, certificates, transcripts", required: true, sortOrder: 3 },
      { title: "Employment References", description: "Reference letters from previous employers", required: true, sortOrder: 4 },
      { title: "CV / Resume", required: true, sortOrder: 5 },
      { title: "English Test Results", description: "IELTS, PTE, etc.", required: true, sortOrder: 6 },
      { title: "Police Certificates", required: true, sortOrder: 7 },
      { title: "Employment Contract", description: "Signed contract with sponsoring employer", required: true, sortOrder: 8 },
    ],
  },
  {
    code: "student-500",
    name: "Student Visa (500)",
    description: "Temporary visa to study in Australia",
    intakeSchema: student500Intake,
    draftTypes: student500Drafts,
    checklist: [
      { title: "Passport", required: true, sortOrder: 1 },
      { title: "Confirmation of Enrolment (CoE)", required: true, sortOrder: 2 },
      { title: "GTE Supporting Documents", description: "Evidence supporting GTE claims", required: true, sortOrder: 3 },
      { title: "Financial Evidence", description: "Bank statements, sponsorship letters", required: true, sortOrder: 4 },
      { title: "English Test Results", required: true, sortOrder: 5 },
      { title: "Academic Transcripts", required: true, sortOrder: 6 },
      { title: "Overseas Student Health Cover (OSHC)", required: true, sortOrder: 7 },
      { title: "Health Examination", required: false, sortOrder: 8 },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.upsert({
    where: { id: "default-org" },
    update: {},
    create: { id: "default-org", name: "Default Law Firm" },
  });

  for (const template of templates) {
    const visaTemplate = await prisma.visaTemplate.upsert({
      where: { code: template.code },
      update: {
        name: template.name,
        description: template.description,
        intakeSchema: template.intakeSchema,
        draftTypes: template.draftTypes,
      },
      create: {
        code: template.code,
        name: template.name,
        description: template.description,
        intakeSchema: template.intakeSchema,
        draftTypes: template.draftTypes,
        organizationId: org.id,
      },
    });

    await prisma.checklistItemTemplate.deleteMany({
      where: { visaTemplateId: visaTemplate.id },
    });

    for (const item of template.checklist) {
      await prisma.checklistItemTemplate.create({
        data: {
          visaTemplateId: visaTemplate.id,
          title: item.title,
          description: item.description,
          required: item.required,
          sortOrder: item.sortOrder,
        },
      });
    }

    console.log(`  Seeded template: ${template.name}`);
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
