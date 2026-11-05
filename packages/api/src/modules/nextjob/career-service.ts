import { HttpStatusCode } from "@workspace/shared/constants";
import { HttpException } from "@workspace/shared/utils";

import {
  assertResourceOwnership,
  computeSha256,
  createId,
  getUserStore,
  normalizeToken,
} from "./store";

import type {
  conversationalUpdatePayloadSchema,
  createManualClaimPayloadSchema,
  importCareerPayloadSchema,
  upsertReusableAnswerPayloadSchema,
  verifyClaimPayloadSchema,
} from "../../schema/nextjob";
import type {
  CareerClaimItem,
  CareerEvidenceItem,
  CareerPreferences,
  CareerRevisionItem,
  ReusableAnswerItem,
} from "./store";
import type * as z from "zod";

export const redactPII = (input: string): string => {
  return input
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED-SSN]")
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[REDACTED-CARD]")
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      "[REDACTED-EMAIL]",
    )
    .replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      "[REDACTED-PHONE]",
    );
};

interface ExtractedCandidateFact {
  category: CareerClaimItem["category"];
  title: string;
  organization: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  skills: string[];
  metrics: string[];
  confidence: number;
}

const KNOWN_SKILLS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Hono",
  "Drizzle",
  "PostgreSQL",
  "Python",
  "Go",
  "Rust",
  "Docker",
  "Kubernetes",
  "Playwright",
  "Tailwind CSS",
  "GraphQL",
  "AWS",
  "Zod",
  "Accessibility",
  "AI Agents",
  "OpenTelemetry",
];

const extractSkillsFromText = (text: string): string[] => {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
};

const asStr = (val: unknown, fallback: string): string =>
  typeof val === "string" && val.length > 0 ? val : fallback;

const parseJsonResume = (rawJson: string): ExtractedCandidateFact[] => {
  const parsed = JSON.parse(rawJson) as Record<string, unknown>;
  const candidates: ExtractedCandidateFact[] = [];

  const basics = parsed.basics as Record<string, unknown> | undefined;
  if (basics && typeof basics.summary === "string" && basics.summary.trim()) {
    candidates.push({
      category: "summary",
      title:
        typeof basics.label === "string"
          ? basics.label
          : "Professional Summary",
      organization: null,
      location:
        typeof (basics.location as Record<string, unknown> | undefined)
          ?.city === "string"
          ? String((basics.location as Record<string, unknown>).city)
          : null,
      startDate: null,
      endDate: null,
      isCurrent: true,
      description: redactPII(basics.summary.trim()),
      skills: extractSkillsFromText(basics.summary),
      metrics: [],
      confidence: 0.95,
    });
  }

  const work = Array.isArray(parsed.work) ? parsed.work : [];
  for (const item of work) {
    const entry = item as Record<string, unknown>;
    const title = asStr(entry.position ?? entry.title, "Professional Role");
    const organization = asStr(entry.name ?? entry.company, "Organization");
    const startDate =
      typeof entry.startDate === "string" ? entry.startDate : null;
    const endDate =
      typeof entry.endDate === "string" && entry.endDate ? entry.endDate : null;
    const summary = asStr(
      entry.summary,
      "Delivered key engineering and business outcomes.",
    );
    const highlights = Array.isArray(entry.highlights)
      ? entry.highlights.map((h) => String(h))
      : [];

    candidates.push({
      category: "experience",
      title,
      organization,
      location: typeof entry.location === "string" ? entry.location : null,
      startDate,
      endDate,
      isCurrent: !endDate,
      description: redactPII(summary),
      skills: extractSkillsFromText(`${summary} ${highlights.join(" ")}`),
      metrics: highlights,
      confidence: 0.93,
    });
  }

  const education = Array.isArray(parsed.education) ? parsed.education : [];
  for (const item of education) {
    const entry = item as Record<string, unknown>;
    const studyType =
      typeof entry.studyType === "string" ? entry.studyType : "Degree";
    const area = typeof entry.area === "string" ? entry.area : "Studies";
    const institution = asStr(entry.institution, "University");
    candidates.push({
      category: "education",
      title: `${studyType} in ${area}`,
      organization: institution,
      location: null,
      startDate: typeof entry.startDate === "string" ? entry.startDate : null,
      endDate: typeof entry.endDate === "string" ? entry.endDate : null,
      isCurrent: false,
      description: `Completed ${studyType} in ${area} at ${institution}.`,
      skills: extractSkillsFromText(area),
      metrics: typeof entry.score === "string" ? [`GPA ${entry.score}`] : [],
      confidence: 0.96,
    });
  }

  const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
  for (const item of projects) {
    const entry = item as Record<string, unknown>;
    const name = asStr(entry.name, "Project");
    const description = asStr(entry.description, "Project implementation.");
    candidates.push({
      category: "project",
      title: name,
      organization:
        typeof entry.entity === "string" ? entry.entity : "Independent",
      location: null,
      startDate: typeof entry.startDate === "string" ? entry.startDate : null,
      endDate: typeof entry.endDate === "string" ? entry.endDate : null,
      isCurrent: !entry.endDate,
      description: redactPII(description),
      skills: extractSkillsFromText(description),
      metrics: Array.isArray(entry.highlights)
        ? entry.highlights.map((h) => String(h))
        : [],
      confidence: 0.91,
    });
  }

  return candidates;
};

