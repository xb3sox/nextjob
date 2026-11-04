import { createHash, randomUUID } from "node:crypto";

import { HttpStatusCode } from "@workspace/shared/constants";
import { HttpException } from "@workspace/shared/utils";

import type {
  applicationItemSchema,
  careerClaimItemSchema,
  careerEvidenceItemSchema,
  careerPreferencesSchema,
  careerRevisionItemSchema,
  jobWithFitSchema,
  reusableAnswerItemSchema,
  submissionReceiptSchema,
  tailoredDocumentItemSchema,
} from "../../schema/nextjob";
import type * as z from "zod";

export type CareerClaimItem = z.infer<typeof careerClaimItemSchema>;
export type CareerEvidenceItem = z.infer<typeof careerEvidenceItemSchema>;
export type CareerRevisionItem = z.infer<typeof careerRevisionItemSchema>;
export type CareerPreferences = z.infer<typeof careerPreferencesSchema>;
export type ReusableAnswerItem = z.infer<typeof reusableAnswerItemSchema>;
export type JobWithFitItem = z.infer<typeof jobWithFitSchema>;
export type TailoredDocumentItem = z.infer<typeof tailoredDocumentItemSchema>;
export type ApplicationItem = z.infer<typeof applicationItemSchema>;
export type SubmissionReceiptItem = z.infer<typeof submissionReceiptSchema>;

export interface RawJobListing {
  id: string;
  externalId: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  workMode: "remote" | "hybrid" | "on-site" | "any";
  employmentType: string;
  seniorityLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperienceYears: number | null;
  requiredEducation: string | null;
  sponsorshipAvailable: boolean | null;
  allowedCountries: string[];
  status: "active" | "expired";
  postedAt: string;
}

export interface UserCareerStore {
  userId: string;
  profile: {
    id: string;
    userId: string;
    headline: string;
    summary: string;
    location: string;
    yearsOfExperience: number;
  };
  claims: CareerClaimItem[];
  evidence: CareerEvidenceItem[];
  revisions: CareerRevisionItem[];
  preferences: CareerPreferences;
  reusableAnswers: ReusableAnswerItem[];
  savedJobIds: Set<string>;
  tailoredDocuments: TailoredDocumentItem[];
  applications: ApplicationItem[];
  receipts: SubmissionReceiptItem[];
}

export const computeSha256 = (payload: string): string => {
  return createHash("sha256").update(payload).digest("hex");
};

