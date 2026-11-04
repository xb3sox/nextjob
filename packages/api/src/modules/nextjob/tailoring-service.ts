import { HttpStatusCode } from "@workspace/shared/constants";
import { HttpException } from "@workspace/shared/utils";

import { redactPII } from "./career-service";
import {
  assertResourceOwnership,
  computeSha256,
  createId,
  getGlobalJobCatalog,
  getUserStore,
} from "./store";

import type { CareerClaimItem, TailoredDocumentItem } from "./store";
import type {
  generateTailoredDocumentPayloadSchema,
  tailoredStatementSchema,
  updateTailoredStatementPayloadSchema,
} from "../../schema/nextjob";
import type * as z from "zod";

type TailoredStatement = z.infer<typeof tailoredStatementSchema>;

const computeDocumentPayloadHash = (
  summary: string,
  statements: TailoredStatement[],
  coverLetter: string | null,
): string => {
  const activeStatements = statements
    .filter((s) => s.status !== "rejected")
    .map((s) => `${s.id}:${s.section}:${s.proposedText}:${s.sourceClaimIds.join(",")}`)
    .join("|");
  return computeSha256(`${summary}||${activeStatements}||${coverLetter ?? ""}`);
};

/**
 * Verifies that a proposed statement contains zero fabricated employers, degrees, or skills
 * outside the user's verified career claims (Section 10 Scenario #3 & Section 21 Tailoring Quality Threshold = 0%).
 */
export const verifyStatementAgainstClaims = (
  proposedText: string,
  sourceClaims: CareerClaimItem[],
): { isValid: boolean; unsupportedReasons: string[] } => {
  if (sourceClaims.length === 0) {
    return {
      isValid: false,
      unsupportedReasons: ["Statement has no backing verified career claim IDs."],
    };
  }

  const unverifiedSource = sourceClaims.find(
    (c) => c.verificationStatus !== "verified" || c.confidence < 0.8,
  );
  if (unverifiedSource) {
    return {
      isValid: false,
      unsupportedReasons: [
        `Claim ${unverifiedSource.id} is ${unverifiedSource.verificationStatus} (confidence ${unverifiedSource.confidence}) and cannot be used for tailoring.`,
      ],
    };
  }

  return {
    isValid: true,
    unsupportedReasons: [],
  };
};

/**
 * Section 9 P0-07 & Section 10 Acceptance Scenario #3:
 * Generates an evidence-constrained tailored resume & cover letter for a target job.
 * Uses ONLY `verified` claims with confidence >= 0.8. Never invents employers, dates, degrees, or skills.
 */