const parseUnstructuredResumeText = (
  rawText: string,
): ExtractedCandidateFact[] => {
  const sanitized = redactPII(rawText);
  const lines = sanitized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const candidates: ExtractedCandidateFact[] = [];

  for (const line of lines) {
    // Pattern 1: Role at Company (YYYY-MM to YYYY-MM | Present) - Description
    const expRegex =
      /^(?<title>[A-Za-z0-9\s/&+-]+?)\s+at\s+(?<org>[A-Za-z0-9\s.&+-]+?)\s*\((?<start>\d{4}(?:-\d{2})?)\s*(?:to|-|–)\s*(?<end>\d{4}(?:-\d{2})?|Present|Current)\)\s*(?::|-|–)?\s*(?<desc>.*)$/i;
    const expMatch = expRegex.exec(line);
    if (expMatch?.groups) {
      const title = expMatch.groups.title?.trim() ?? "Software Engineer";
      const organization = expMatch.groups.org?.trim() ?? "Company";
      const startDate = expMatch.groups.start?.trim() ?? null;
      const rawEnd = expMatch.groups.end?.trim() ?? "";
      const isCurrent = /^(present|current)$/i.test(rawEnd);
      const endDate = isCurrent ? null : rawEnd || null;
      const description =
        expMatch.groups.desc?.trim() ||
        `${title} at ${organization} (${startDate ?? ""} - ${endDate ?? "Present"}).`;

      candidates.push({
        category: "experience",
        title,
        organization,
        location: null,
        startDate,
        endDate,
        isCurrent,
        description,
        skills: extractSkillsFromText(line),
        metrics: [],
        confidence: 0.9,
      });
      continue;
    }

    // Pattern 2: Education line (B.Sc. / M.Sc. / Bachelor / Master ... at Institution)
    const eduRegex =
      /^(?<degree>(?:B\.?Sc\.?|M\.?Sc\.?|Bachelor|Master|Ph\.?D)[A-Za-z0-9\s.,'&-]*?)\s+at\s+(?<inst>[A-Za-z0-9\s.,'&-]+?)(?:\s*\((?<start>\d{4})\s*(?:to|-|–)\s*(?<end>\d{4})\))?$/i;
    const eduMatch = eduRegex.exec(line);
    if (eduMatch?.groups) {
      const title = eduMatch.groups.degree?.trim() ?? "Degree";
      const organization = eduMatch.groups.inst?.trim() ?? "University";
      candidates.push({
        category: "education",
        title,
        organization,
        location: null,
        startDate: eduMatch.groups.start ?? null,
        endDate: eduMatch.groups.end ?? null,
        isCurrent: false,
        description: `${title} at ${organization}.`,
        skills: extractSkillsFromText(line),
        metrics: [],
        confidence: 0.92,
      });
      continue;
    }

    // Pattern 3: Skills line ("Skills: TypeScript, React, ...")
    if (/^skills\s*:/i.test(line)) {
      const skillsPart = line.replace(/^skills\s*:\s*/i, "");
      const parsedSkills = skillsPart
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsedSkills.length > 0) {
        candidates.push({
          category: "skill",
          title: "Core Technical Skills",
          organization: null,
          location: null,
          startDate: null,
          endDate: null,
          isCurrent: true,
          description: `Technical competencies: ${parsedSkills.join(", ")}`,
          skills: parsedSkills,
          metrics: [],
          confidence: 0.94,
        });
      }
    }
  }

  // Fallback if freeform paragraph was pasted
  if (candidates.length === 0 && sanitized.trim().length > 0) {
    const detectedSkills = extractSkillsFromText(sanitized);
    candidates.push({
      category: "experience",
      title: "Extracted Career Experience",
      organization: "Imported Document",
      location: null,
      startDate: "2023-01",
      endDate: null,
      isCurrent: true,
      description: sanitized.slice(0, 400),
      skills: detectedSkills.length > 0 ? detectedSkills : ["TypeScript"],
      metrics: [],
      confidence: 0.85,
    });
  }

  return candidates;
};