export const normalizeToken = (value: string): string => {
  return value.trim().toLowerCase().replace(/[^a-z0-9+#.\s-]/g, "");
};

export const computeJobFingerprint = (
  company: string,
  title: string,
  location: string,
): string => {
  const canonical = `${normalizeToken(company)}|${normalizeToken(title)}|${normalizeToken(location)}`;
  return computeSha256(canonical);
};

const INITIAL_PUBLIC_JOB_LISTINGS: RawJobListing[] = [
  {
    id: "job-remotive-101",
    externalId: "remotive-101",
    sourceName: "Remotive Public Feed",
    sourceUrl: "https://remotive.com/remote-jobs/software-dev/senior-full-stack-engineer-101",
    title: "Senior Full-Stack Engineer",
    company: "Acme Cloud Systems",
    location: "Remote (Global)",
    workMode: "remote",
    employmentType: "full-time",
    seniorityLevel: "Senior",
    salaryMin: 145000,
    salaryMax: 175000,
    salaryCurrency: "USD",
    description:
      "Lead architecture and delivery of distributed TypeScript, Next.js, Hono, and PostgreSQL services for enterprise customers. Build reliable automation workflows and high-throughput APIs.",
    requiredSkills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
    preferredSkills: ["Hono", "Drizzle", "Docker", "Playwright"],
    requiredExperienceYears: 5,
    requiredEducation: "Bachelor's in Computer Science or equivalent",
    sponsorshipAvailable: true,
    allowedCountries: ["Global", "US", "UK", "UAE", "DE", "CA"],
    status: "active",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-greenhouse-102",
    externalId: "greenhouse-102",
    sourceName: "Greenhouse Public Board",
    sourceUrl: "https://boards.greenhouse.io/AcmeCloudSystems/jobs/102",
    title: "Senior Full-Stack Engineer",
    company: "Acme Cloud Systems",
    location: "Remote (Global)",
    workMode: "remote",
    employmentType: "full-time",
    seniorityLevel: "Senior",
    salaryMin: 145000,
    salaryMax: 175000,
    salaryCurrency: "USD",
    description:
      "Duplicate cross-posted listing from Greenhouse for Senior Full-Stack Engineer at Acme Cloud Systems.",
    requiredSkills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
    preferredSkills: ["Hono", "Drizzle", "Docker"],
    requiredExperienceYears: 5,
    requiredEducation: "Bachelor's in Computer Science or equivalent",
    sponsorshipAvailable: true,
    allowedCountries: ["Global", "US", "UK", "UAE", "DE", "CA"],
    status: "active",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-lever-203",
    externalId: "lever-203",
    sourceName: "Lever Public Board",
    sourceUrl: "https://jobs.lever.co/novapay/staff-ai-platform-engineer-203",
    title: "Staff AI Platform Engineer",
    company: "NovaPay",
    location: "London, UK / Hybrid",
    workMode: "hybrid",
    employmentType: "full-time",
    seniorityLevel: "Staff",
    salaryMin: 160000,
    salaryMax: 195000,
    salaryCurrency: "USD",
    description:
      "Architect evidence-backed AI agents, evaluation harnesses, and low-latency TypeScript/Python microservices for regulated financial workflows.",
    requiredSkills: ["TypeScript", "Node.js", "PostgreSQL", "AI Agents"],
    preferredSkills: ["Python", "Kubernetes", "OpenTelemetry", "Zod"],
    requiredExperienceYears: 6,
    requiredEducation: "Bachelor's in Computer Science",
    sponsorshipAvailable: true,
    allowedCountries: ["UK", "UAE", "Global", "US"],
    status: "active",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-remotive-304",
    externalId: "remotive-304",
    sourceName: "Remotive Public Feed",
    sourceUrl: "https://remotive.com/remote-jobs/software-dev/principal-frontend-architect-304",
    title: "Principal Frontend Architect",
    company: "Orbit Design Labs",
    location: "Remote (EMEA & Americas)",
    workMode: "remote",
    employmentType: "full-time",
    seniorityLevel: "Principal",
    salaryMin: 155000,
    salaryMax: 185000,
    salaryCurrency: "USD",
    description:
      "Own our accessible WCAG 2.2 AA design system, RTL Arabic/English localization architecture, and Next.js App Router performance.",
    requiredSkills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Accessibility"],
    preferredSkills: ["Playwright", "Design Systems", "i18n"],
    requiredExperienceYears: 5,
    requiredEducation: null,
    sponsorshipAvailable: false,
    allowedCountries: ["Global", "US", "UK", "UAE"],
    status: "active",
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-greenhouse-405",
    externalId: "greenhouse-405",
    sourceName: "Greenhouse Public Board",
    sourceUrl: "https://boards.greenhouse.io/aegisdefense/jobs/405",
    title: "Embedded Rust Security Engineer",
    company: "Aegis Defense Systems",
    location: "Arlington, VA (On-site)",
    workMode: "on-site",
    employmentType: "full-time",
    seniorityLevel: "Senior",
    salaryMin: 170000,
    salaryMax: 210000,
    salaryCurrency: "USD",
    description:
      "Develop bare-metal Rust firmware for defense hardware. Active Top Secret clearance and on-site presence in Virginia required.",
    requiredSkills: ["Rust", "Embedded C", "RTOS", "Hardware Security"],
    preferredSkills: ["FPGA", "ARM TrustZone"],
    requiredExperienceYears: 8,
    requiredEducation: "Master's in Electrical Engineering or Computer Science",
    sponsorshipAvailable: false,
    allowedCountries: ["US-Citizen-Only"],
    status: "active",
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "job-remotive-506",
    externalId: "remotive-506",
    sourceName: "Remotive Public Feed",
    sourceUrl: "https://remotive.com/remote-jobs/software-dev/legacy-backend-developer-506",
    title: "Backend Node.js Engineer (Closed)",
    company: "Sunset Ventures",
    location: "Remote",
    workMode: "remote",
    employmentType: "full-time",
    seniorityLevel: "Mid",
    salaryMin: 110000,
    salaryMax: 130000,
    salaryCurrency: "USD",
    description:
      "Historical listing retained for application tracking continuity. This position has expired and is closed to new submissions.",
    requiredSkills: ["TypeScript", "Node.js", "PostgreSQL"],
    preferredSkills: ["Redis"],
    requiredExperienceYears: 3,
    requiredEducation: null,
    sponsorshipAvailable: true,
    allowedCountries: ["Global"],
    status: "expired",
    postedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const userStores = new Map<string, UserCareerStore>();
let globalJobCatalog: RawJobListing[] = [...INITIAL_PUBLIC_JOB_LISTINGS];

const createDefaultSeedForUser = (userId: string): UserCareerStore => {
  const profileId = `prof-${userId}`;
  const initialEvidenceId = `ev-seed-${userId}`;
  const now = new Date().toISOString();

  const claims: CareerClaimItem[] = [
    {
      id: `claim-summary-${userId}`,
      userId,
      profileId,
      evidenceId: initialEvidenceId,
      category: "summary",
      title: "Senior Full-Stack & AI Systems Engineer",
      organization: null,
      location: "Remote",
      startDate: null,
      endDate: null,
      isCurrent: true,
      description:
        "Senior Full-Stack Engineer with 6+ years building TypeScript, Next.js, Hono, and PostgreSQL platforms with evidence-backed AI workflows and WCAG 2.2 AA accessible interfaces.",
      skills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Hono"],
      metrics: ["Reduced application data entry time by 78%", "99.95% API uptime"],
      verificationStatus: "verified",
      confidence: 0.98,
      conflictWithClaimId: null,
      conflictDetails: null,
      updatedAt: now,
    },
    {
      id: `claim-exp-1-${userId}`,
      userId,
      profileId,
      evidenceId: initialEvidenceId,
      category: "experience",
      title: "Senior Software Engineer",
      organization: "CloudScale Technologies",
      location: "Remote",
      startDate: "2022-03",
      endDate: null,
      isCurrent: true,
      description:
        "Architected modular TypeScript monorepo services using Next.js App Router, Hono RPC, Drizzle ORM, and PostgreSQL serving 120,000+ monthly active users.",
      skills: ["TypeScript", "Next.js", "React", "Hono", "Drizzle", "PostgreSQL", "Tailwind CSS"],
      metrics: [
        "Improved p95 API latency by 42%",
        "Delivered bilingual English and Arabic RTL web platform",
      ],
      verificationStatus: "verified",
      confidence: 0.96,
      conflictWithClaimId: null,
      conflictDetails: null,
      updatedAt: now,
    },
    {
      id: `claim-exp-2-${userId}`,
      userId,
      profileId,
      evidenceId: initialEvidenceId,
      category: "experience",
      title: "Full-Stack Developer",
      organization: "FinEdge Solutions",
      location: "Dubai, UAE",
      startDate: "2019-06",
      endDate: "2022-02",
      isCurrent: false,
      description:
        "Built automated document parsing, Zod validation pipelines, and customer dashboards with React, Node.js, and PostgreSQL.",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Playwright"],
      metrics: ["Automated 15,000+ document verifications per month"],
      verificationStatus: "verified",
      confidence: 0.94,
      conflictWithClaimId: null,
      conflictDetails: null,
      updatedAt: now,
    },
    {
      id: `claim-edu-1-${userId}`,
      userId,
      profileId,
      evidenceId: initialEvidenceId,
      category: "education",
      title: "B.Sc. in Computer Science",
      organization: " Cairo University",
      location: "Cairo, Egypt",
      startDate: "2015-09",
      endDate: "2019-05",
      isCurrent: false,
      description: "Graduated with Honors in Software Engineering and Distributed Systems.",
      skills: ["Algorithms", "Distributed Systems", "Database Systems"],
      metrics: ["GPA 3.85/4.0"],
      verificationStatus: "verified",
      confidence: 0.99,
      conflictWithClaimId: null,
      conflictDetails: null,
      updatedAt: now,
    },
    {
      id: `claim-proj-1-${userId}`,
      userId,
      profileId,
      evidenceId: initialEvidenceId,
      category: "project",
      title: "Open-Source AI Evaluation & Policy Engine",
      organization: "Open Source",
      location: "Remote",
      startDate: "2024-01",
      endDate: null,
      isCurrent: true,
      description:
        "Created an evidence-constrained AI tailoring and eligibility verification toolkit with zero-fabrication guarantees and cryptographic SHA-256 receipts.",
      skills: ["TypeScript", "AI Agents", "Zod", "Accessibility"],
      metrics: ["114 automated eligibility evaluation benchmarks passing"],
      verificationStatus: "verified",
      confidence: 0.95,
      conflictWithClaimId: null,
      conflictDetails: null,
      updatedAt: now,
    },
    {
      id: `claim-unverified-1-${userId}`,
      userId,
      profileId,
      evidenceId: initialEvidenceId,
      category: "certification",
      title: "AWS Certified Solutions Architect – Associate",
      organization: "Amazon Web Services",
      location: "Online",
      startDate: "2023-08",
      endDate: "2026-08",
      isCurrent: true,
      description: "Extracted from imported resume header; awaiting user confirmation before use in tailored resumes.",
      skills: ["AWS", "Cloud Architecture", "Docker"],
      metrics: [],
      verificationStatus: "pending_review",
      confidence: 0.82,
      conflictWithClaimId: null,
      conflictDetails: null,
      updatedAt: now,
    },
  ];

  const evidence: CareerEvidenceItem[] = [
    {
      id: initialEvidenceId,
      userId,
      type: "resume_pdf",
      title: "Baseline_Career_Resume_2026.pdf",
      fileName: "Baseline_Career_Resume_2026.pdf",
      contentHash: computeSha256(`seed-resume-${userId}`),
      extractedFactCount: claims.length,
      conflictCount: 0,
      importedAt: now,
    },
  ];

  const revisions: CareerRevisionItem[] = [
    {
      id: `rev-init-${userId}`,
      userId,
      claimId: `claim-exp-1-${userId}`,
      action: "import",
      actor: "system_import",
      reason: "Initial career profile baseline imported and verified.",
      previousValue: null,
      newValue: {
        title: "Senior Software Engineer",
        organization: "CloudScale Technologies",
        verificationStatus: "verified",
      },
      createdAt: now,
    },
  ];

  const preferences: CareerPreferences = {
    targetRoles: [
      "Senior Full-Stack Engineer",
      "Staff AI Platform Engineer",
      "Principal Frontend Architect",
    ],
    locations: ["Remote", "Dubai, UAE", "London, UK"],
    workModes: ["remote", "hybrid"],
    minSalary: 140000,
    maxSalary: 195000,
    currency: "USD",
    seniorityLevels: ["Senior", "Staff", "Principal"],
    employmentTypes: ["full-time"],
    excludedCompanies: ["Sunset Ventures"],
    excludedKeywords: ["Cold Calling", "Unpaid Internship"],
    requireApprovalBeforeSubmit: true,
    requireApprovalForProfileChanges: true,
    workAuthorizationCountries: ["Global", "UAE", "UK", "US"],
    requiresSponsorship: false,
  };

  const reusableAnswers: ReusableAnswerItem[] = [
    {
      id: `ans-1-${userId}`,
      userId,
      questionCategory: "Work Authorization",
      questionPattern: "Are you legally authorized to work remotely for global distributed teams?",
      verifiedAnswer:
        "Yes, I am authorized for remote global employment and contractor engagements, and I can relocate or travel as needed.",
      isApprovedForReuse: true,
      updatedAt: now,
    },
    {
      id: `ans-2-${userId}`,
      userId,
      questionCategory: "Architecture Experience",
      questionPattern: "Describe a production system you architected end-to-end.",
      verifiedAnswer:
        "At CloudScale Technologies, I led the migration to a modular TypeScript monorepo with Next.js App Router, Hono RPC, Drizzle ORM, and PostgreSQL, cutting p95 API latency by 42%.",
      isApprovedForReuse: true,
      updatedAt: now,
    },
  ];

  return {
    userId,
    profile: {
      id: profileId,
      userId,
      headline: "Senior Full-Stack & AI Systems Engineer",
      summary:
        "Senior Full-Stack Engineer with 6+ years building TypeScript, Next.js, Hono, and PostgreSQL platforms with evidence-backed AI workflows and WCAG 2.2 AA accessible interfaces.",
      location: "Remote / Dubai, UAE",
      yearsOfExperience: 6,
    },
    claims,
    evidence,
    revisions,
    preferences,
    reusableAnswers,
    savedJobIds: new Set(["job-remotive-101"]),
    tailoredDocuments: [],
    applications: [],
    receipts: [],
  };
};

export const getUserStore = (userId: string): UserCareerStore => {
  if (!userId || userId.trim().length === 0) {
    throw new HttpException(HttpStatusCode.UNAUTHORIZED, {
      code: "error.unauthorized",
      message: "Authenticated user ID is required.",
    });
  }

  let store = userStores.get(userId);
  if (!store) {
    store = createDefaultSeedForUser(userId);
    userStores.set(userId, store);
  }
  return store;
};

/**
 * Enforces strict multi-tenant user isolation (Section 10 Negative Authorization Gate).
 * Throws 403 Forbidden if an actor attempts to read or mutate another user's record.
 */
export const assertResourceOwnership = (
  authenticatedUserId: string,
  resourceOwnerUserId: string,
  resourceName = "resource",
): void => {
  if (authenticatedUserId !== resourceOwnerUserId) {
    throw new HttpException(HttpStatusCode.FORBIDDEN, {
      code: "error.forbidden",
      message: `Access denied: cannot access ${resourceName} owned by another user.`,
    });
  }
};

export const getGlobalJobCatalog = (): RawJobListing[] => {
  return globalJobCatalog;
};

export const upsertGlobalJobListings = (listings: RawJobListing[]): number => {
  let addedCount = 0;
  for (const listing of listings) {
    const existingIndex = globalJobCatalog.findIndex(
      (item) => item.id === listing.id || item.externalId === listing.externalId,
    );
    if (existingIndex >= 0) {
      globalJobCatalog[existingIndex] = listing;
    } else {
      globalJobCatalog.unshift(listing);
      addedCount += 1;
    }
  }
  return addedCount;
};

export const resetStoreForTesting = (): void => {
  userStores.clear();
  globalJobCatalog = [...INITIAL_PUBLIC_JOB_LISTINGS];
};

export const createId = (prefix: string): string => {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
};