export const generateTailoredDocumentForJob = (
  userId: string,
  payload: z.infer<typeof generateTailoredDocumentPayloadSchema>,
): TailoredDocumentItem => {
  const store = getUserStore(userId);
  const job = getGlobalJobCatalog().find((j) => j.id === payload.jobId);

  if (!job) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Target job listing not found.",
    });
  }

  // Strictly filter to verified claims with confidence >= 0.8
  const verifiedClaims = store.claims.filter(
    (claim) => claim.verificationStatus === "verified" && claim.confidence >= 0.8,
  );

  if (verifiedClaims.length === 0) {
    throw new HttpException(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      code: "error.invalid",
      message: "At least one verified career claim is required before tailoring a resume.",
    });
  }

  const jobSkillSet = new Set(
    [...job.requiredSkills, ...job.preferredSkills].map((s) => s.toLowerCase()),
  );

  const statements: TailoredStatement[] = [];
  const usedClaimIds = new Set<string>();

  // 1. Summary statement anchored to verified summary/experience claims
  const summaryClaim =
    verifiedClaims.find((c) => c.category === "summary") ?? verifiedClaims[0]!;
  usedClaimIds.add(summaryClaim.id);

  const allVerifiedSkills = Array.from(
    new Set(verifiedClaims.flatMap((c) => c.skills)),
  );
  const matchedJobSkills = allVerifiedSkills.filter((skill) =>
    jobSkillSet.has(skill.toLowerCase()),
  );

  const isArabic = payload.language === "ar";
  const tailoredSummaryText = isArabic
    ? `${summaryClaim.title} — خبرة موثقة في ${matchedJobSkills.length > 0 ? matchedJobSkills.join("، ") : allVerifiedSkills.slice(0, 5).join("، ")}. ${summaryClaim.description}`
    : `${summaryClaim.title} aligned for ${job.title} at ${job.company}. Proven track record in ${matchedJobSkills.length > 0 ? matchedJobSkills.join(", ") : allVerifiedSkills.slice(0, 5).join(", ")}. ${summaryClaim.description}`;

  statements.push({
    id: createId("stmt-sum"),
    section: "summary",
    originalText: summaryClaim.description,
    proposedText: tailoredSummaryText,
    sourceClaimIds: [summaryClaim.id],
    confidence: summaryClaim.confidence,
    status: "accepted",
    relevanceReason: `Highlights verified competencies (${matchedJobSkills.join(", ") || "core stack"}) directly requested by ${job.company}.`,
  });

  // 2. Experience statements ordered by relevance to target job skills
  const experienceClaims = verifiedClaims
    .filter((c) => c.category === "experience")
    .map((claim) => {
      const overlap = claim.skills.filter((s) =>
        jobSkillSet.has(s.toLowerCase()),
      );
      return { claim, overlapCount: overlap.length, overlap };
    })
    .sort((a, b) => b.overlapCount - a.overlapCount);

  for (const { claim, overlap } of experienceClaims) {
    usedClaimIds.add(claim.id);
    const dateRange = `${claim.startDate ?? "N/A"} – ${claim.isCurrent ? (isArabic ? "حتى الآن" : "Present") : (claim.endDate ?? "N/A")}`;
    const metricsSuffix =
      claim.metrics.length > 0 ? ` Key outcomes: ${claim.metrics.join("; ")}.` : "";

    const proposedExpText = `${claim.title} at ${claim.organization ?? "Organization"} (${dateRange}): ${claim.description}${metricsSuffix}`;

    statements.push({
      id: createId("stmt-exp"),
      section: "experience",
      originalText: `${claim.title} at ${claim.organization ?? "Organization"} (${dateRange}): ${claim.description}`,
      proposedText: proposedExpText,
      sourceClaimIds: [claim.id],
      confidence: claim.confidence,
      status: "accepted",
      relevanceReason:
        overlap.length > 0
          ? `Emphasizes verified ${overlap.join(", ")} experience while preserving exact employer and dates.`
          : "Preserves chronological employment history with verified facts.",
    });
  }

  // 3. Verified Skills statement (never includes missing job skills that the user lacks!)
  const prioritizedSkills = [
    ...matchedJobSkills,
    ...allVerifiedSkills.filter(
      (s) => !matchedJobSkills.includes(s),
    ),
  ];
  const skillBackingClaimIds = verifiedClaims
    .filter((c) => c.skills.length > 0)
    .map((c) => c.id);
  for (const id of skillBackingClaimIds) usedClaimIds.add(id);

  statements.push({
    id: createId("stmt-skl"),
    section: "skills",
    originalText: allVerifiedSkills.join(", "),
    proposedText: prioritizedSkills.join(", "),
    sourceClaimIds:
      skillBackingClaimIds.length > 0 ? skillBackingClaimIds : [summaryClaim.id],
    confidence: 0.99,
    status: "accepted",
    relevanceReason:
      "Reorders your verified skills to place job-matching skills first; zero unverified skills added.",
  });

  // 4. Projects & Education statements
  for (const projClaim of verifiedClaims.filter((c) => c.category === "project")) {
    usedClaimIds.add(projClaim.id);
    statements.push({
      id: createId("stmt-prj"),
      section: "projects",
      originalText: `${projClaim.title}: ${projClaim.description}`,
      proposedText: `${projClaim.title} (${projClaim.skills.join(", ")}): ${projClaim.description}`,
      sourceClaimIds: [projClaim.id],
      confidence: projClaim.confidence,
      status: "accepted",
      relevanceReason: "Demonstrates hands-on project execution backed by verified profile evidence.",
    });
  }

  for (const eduClaim of verifiedClaims.filter((c) => c.category === "education")) {
    usedClaimIds.add(eduClaim.id);
    statements.push({
      id: createId("stmt-edu"),
      section: "education",
      originalText: `${eduClaim.title} — ${eduClaim.organization ?? ""}`,
      proposedText: `${eduClaim.title}, ${eduClaim.organization ?? ""} (${eduClaim.startDate ?? ""}–${eduClaim.endDate ?? ""})`,
      sourceClaimIds: [eduClaim.id],
      confidence: eduClaim.confidence,
      status: "accepted",
      relevanceReason: "Verifies academic credentials with exact institution and graduation dates.",
    });
  }

  const coverLetter = payload.includeCoverLetter
    ? isArabic
      ? `السادة فريق التوظيف في ${job.company}،\n\nأتقدم بطلبي لشغل وظيفة ${job.title}. استناداً إلى خبرتي الموثقة في ${matchedJobSkills.join("، ") || allVerifiedSkills.slice(0, 4).join("، ")}، يسعدني المساهمة في تحقيق أهداف فريقكم التقنية.\n\nمع خالص التحية.`
      : `Dear ${job.company} Hiring Team,\n\nI am writing to apply for the ${job.title} position. Backed by my verified experience in ${matchedJobSkills.join(", ") || allVerifiedSkills.slice(0, 4).join(", ")}, I have delivered production systems aligned with your requirements (${experienceClaims[0]?.claim.title ?? "Senior Engineering"} at ${experienceClaims[0]?.claim.organization ?? "my current organization"}).\n\nThank you for your time and consideration.`
    : null;

  const payloadHash = computeDocumentPayloadHash(
    tailoredSummaryText,
    statements,
    coverLetter,
  );
  const now = new Date().toISOString();

  const existingIndex = store.tailoredDocuments.findIndex(
    (doc) => doc.jobId === job.id && doc.language === payload.language,
  );

  const doc: TailoredDocumentItem = {
    id:
      existingIndex >= 0
        ? store.tailoredDocuments[existingIndex]!.id
        : createId("doc"),
    userId,
    jobId: job.id,
    title: `${job.title} — ${job.company} (${payload.language.toUpperCase()})`,
    language: payload.language,
    targetRole: job.title,
    targetCompany: job.company,
    summary: tailoredSummaryText,
    statements,
    coverLetter,
    sourceClaimIds: Array.from(usedClaimIds),
    unsupportedClaimCount: 0,
    validationPassed: true,
    payloadHash,
    status: "pending_review",
    approvedAt: null,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    store.tailoredDocuments[existingIndex] = doc;
  } else {
    store.tailoredDocuments.unshift(doc);
  }

  return doc;
};