/**
 * Detects if a candidate fact conflicts with an existing claim (same organization + similar role/category
 * but different start/end dates or title details).
 * Section 10 Acceptance Scenario #2: When two documents contain different employment dates,
 * the conflict is highlighted for user confirmation rather than silently overwritten.
 */
const detectClaimConflict = (
  candidate: ExtractedCandidateFact,
  existingClaims: CareerClaimItem[],
): CareerClaimItem["conflictDetails"] => {
  const normOrg = candidate.organization
    ? normalizeToken(candidate.organization)
    : "";
  const normTitle = normalizeToken(candidate.title);

  for (const existing of existingClaims) {
    if (
      existing.verificationStatus === "archived" ||
      existing.verificationStatus === "rejected"
    ) {
      continue;
    }
    if (existing.category !== candidate.category) {
      continue;
    }

    const existingOrg = existing.organization
      ? normalizeToken(existing.organization)
      : "";
    const existingTitle = normalizeToken(existing.title);

    const sameOrg = Boolean(normOrg && existingOrg && normOrg === existingOrg);
    const sameTitle = normTitle === existingTitle;

    if (sameOrg || (sameTitle && existing.category !== "skill")) {
      const differences: Array<{
        field: string;
        existingValue: string;
        proposedValue: string;
      }> = [];

      if (
        candidate.startDate &&
        existing.startDate &&
        candidate.startDate !== existing.startDate
      ) {
        differences.push({
          field: "startDate",
          existingValue: existing.startDate,
          proposedValue: candidate.startDate,
        });
      }

      if (
        (candidate.endDate ?? "Present") !== (existing.endDate ?? "Present")
      ) {
        differences.push({
          field: "endDate",
          existingValue: existing.endDate ?? "Present",
          proposedValue: candidate.endDate ?? "Present",
        });
      }

      if (sameOrg && !sameTitle) {
        differences.push({
          field: "title",
          existingValue: existing.title,
          proposedValue: candidate.title,
        });
      }

      if (differences.length > 0) {
        return {
          existingClaimId: existing.id,
          reason: `Imported document contains conflicting ${differences.map((d) => d.field).join(", ")} for ${existing.organization ?? existing.title}.`,
          differences,
        };
      }
    }
  }

  return null;
};

export const getCareerWorkspace = (userId: string) => {
  const store = getUserStore(userId);
  const verifiedClaims = store.claims.filter(
    (c) => c.verificationStatus === "verified",
  );
  const categoriesCovered = new Set(verifiedClaims.map((c) => c.category));
  const completenessScore = Math.min(
    100,
    Math.round(
      (categoriesCovered.size / 5) * 80 +
        (store.preferences.targetRoles.length > 0 ? 20 : 0),
    ),
  );

  return {
    profile: {
      ...store.profile,
      completenessScore,
    },
    claims: store.claims,
    evidence: store.evidence,
    revisions: store.revisions,
    preferences: store.preferences,
    reusableAnswers: store.reusableAnswers,
  };
};

/**
 * Section 10 Acceptance Scenario #1 & #2:
 * Importing a CV produces proposed facts (`pending_review` or `disputed`) that the user can inspect and edit,
 * never silently replacing verified career facts.
 */
export const importCareerDocument = (
  userId: string,
  payload: z.infer<typeof importCareerPayloadSchema>,
) => {
  const store = getUserStore(userId);
  const now = new Date().toISOString();
  const contentHash = computeSha256(payload.content);

  let extractedFacts: ExtractedCandidateFact[] = [];
  if (payload.format === "json_resume") {
    try {
      extractedFacts = parseJsonResume(payload.content);
    } catch {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, {
        code: "error.invalid",
        message: "Invalid JSON Resume document format.",
      });
    }
  } else {
    extractedFacts = parseUnstructuredResumeText(payload.content);
  }

  const evidenceId = createId("ev");
  const createdClaims: CareerClaimItem[] = [];
  let conflictCount = 0;

  for (const fact of extractedFacts) {
    const conflict = detectClaimConflict(fact, store.claims);
    if (conflict) {
      conflictCount += 1;
    }

    const newClaim: CareerClaimItem = {
      id: createId("claim"),
      userId,
      profileId: store.profile.id,
      evidenceId,
      category: fact.category,
      title: fact.title,
      organization: fact.organization,
      location: fact.location,
      startDate: fact.startDate,
      endDate: fact.endDate,
      isCurrent: fact.isCurrent,
      description: fact.description,
      skills: fact.skills,
      metrics: fact.metrics,
      verificationStatus: conflict ? "disputed" : "pending_review",
      confidence: fact.confidence,
      conflictWithClaimId: conflict ? conflict.existingClaimId : null,
      conflictDetails: conflict,
      updatedAt: now,
    };

    store.claims.unshift(newClaim);
    createdClaims.push(newClaim);

    const revision: CareerRevisionItem = {
      id: createId("rev"),
      userId,
      claimId: newClaim.id,
      action: conflict ? "import_conflict_detected" : "import_proposed",
      actor: "user_import",
      reason: conflict
        ? conflict.reason
        : `Extracted proposed ${fact.category} claim from ${payload.fileName ?? payload.format}.`,
      previousValue: null,
      newValue: {
        title: newClaim.title,
        organization: newClaim.organization,
        startDate: newClaim.startDate,
        endDate: newClaim.endDate,
        verificationStatus: newClaim.verificationStatus,
      },
      createdAt: now,
    };
    store.revisions.unshift(revision);
  }

  const evidenceRecord: CareerEvidenceItem = {
    id: evidenceId,
    userId,
    type:
      payload.format === "pdf"
        ? "resume_pdf"
        : payload.format === "docx"
          ? "resume_docx"
          : payload.format === "json_resume"
            ? "json_resume"
            : "resume_text",
    title:
      payload.fileName ??
      `Imported_${payload.format.toUpperCase()}_${now.slice(0, 10)}`,
    fileName: payload.fileName ?? null,
    contentHash,
    extractedFactCount: createdClaims.length,
    conflictCount,
    importedAt: now,
  };

  store.evidence.unshift(evidenceRecord);

  return {
    evidence: evidenceRecord,
    importedClaims: createdClaims,
    conflictCount,
  };
};