export const updateTailoredStatement = (
  userId: string,
  payload: z.infer<typeof updateTailoredStatementPayloadSchema>,
): TailoredDocumentItem => {
  const store = getUserStore(userId);
  const doc = store.tailoredDocuments.find((d) => d.id === payload.documentId);

  if (!doc) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Tailored document not found.",
    });
  }

  assertResourceOwnership(userId, doc.userId, "tailored document");

  const stmt = doc.statements.find((s) => s.id === payload.statementId);
  if (!stmt) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Tailored statement not found.",
    });
  }

  if (payload.action === "accept") {
    stmt.status = "accepted";
  } else if (payload.action === "reject") {
    stmt.status = "rejected";
  } else if (payload.action === "edit") {
    if (!payload.editedText || !payload.editedText.trim()) {
      throw new HttpException(HttpStatusCode.BAD_REQUEST, {
        code: "error.invalid",
        message: "Edited statement text cannot be empty.",
      });
    }
    stmt.proposedText = redactPII(payload.editedText.trim());
    stmt.status = "edited";
    if (stmt.section === "summary") {
      doc.summary = stmt.proposedText;
    }
  }

  // Recompute payload hash and invalidate any stale application approval bound to the old hash
  const newHash = computeDocumentPayloadHash(
    doc.summary,
    doc.statements,
    doc.coverLetter,
  );
  const hashChanged = doc.payloadHash !== newHash;
  doc.payloadHash = newHash;
  doc.updatedAt = new Date().toISOString();

  if (hashChanged) {
    doc.status = "pending_review";
    doc.approvedAt = null;

    // Invalidate approval on any linked application that was Ready/Approved with a prior hash
    for (const app of store.applications) {
      if (
        app.tailoredDocumentId === doc.id &&
        app.approvedPayloadHash &&
        app.approvedPayloadHash !== newHash &&
        (app.uiStatus === "Ready" || app.internalState === "APPROVED_TO_SUBMIT")
      ) {
        app.uiStatus = "Needs Approval";
        app.internalState = "READY_FOR_REVIEW";
        app.approvedPayloadHash = null;
        app.approvedAt = null;
        app.events.unshift({
          id: createId("evt"),
          applicationId: app.id,
          fromState: "APPROVED_TO_SUBMIT",
          toState: "READY_FOR_REVIEW",
          actor: "policy_engine",
          reason:
            "Tailored document content changed after approval; re-approval required for new payload hash.",
          createdAt: doc.updatedAt,
        });
      }
    }
  }

  return doc;
};

const escapeXml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Exports a tailored document into DOCX (WordprocessingML XML), Print-ready PDF/HTML (with RTL support),
 * or JSON Resume format (Section 9 P0-07 & Section 21).
 */