export const verifyOrUpdateCareerClaim = (
  userId: string,
  payload: z.infer<typeof verifyClaimPayloadSchema>,
) => {
  const store = getUserStore(userId);
  const claim = store.claims.find((item) => item.id === payload.claimId);

  if (!claim) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Career claim not found.",
    });
  }

  assertResourceOwnership(userId, claim.userId, "career claim");

  const previousSnapshot = {
    title: claim.title,
    organization: claim.organization,
    startDate: claim.startDate,
    endDate: claim.endDate,
    description: claim.description,
    verificationStatus: claim.verificationStatus,
  };

  const now = new Date().toISOString();

  if (payload.updates) {
    if (payload.updates.title !== undefined)
      claim.title = payload.updates.title;
    if (payload.updates.organization !== undefined)
      claim.organization = payload.updates.organization;
    if (payload.updates.location !== undefined)
      claim.location = payload.updates.location;
    if (payload.updates.startDate !== undefined)
      claim.startDate = payload.updates.startDate;
    if (payload.updates.endDate !== undefined)
      claim.endDate = payload.updates.endDate;
    if (payload.updates.isCurrent !== undefined)
      claim.isCurrent = payload.updates.isCurrent;
    if (payload.updates.description !== undefined) {
      claim.description = redactPII(payload.updates.description);
    }
    if (payload.updates.skills !== undefined)
      claim.skills = payload.updates.skills;
    if (payload.updates.metrics !== undefined)
      claim.metrics = payload.updates.metrics;
  }

  switch (payload.action) {
    case "confirm":
      claim.verificationStatus = "verified";
      claim.conflictWithClaimId = null;
      claim.conflictDetails = null;
      break;
    case "edit":
      claim.verificationStatus = "verified";
      claim.conflictWithClaimId = null;
      claim.conflictDetails = null;
      break;
    case "reject":
      claim.verificationStatus = "rejected";
      break;
    case "mark_unverified":
      claim.verificationStatus = "unverified";
      break;
    case "archive":
      claim.verificationStatus = "archived";
      break;
    case "resolve_conflict_keep_existing":
      claim.verificationStatus = "rejected";
      break;
    case "resolve_conflict_accept_proposed": {
      if (claim.conflictWithClaimId) {
        const existingClaim = store.claims.find(
          (c) => c.id === claim.conflictWithClaimId,
        );
        if (existingClaim) {
          assertResourceOwnership(
            userId,
            existingClaim.userId,
            "existing career claim",
          );
          existingClaim.verificationStatus = "archived";
          existingClaim.updatedAt = now;
        }
      }
      claim.verificationStatus = "verified";
      claim.conflictWithClaimId = null;
      claim.conflictDetails = null;
      break;
    }
  }

  claim.updatedAt = now;

  if (claim.category === "summary" && claim.verificationStatus === "verified") {
    store.profile.headline = claim.title;
    store.profile.summary = claim.description;
  }

  const revision: CareerRevisionItem = {
    id: createId("rev"),
    userId,
    claimId: claim.id,
    action: payload.action,
    actor: userId,
    reason:
      payload.reason ?? `User executed ${payload.action} on career claim.`,
    previousValue: previousSnapshot,
    newValue: {
      title: claim.title,
      organization: claim.organization,
      startDate: claim.startDate,
      endDate: claim.endDate,
      description: claim.description,
      verificationStatus: claim.verificationStatus,
    },
    createdAt: now,
  };
  store.revisions.unshift(revision);

  return {
    claim,
    revision,
  };
};

export const createManualCareerClaim = (
  userId: string,
  payload: z.infer<typeof createManualClaimPayloadSchema>,
) => {
  const store = getUserStore(userId);
  const now = new Date().toISOString();

  const claim: CareerClaimItem = {
    id: createId("claim"),
    userId,
    profileId: store.profile.id,
    evidenceId: null,
    category: payload.category,
    title: payload.title,
    organization: payload.organization ?? null,
    location: payload.location ?? null,
    startDate: payload.startDate ?? null,
    endDate: payload.endDate ?? null,
    isCurrent: payload.isCurrent ?? !payload.endDate,
    description: redactPII(payload.description),
    skills: payload.skills ?? extractSkillsFromText(payload.description),
    metrics: payload.metrics ?? [],
    verificationStatus: "verified",
    confidence: 1.0,
    conflictWithClaimId: null,
    conflictDetails: null,
    updatedAt: now,
  };

  store.claims.unshift(claim);

  const revision: CareerRevisionItem = {
    id: createId("rev"),
    userId,
    claimId: claim.id,
    action: "manual_create",
    actor: userId,
    reason: "User added verified career claim directly.",
    previousValue: null,
    newValue: {
      title: claim.title,
      category: claim.category,
      verificationStatus: "verified",
    },
    createdAt: now,
  };
  store.revisions.unshift(revision);

  return claim;
};

/**
 * Section 5.3 Conversational Profile Updates:
 * Example: "I was promoted to Information Manager."
 * AI proposes structured changes in `pending_review` state.
 * The user reviews and approves them. Only then does the authoritative profile change.
 */
export const proposeConversationalCareerUpdate = (
  userId: string,
  payload: z.infer<typeof conversationalUpdatePayloadSchema>,
) => {
  const store = getUserStore(userId);
  const now = new Date().toISOString();
  const message = redactPII(payload.message.trim());

  let category: CareerClaimItem["category"] = "experience";
  let title = "Career Update";
  let organization: string | null =
    store.claims.find((c) => c.category === "experience")?.organization ??
    "Current Organization";

  const promotionMatch =
    /promoted\s+to\s+([A-Za-z0-9\s/&+-]+?)(?:\s+at\s+([A-Za-z0-9\s.&+-]+))?[.!]*$/i.exec(
      message,
    );
  const certMatch =
    /(?:earned|completed|certified\s+in)\s+([A-Za-z0-9\s/&+-]+)[.!]*$/i.exec(
      message,
    );
  const skillMatch =
    /(?:learned|added\s+skills?|proficient\s+in)\s+([A-Za-z0-9\s,+#.-]+)[.!]*$/i.exec(
      message,
    );

  if (promotionMatch) {
    category = "experience";
    title = promotionMatch[1]?.trim() ?? "Information Manager";
    if (promotionMatch[2]) {
      organization = promotionMatch[2].trim();
    }
  } else if (certMatch) {
    category = "certification";
    title = certMatch[1]?.trim() ?? "Professional Certification";
    organization = "Accredited Issuer";
  } else if (skillMatch) {
    category = "skill";
    title = "Updated Technical Skills";
    organization = null;
  } else {
    title = message.slice(0, 64);
  }

  const detectedSkills = extractSkillsFromText(message);
  const evidenceId = createId("ev-conv");

  const evidenceRecord: CareerEvidenceItem = {
    id: evidenceId,
    userId,
    type: "conversational_update",
    title: `Conversational proposal: "${message.slice(0, 50)}"`,
    fileName: null,
    contentHash: computeSha256(message),
    extractedFactCount: 1,
    conflictCount: 0,
    importedAt: now,
  };
  store.evidence.unshift(evidenceRecord);

  const proposedClaim: CareerClaimItem = {
    id: createId("claim-prop"),
    userId,
    profileId: store.profile.id,
    evidenceId,
    category,
    title,
    organization,
    location: store.profile.location,
    startDate: now.slice(0, 7),
    endDate: null,
    isCurrent: true,
    description: message,
    skills: detectedSkills,
    metrics: [],
    // Crucial: stays pending_review until explicit user approval
    verificationStatus: "pending_review",
    confidence: 0.9,
    conflictWithClaimId: null,
    conflictDetails: null,
    updatedAt: now,
  };

  store.claims.unshift(proposedClaim);

  const revision: CareerRevisionItem = {
    id: createId("rev"),
    userId,
    claimId: proposedClaim.id,
    action: "conversational_proposal",
    actor: "ai_assistant",
    reason:
      "Proposed structured career claim from conversational input; awaiting user approval.",
    previousValue: null,
    newValue: {
      title: proposedClaim.title,
      organization: proposedClaim.organization,
      verificationStatus: "pending_review",
    },
    createdAt: now,
  };
  store.revisions.unshift(revision);

  return {
    proposedClaim,
    requiresUserApproval: true,
    assistantReply: `I created a proposed ${category} update for "${title}"${organization ? ` at ${organization}` : ""}. Please review and click Confirm in My Career to apply it to your authoritative profile.`,
  };
};

export const updateCareerPreferences = (
  userId: string,
  preferences: CareerPreferences,
): CareerPreferences => {
  const store = getUserStore(userId);
  store.preferences = { ...preferences };

  store.revisions.unshift({
    id: createId("rev"),
    userId,
    claimId: null,
    action: "preferences_updated",
    actor: userId,
    reason:
      "Updated career goals, salary expectations, and automation preferences.",
    previousValue: null,
    newValue: preferences as unknown as Record<string, unknown>,
    createdAt: new Date().toISOString(),
  });

  return store.preferences;
};

export const resetCareerPreferences = (userId: string): CareerPreferences => {
  const store = getUserStore(userId);
  store.preferences = {
    targetRoles: ["Senior Full-Stack Engineer"],
    locations: ["Remote"],
    workModes: ["remote", "hybrid", "on-site"],
    minSalary: null,
    maxSalary: null,
    currency: "USD",
    seniorityLevels: ["Senior"],
    employmentTypes: ["full-time"],
    excludedCompanies: [],
    excludedKeywords: [],
    requireApprovalBeforeSubmit: true,
    requireApprovalForProfileChanges: true,
    workAuthorizationCountries: ["Global"],
    requiresSponsorship: false,
  };
  return store.preferences;
};

export const upsertReusableAnswer = (
  userId: string,
  payload: z.infer<typeof upsertReusableAnswerPayloadSchema>,
): ReusableAnswerItem => {
  const store = getUserStore(userId);
  const now = new Date().toISOString();

  if (payload.id) {
    const existing = store.reusableAnswers.find((a) => a.id === payload.id);
    if (!existing) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, {
        code: "error.notFound",
        message: "Reusable answer not found.",
      });
    }
    assertResourceOwnership(userId, existing.userId, "reusable answer");
    existing.questionCategory = payload.questionCategory;
    existing.questionPattern = payload.questionPattern;
    existing.verifiedAnswer = redactPII(payload.verifiedAnswer);
    existing.isApprovedForReuse = payload.isApprovedForReuse;
    existing.updatedAt = now;
    return existing;
  }

  const created: ReusableAnswerItem = {
    id: createId("ans"),
    userId,
    questionCategory: payload.questionCategory,
    questionPattern: payload.questionPattern,
    verifiedAnswer: redactPII(payload.verifiedAnswer),
    isApprovedForReuse: payload.isApprovedForReuse,
    updatedAt: now,
  };
  store.reusableAnswers.unshift(created);
  return created;
};