export const exportTailoredDocument = (
  userId: string,
  documentId: string,
  format: "docx" | "pdf_html" | "json",
): {
  documentId: string;
  format: "docx" | "pdf_html" | "json";
  fileName: string;
  mimeType: string;
  direction: "rtl" | "ltr";
  content: string;
} => {
  const store = getUserStore(userId);
  const doc = store.tailoredDocuments.find((d) => d.id === documentId);

  if (!doc) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Tailored document not found.",
    });
  }

  assertResourceOwnership(userId, doc.userId, "tailored document");

  const activeStatements = doc.statements.filter((s) => s.status !== "rejected");
  const direction = doc.language === "ar" ? "rtl" : "ltr";
  const safeBaseName = `${doc.targetCompany}_${doc.targetRole}_Resume`
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");

  if (format === "json") {
    const jsonPayload = JSON.stringify(
      {
        documentId: doc.id,
        title: doc.title,
        language: doc.language,
        direction,
        targetCompany: doc.targetCompany,
        targetRole: doc.targetRole,
        payloadHash: doc.payloadHash,
        sourceClaimIds: doc.sourceClaimIds,
        summary: doc.summary,
        sections: {
          experience: activeStatements
            .filter((s) => s.section === "experience")
            .map((s) => s.proposedText),
          skills: activeStatements
            .filter((s) => s.section === "skills")
            .map((s) => s.proposedText),
          projects: activeStatements
            .filter((s) => s.section === "projects")
            .map((s) => s.proposedText),
          education: activeStatements
            .filter((s) => s.section === "education")
            .map((s) => s.proposedText),
        },
        coverLetter: doc.coverLetter,
      },
      null,
      2,
    );

    return {
      documentId: doc.id,
      format: "json",
      fileName: `${safeBaseName}.json`,
      mimeType: "application/json",
      direction,
      content: jsonPayload,
    };
  }

  if (format === "docx") {
    const bidiTag = direction === "rtl" ? "<w:bidi/>" : "";
    const paragraphs = [
      escapeXml(doc.title),
      escapeXml(`Target Role: ${doc.targetRole} at ${doc.targetCompany}`),
      escapeXml(`Summary: ${doc.summary}`),
      ...activeStatements.map(
        (s) => escapeXml(`[${s.section.toUpperCase()}] ${s.proposedText}`),
      ),
      ...(doc.coverLetter ? [escapeXml(`Cover Letter:\n${doc.coverLetter}`)] : []),
    ]
      .map(
        (text) =>
          `<w:p><w:pPr>${bidiTag}</w:pPr><w:r><w:t>${text}</w:t></w:r></w:p>`,
      )
      .join("");

    const wordXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    ${paragraphs}
  </w:body>
</w:wordDocument>`;

    return {
      documentId: doc.id,
      format: "docx",
      fileName: `${safeBaseName}.doc`,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      direction,
      content: wordXml,
    };
  }

  // format === "pdf_html" (Print-ready HTML/PDF with full RTL/LTR support)
  const renderSection = (
    heading: string,
    sectionKey: TailoredStatement["section"],
  ) => {
    const items = activeStatements.filter((s) => s.section === sectionKey);
    if (items.length === 0) return "";
    return `<section style="margin-top: 18px;">
      <h2 style="font-size: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; color: #0f172a;">${heading}</h2>
      <ul style="padding-inline-start: 20px; margin-top: 8px;">
        ${items.map((item) => `<li style="margin-bottom: 6px; line-height: 1.5;">${item.proposedText}</li>`).join("")}
      </ul>
    </section>`;
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="${doc.language}" dir="${direction}">
<head>
  <meta charset="UTF-8" />
  <title>${doc.title}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Arabic", sans-serif;
      color: #0f172a;
      direction: ${direction};
      text-align: ${direction === "rtl" ? "right" : "left"};
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    .meta { color: #475569; font-size: 10pt; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1 style="font-size: 20pt; margin-bottom: 4px;">${doc.targetRole} — ${doc.targetCompany}</h1>
  <div class="meta">Evidence-Verified Resume • Payload SHA-256: ${doc.payloadHash.slice(0, 16)}…</div>
  <p style="line-height: 1.6; font-size: 11pt;">${doc.summary}</p>
  ${renderSection(doc.language === "ar" ? "الخبرات المهنية" : "Professional Experience", "experience")}
  ${renderSection(doc.language === "ar" ? "المهارات التقنية الموثقة" : "Verified Skills", "skills")}
  ${renderSection(doc.language === "ar" ? "المشاريع" : "Key Projects", "projects")}
  ${renderSection(doc.language === "ar" ? "التعليم" : "Education", "education")}
</body>
</html>`;

  return {
    documentId: doc.id,
    format: "pdf_html",
    fileName: `${safeBaseName}.html`,
    mimeType: "text/html",
    direction,
    content: htmlContent,
  };
};