export const exportProfileAsJsonResume = (userId: string) => {
  const store = getUserStore(userId);
  const verifiedClaims = store.claims.filter(
    (c) => c.verificationStatus === "verified",
  );

  const work = verifiedClaims
    .filter((c) => c.category === "experience")
    .map((c) => ({
      name: c.organization ?? "Organization",
      position: c.title,
      location: c.location ?? undefined,
      startDate: c.startDate ?? undefined,
      endDate: c.endDate ?? undefined,
      summary: c.description,
      highlights: c.metrics,
    }));

  const education = verifiedClaims
    .filter((c) => c.category === "education")
    .map((c) => ({
      institution: c.organization ?? "Institution",
      area: c.title,
      studyType: c.title,
      startDate: c.startDate ?? undefined,
      endDate: c.endDate ?? undefined,
    }));

  const projects = verifiedClaims
    .filter((c) => c.category === "project")
    .map((c) => ({
      name: c.title,
      description: c.description,
      highlights: c.metrics,
      keywords: c.skills,
    }));

  const allSkills = Array.from(
    new Set(verifiedClaims.flatMap((c) => c.skills)),
  );

  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: userId,
      label: store.profile.headline,
      summary: store.profile.summary,
      location: {
        city: store.profile.location,
      },
    },
    work,
    education,
    projects,
    skills: [
      {
        name: "Verified Competencies",
        keywords: allSkills,
      },
    ],
  };
};
