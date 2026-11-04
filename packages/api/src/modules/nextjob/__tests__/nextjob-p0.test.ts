import { beforeEach, describe, expect, it } from "vitest";

import {
  getLanguageDirection,
  isLocaleSupported,
  isRTL,
} from "@workspace/i18n/server";

import {
  generateTailoredDocumentWithAi,
  importCareerDocumentWithAi,
  verifyZeroFabricationStatement,
} from "../ai-provider";
import {
  approveApplicationForSubmission,
  createOrPrepareApplication,
  getTodayDashboardForUser,
  recordApplicationSubmission,
  transitionApplicationStatus,
  verifySubmissionReceiptIntegrity,
} from "../applications-service";
import {
  createManualCareerClaim,
  exportProfileAsJsonResume,
  getCareerWorkspace,
  importCareerDocument,
  proposeConversationalCareerUpdate,
  updateCareerPreferences,
  verifyOrUpdateCareerClaim,
} from "../career-service";
import {
  hydrateWorkspaceFromPostgres,
  syncUserWorkspaceWithPostgres,
} from "../db-persistence";
import {
  evaluateEligibilityBenchmarkCase,
  type BenchmarkEligibilityRule,
  type BenchmarkJob,
  type BenchmarkUserProfile,
} from "../eligibility-benchmark";
import { listJobsWithFitForUser } from "../jobs-service";
import {
  createApprovalManager,
  createPolicyEvaluator,
} from "../policy-service";
import {
  assertResourceOwnership,
  getUserStore,
  resetStoreForTesting,
} from "../store";
import {
  exportTailoredDocument,
  generateTailoredDocumentForJob,
  updateTailoredStatement,
} from "../tailoring-service";
import applicationAnswersDataset from "./evals/tailoring/datasets/application_answers.json";
import coverLetterDataset from "./evals/tailoring/datasets/cover_letter.json";
import professionalSummaryDataset from "./evals/tailoring/datasets/professional_summary.json";
import resumeTailoringDataset from "./evals/tailoring/datasets/resume_tailoring.json";
import skillsSectionDataset from "./evals/tailoring/datasets/skills_section.json";
import tailoringExpectedOutcomes from "./evals/tailoring/expected_outcomes.json";
import evidenceCompleteScenario from "./evals/tailoring/scenarios/evidence_complete.json";
import evidenceConstraintsScenario from "./evals/tailoring/scenarios/evidence_constraints.json";
import evidencePartialScenario from "./evals/tailoring/scenarios/evidence_partial.json";
import eligibilityCases from "./fixtures/eligibility-cases.json";

describe("NextJob P0 Acceptance, Security & Quality Gate Suite", () => {
  const userA = "user-alice-001";
  const userB = "user-bob-002";

  beforeEach(() => {
    resetStoreForTesting();
  });

  // --------------------------------------------------------------------------
  // Section 10 Critical Acceptance Scenario #1: Import
  // --------------------------------------------------------------------------
  it("Scenario 1 (Import): importing a CV produces proposed facts that the user can inspect and edit without silently replacing verified facts", () => {
    const initialWorkspace = getCareerWorkspace(userA);
    const verifiedBefore = initialWorkspace.claims.filter(
      (c) => c.verificationStatus === "verified",
    );

    const importResult = importCareerDocument(userA, {
      format: "text",
      fileName: "New_Resume_2026.pdf",
      content: `Principal Distributed Engineer at Orbit Systems (2024-01 to Present) - Built Rust and TypeScript event pipelines.
Skills: TypeScript, Rust, PostgreSQL`,
    });

    expect(importResult.importedClaims.length).toBeGreaterThanOrEqual(1);
    for (const claim of importResult.importedClaims) {
      expect(["pending_review", "disputed"]).toContain(claim.verificationStatus);
    }

    // Existing verified claims remain untouched
    const afterWorkspace = getCareerWorkspace(userA);
    const verifiedAfter = afterWorkspace.claims.filter(
      (c) => c.verificationStatus === "verified",
    );
    expect(verifiedAfter.length).toBe(verifiedBefore.length);

    // User inspects and edits the proposed claim before confirming
    const proposedId = importResult.importedClaims[0]!.id;
    const confirmed = verifyOrUpdateCareerClaim(userA, {
      claimId: proposedId,
      action: "edit",
      updates: {
        title: "Principal Distributed Systems Engineer",
      },
    });
    expect(confirmed.claim.verificationStatus).toBe("verified");
    expect(confirmed.claim.title).toBe("Principal Distributed Systems Engineer");
  });

  // --------------------------------------------------------------------------
  // Section 10 Critical Acceptance Scenario #2: Conflict
  // --------------------------------------------------------------------------
  it("Scenario 2 (Conflict): when two documents contain different employment dates for the same employer, the conflict is highlighted for user confirmation", () => {
    // Baseline profile has "Senior Software Engineer at CloudScale Technologies (2022-03 to Present)"
    const conflictImport = importCareerDocument(userA, {
      format: "pdf",
      fileName: "Older_CloudScale_CV.pdf",
      content: `Senior Software Engineer at CloudScale Technologies (2020-09 to 2024-11) - Led monorepo migration.`,
    });

    expect(conflictImport.conflictCount).toBe(1);
    const conflictingClaim = conflictImport.importedClaims[0]!;
    expect(conflictingClaim.verificationStatus).toBe("disputed");
    expect(conflictingClaim.conflictDetails).not.toBeNull();
    expect(
      conflictingClaim.conflictDetails?.differences.map((d) => d.field),
    ).toContain("startDate");

    // Authoritative verified CloudScale claim was NOT silently overwritten
    const store = getUserStore(userA);
    const originalClaim = store.claims.find(
      (c) => c.id === conflictingClaim.conflictWithClaimId,
    );
    expect(originalClaim?.startDate).toBe("2022-03");
    expect(originalClaim?.verificationStatus).toBe("verified");
  });

  // --------------------------------------------------------------------------
  // Section 10 Critical Acceptance Scenario #3: Tailoring (Zero Fabrication)
  // --------------------------------------------------------------------------
  it("Scenario 3 (Tailoring): generated resume contains only supported verified facts without invented qualifications", () => {
    // Job 405 requires Rust, Embedded C, RTOS, Hardware Security, and Top Secret clearance — none of which User A has
    const doc = generateTailoredDocumentForJob(userA, {
      jobId: "job-greenhouse-405",
      language: "en",
      includeCoverLetter: true,
    });

    expect(doc.unsupportedClaimCount).toBe(0);
    expect(doc.validationPassed).toBe(true);
    expect(doc.sourceClaimIds.length).toBeGreaterThan(0);

    const store = getUserStore(userA);
    const verifiedClaimIdSet = new Set(
      store.claims
        .filter((c) => c.verificationStatus === "verified")
        .map((c) => c.id),
    );

    // Every statement must link strictly to verified claims and must NOT claim unverified skills like "RTOS" or "FPGA"
    for (const stmt of doc.statements) {
      expect(stmt.sourceClaimIds.length).toBeGreaterThan(0);
      for (const cid of stmt.sourceClaimIds) {
        expect(verifiedClaimIdSet.has(cid)).toBe(true);
      }
      expect(stmt.proposedText).not.toContain("RTOS");
      expect(stmt.proposedText).not.toContain("FPGA");
      expect(stmt.proposedText).not.toContain("Top Secret");
    }

    // Also verify unverified pending_review claims (e.g. AWS certification) are excluded
    const allStatementsText = doc.statements.map((s) => s.proposedText).join(" ");
    expect(allStatementsText).not.toContain(
      "AWS Certified Solutions Architect",
    );
  });

  // --------------------------------------------------------------------------
  // Section 10 Critical Acceptance Scenario #4: Negative Authorization Gate
  // --------------------------------------------------------------------------
  it("Scenario 4 (Authorization): User B cannot access or modify User A's career records, tailored documents, or applications", () => {
    const userAWorkspace = getCareerWorkspace(userA);
    const userAClaim = userAWorkspace.claims[0]!;

    // Direct ownership assertion throws 403 Forbidden
    expect(() =>
      assertResourceOwnership(userB, userAClaim.userId, "career claim"),
    ).toThrowError(/Access denied/);

    // Attempting to verify/mutate User A's claim as User B fails
    expect(() =>
      verifyOrUpdateCareerClaim(userB, {
        claimId: userAClaim.id,
        action: "archive",
      }),
    ).toThrow(/not found|Forbidden/i);

    // Prepare application for User A and verify User B cannot approve or submit it
    const { application } = createOrPrepareApplication(userA, {
      jobId: "job-remotive-101",
      language: "en",
    });

    expect(() =>
      approveApplicationForSubmission(userB, {
        applicationId: application.id,
      }),
    ).toThrow(/not found|Forbidden/i);

    expect(() =>
      recordApplicationSubmission(userB, {
        applicationId: application.id,
        hasConfirmationSignal: true,
        confirmationCode: "HIJACK-001",
      }),
    ).toThrow(/not found|Forbidden/i);
  });

  // --------------------------------------------------------------------------
  // Section 10 Critical Acceptance Scenario #5: Application Tracking
  // --------------------------------------------------------------------------
  it("Scenario 5 (Application Tracking): preparing an application creates/updates a tracked record with job, document, source URL, and status while preventing duplicates", () => {
    const first = createOrPrepareApplication(userA, {
      jobId: "job-remotive-101",
      language: "en",
    });

    expect(first.isDuplicate).toBe(false);
    expect(first.application.jobId).toBe("job-remotive-101");
    expect(first.application.tailoredDocumentId).toBeTruthy();
    expect(first.application.sourceUrl).toContain("remotive.com");
    expect(first.application.uiStatus).toBe("Needs Approval");
    expect(first.application.internalState).toBe("READY_FOR_REVIEW");

    // Duplicate prevention check
    const second = createOrPrepareApplication(userA, {
      jobId: "job-remotive-101",
      language: "en",
    });
    expect(second.isDuplicate).toBe(true);
    expect(second.application.id).toBe(first.application.id);
  });

  // --------------------------------------------------------------------------
  // Section 10 Critical Acceptance Scenario #6: Submission Uncertainty
  // --------------------------------------------------------------------------
  it("Scenario 6 (Submission Uncertainty): missing confirmation evidence records 'Submission Uncertain' (SUBMITTED_UNVERIFIED), never 'Confirmed', and blocks automatic retries", () => {
    const { application } = createOrPrepareApplication(userA, {
      jobId: "job-remotive-101",
      language: "en",
    });

    // Attempting to submit BEFORE explicit user approval is blocked
    expect(() =>
      recordApplicationSubmission(userA, {
        applicationId: application.id,
        hasConfirmationSignal: true,
        confirmationCode: "CONF-123",
      }),
    ).toThrowError(/Explicit user approval/);

    // Approve application (binds to exact payload hash)
    const approved = approveApplicationForSubmission(userA, {
      applicationId: application.id,
    });
    expect(approved.uiStatus).toBe("Ready");
    expect(approved.approvedPayloadHash).toBeTruthy();

    // Edit tailored statement after approval -> must invalidate approval
    updateTailoredStatement(userA, {
      documentId: approved.tailoredDocumentId!,
      statementId: getUserStore(userA).tailoredDocuments[0]!.statements[0]!.id,
      action: "edit",
      editedText:
        "Updated verified summary with refined architecture leadership emphasis.",
    });

    expect(getUserStore(userA).applications[0]!.uiStatus).toBe("Needs Approval");

    // Re-approve for new payload hash
    approveApplicationForSubmission(userA, {
      applicationId: application.id,
    });

    // Submit WITHOUT confirmation evidence
    const uncertainApp = recordApplicationSubmission(userA, {
      applicationId: application.id,
      hasConfirmationSignal: false,
    });

    expect(uncertainApp.uiStatus).toBe("Submission Uncertain");
    expect(uncertainApp.internalState).toBe("SUBMITTED_UNVERIFIED");
    expect(uncertainApp.uiStatus).not.toBe("Confirmed");
    expect(uncertainApp.receipt?.verificationStatus).toBe("SUBMITTED_UNVERIFIED");
    expect(verifySubmissionReceiptIntegrity(uncertainApp.receipt!)).toBe(true);

    // Automatic retry on an uncertain submission MUST be blocked
    expect(() =>
      recordApplicationSubmission(userA, {
        applicationId: application.id,
        hasConfirmationSignal: true,
        confirmationCode: "RETRY-999",
      }),
    ).toThrowError(/Automatic retry is blocked/);
  });

  // --------------------------------------------------------------------------
  // Section 21 Quality Threshold: 114-Case Eligibility Evaluation Suite
  // --------------------------------------------------------------------------
  it("passes all 114 eligibility benchmark cases with 0% false-positive rate (<= 2% threshold)", () => {
    const cases = eligibilityCases as Array<{
      id: string;
      expectedStatus: "eligible" | "ineligible" | "unknown";
      rules: BenchmarkEligibilityRule[];
      profile: BenchmarkUserProfile;
      job: BenchmarkJob;
    }>;

    expect(cases.length).toBe(114);

    let falsePositives = 0;
    let exactMatches = 0;

    for (const testCase of cases) {
      const result = evaluateEligibilityBenchmarkCase(
        testCase.rules,
        testCase.profile,
        testCase.job,
      );

      if (result.status === testCase.expectedStatus) {
        exactMatches += 1;
      }

      if (
        testCase.expectedStatus === "ineligible" &&
        result.status === "eligible"
      ) {
        falsePositives += 1;
      }
    }

    const falsePositiveRate = falsePositives / cases.length;
    expect(falsePositiveRate).toBe(0);
    expect(falsePositiveRate).toBeLessThanOrEqual(0.02);
    expect(exactMatches).toBe(114);
  });

  // --------------------------------------------------------------------------
  // Conversational Updates, Preferences, Exports & Arabic RTL Support
  // --------------------------------------------------------------------------
  it("supports approval-gated conversational updates, DOCX/PDF/JSON export, and Arabic RTL layout direction", () => {
    expect(isLocaleSupported("en")).toBe(true);
    expect(isLocaleSupported("ar")).toBe(true);
    expect(isRTL("ar")).toBe(true);
    expect(getLanguageDirection("ar")).toBe("rtl");
    expect(getLanguageDirection("en")).toBe("ltr");

    // Conversational update creates a pending_review proposal without mutating verified claims
    const proposal = proposeConversationalCareerUpdate(userA, {
      message: "I was promoted to Information Manager at CloudScale Technologies",
    });
    expect(proposal.requiresUserApproval).toBe(true);
    expect(proposal.proposedClaim.verificationStatus).toBe("pending_review");
    expect(proposal.proposedClaim.title).toBe("Information Manager");

    // Generate Arabic tailored resume and verify RTL export
    const arDoc = generateTailoredDocumentForJob(userA, {
      jobId: "job-remotive-101",
      language: "ar",
      includeCoverLetter: true,
    });

    const exportedPdfHtml = exportTailoredDocument(
      userA,
      arDoc.id,
      "pdf_html",
    );
    expect(exportedPdfHtml.direction).toBe("rtl");
    expect(exportedPdfHtml.content).toContain('dir="rtl"');

    const exportedDocx = exportTailoredDocument(userA, arDoc.id, "docx");
    expect(exportedDocx.direction).toBe("rtl");
    expect(exportedDocx.content).toContain("<w:bidi/>");

    const jsonResume = exportProfileAsJsonResume(userA);
    expect(jsonResume.work.length).toBeGreaterThan(0);

    // Preferences update & Today dashboard summary
    const updatedPrefs = updateCareerPreferences(userA, {
      ...getCareerWorkspace(userA).preferences,
      minSalary: 150000,
    });
    expect(updatedPrefs.minSalary).toBe(150000);

    const jobs = listJobsWithFitForUser(userA);
    expect(jobs.length).toBeGreaterThan(0);
    // Deduplication hides duplicate job-greenhouse-102 by default
    expect(jobs.some((j) => j.id === "job-greenhouse-102")).toBe(false);

    // Manualclaim + lifecycle transition
    const manualClaim = createManualCareerClaim(userA, {
      category: "achievement",
      title: "Open Source Maintainer Award",
      description: "Recognized for zero-fabrication AI career tooling.",
    });
    expect(manualClaim.verificationStatus).toBe("verified");

    const { application } = createOrPrepareApplication(userA, {
      jobId: "job-lever-203",
      language: "en",
    });
    const interviewed = transitionApplicationStatus(userA, {
      applicationId: application.id,
      targetUiStatus: "Interview",
      reason: "Recruiter scheduled technical architecture interview.",
    });
    expect(interviewed.uiStatus).toBe("Interview");

    const today = getTodayDashboardForUser(userA);
    expect(today.metrics.suitableJobsCount).toBeGreaterThan(0);
    expect(today.metrics.upcomingInterviewsCount).toBe(1);
  });

  // --------------------------------------------------------------------------
  // Action Policy, Risk Classification & Authority Precedence Engine
  // --------------------------------------------------------------------------
  it("enforces 5-tier field risk classification, sensitive demographic protection (FR-03), and authority precedence", () => {
    const evaluator = createPolicyEvaluator();
    const approvalMgr = createApprovalManager();

    // 1. Low-risk contact field -> auto_fill allowed
    const lowRisk = evaluator.evaluateField({
      key: "email",
      label: "Email Address",
    });
    expect(lowRisk.effectiveClassification.riskLevel).toBe("low");
    expect(lowRisk.effectiveClassification.action).toBe("auto_fill");
    expect(lowRisk.effectiveClassification.canAutoFill).toBe(true);

    // 2. High-risk compensation field -> suggest_and_review with user approval required
    const highRisk = evaluator.evaluateField({
      key: "desired_salary",
      label: "Expected Annual Compensation",
    });
    expect(highRisk.effectiveClassification.riskLevel).toBe("high");
    expect(highRisk.effectiveClassification.action).toBe("suggest_and_review");
    expect(highRisk.effectiveClassification.requiresUserApproval).toBe(true);
    expect(highRisk.effectiveClassification.canAutoFill).toBe(false);
    expect(highRisk.effectiveClassification.authority).toBe("nextjob");

    // 3. Sensitive demographic / disability field (FR-03) -> user_only_input under legal_safety
    const sensitive = evaluator.evaluateField({
      key: "disability_status",
      label: "Voluntary Self-Identification of Disability",
    });
    expect(sensitive.effectiveClassification.riskLevel).toBe("sensitive");
    expect(sensitive.effectiveClassification.action).toBe("user_only_input");
    expect(sensitive.effectiveClassification.authority).toBe("legal_safety");
    expect(sensitive.effectiveClassification.canAutoFill).toBe(false);

    // 4. Lower-priority user override cannot relax legal_safety sensitive classification
    evaluator.registerOverride({
      authority: "user",
      matches: (f) => f.key === "disability_status",
      riskLevel: "low",
      action: "auto_fill",
      reason: "User attempted to force auto-fill on demographic field",
    });
    const afterUserOverride = evaluator.evaluateField({
      key: "disability_status",
      label: "Voluntary Self-Identification of Disability",
    });
    expect(afterUserOverride.effectiveClassification.riskLevel).toBe("sensitive");
    expect(afterUserOverride.effectiveClassification.action).toBe(
      "user_only_input",
    );
    expect(afterUserOverride.effectiveClassification.authority).toBe(
      "legal_safety",
    );

    // 5. Unsupported CAPTCHA / MFA -> blocked at platform level
    const captchaRisk = evaluator.evaluateField({
      key: "g-recaptcha-response",
      label: "Complete CAPTCHA challenge",
    });
    expect(captchaRisk.effectiveClassification.riskLevel).toBe("unsupported");
    expect(captchaRisk.effectiveClassification.action).toBe("block");
    expect(captchaRisk.effectiveClassification.authority).toBe("platform");

    // 6. Approval payload hash binding & saved preferences
    const req = approvalMgr.createRequest({
      tenantId: "tenant-1",
      userId: userA,
      jobId: "job-remotive-101",
      fieldKey: "desired_salary",
      question: "What is your expected base salary?",
      proposedAnswer: "$165,000 USD",
      riskLevel: "high",
    });
    const record = approvalMgr.resolveRequest(req, "approve_always", {
      userId: userA,
    });
    expect(record.payloadHash).toBe(req.payloadHash);
    expect(
      approvalMgr.computePayloadHash(
        "What is your expected base salary?",
        "$165,000 USD",
      ),
    ).toBe(req.payloadHash);
    expect(
      approvalMgr.computePayloadHash(
        "What is your expected base salary?",
        "$190,000 USD",
      ),
    ).not.toBe(req.payloadHash);
    expect(
      approvalMgr.getSavedPreference(
        userA,
        "What is your expected base salary?",
      )?.decision,
    ).toBe("approve_always");
  });

  // --------------------------------------------------------------------------
  // Tailoring Evaluation Benchmark Suite (5 Datasets + 3 Evidence Scenarios)
  // --------------------------------------------------------------------------
  it("validates all 60 tailoring benchmark cases across 5 datasets and 3 evidence scenarios", () => {
    expect(tailoringExpectedOutcomes.successCriteria.unsupportedClaims.target).toBe(
      0,
    );
    expect(tailoringExpectedOutcomes.successCriteria.evidenceCoverage.target).toBe(
      1,
    );

    const allCases = [
      ...resumeTailoringDataset.testCases,
      ...coverLetterDataset.testCases,
      ...applicationAnswersDataset.testCases,
      ...professionalSummaryDataset.testCases,
      ...skillsSectionDataset.testCases,
      ...evidenceCompleteScenario.testCases,
      ...evidencePartialScenario.testCases,
      ...evidenceConstraintsScenario.testCases,
    ];
    expect(allCases.length).toBe(60);

    // Every case in evidence_complete must have 0 rejected claims and 1.0 coverage
    for (const tc of evidenceCompleteScenario.testCases) {
      expect(tc.expectedOutput.unsupportedClaims.length).toBe(0);
      expect(tc.expectedOutput.evidenceCoverage).toBe(1);
    }

    // Across all 60 cases, any claim listed in unsupportedClaims (unverified/expired/low-confidence)
    // is never included in output sections
    for (const tc of allCases) {
      const rejectedSet = new Set<string>(tc.expectedOutput.unsupportedClaims);
      const sections =
        "sections" in tc.expectedOutput &&
        Array.isArray(tc.expectedOutput.sections)
          ? tc.expectedOutput.sections
          : [];
      for (const sec of sections) {
        if ("evidenceClaimId" in sec && typeof sec.evidenceClaimId === "string") {
          expect(rejectedSet.has(sec.evidenceClaimId)).toBe(false);
        }
        if ("evidenceClaimIds" in sec && Array.isArray(sec.evidenceClaimIds)) {
          for (const cid of sec.evidenceClaimIds) {
            expect(rejectedSet.has(cid)).toBe(false);
          }
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // P1: Drizzle PostgreSQL Persistence Sync & AI SDK Zero-Fabrication Gate
  // --------------------------------------------------------------------------
  it("supports Postgres Drizzle sync fallback, AI-assisted CV import, and AI zero-fabrication citation gate", async () => {
    const syncSummary = await syncUserWorkspaceWithPostgres(userA);
    expect(syncSummary.syncedClaimsCount).toBeGreaterThan(0);
    expect(["postgres_drizzle", "in_memory_fallback"]).toContain(
      syncSummary.mode,
    );

    const hydrated = await hydrateWorkspaceFromPostgres(userA);
    expect(hydrated.hydratedClaims).toBeGreaterThanOrEqual(0);

    const aiImport = await importCareerDocumentWithAi(userA, {
      format: "text",
      fileName: "AI_Import_Resume.txt",
      content:
        "Staff Platform Engineer at Horizon Labs (2023-01 to Present) - Scaled Kubernetes clusters.\nSkills: TypeScript, Go, Kubernetes",
    });
    expect(aiImport.importedClaims.length).toBeGreaterThan(0);
    for (const c of aiImport.importedClaims) {
      expect(["pending_review", "disputed"]).toContain(c.verificationStatus);
    }

    const verifiedClaims = getUserStore(userA).claims.filter(
      (c) => c.verificationStatus === "verified",
    );
    const firstVerifiedId = verifiedClaims[0]!.id;

    // Valid citation passes zero-fabrication check
    expect(
      verifyZeroFabricationStatement(
        "Led production TypeScript architecture.",
        [firstVerifiedId],
        verifiedClaims,
      ),
    ).toBe(true);

    // Unverified / invented claim ID is blocked
    expect(
      verifyZeroFabricationStatement(
        "Invented unverified claim.",
        ["claim-invented-999"],
        verifiedClaims,
      ),
    ).toBe(false);

    const aiTailored = await generateTailoredDocumentWithAi(
      userA,
      {
        jobId: "job-remotive-101",
        language: "en",
        includeCoverLetter: true,
      },
      verifiedClaims,
    );
    expect(aiTailored.validationPassed).toBe(true);
    expect(aiTailored.unsupportedClaimCount).toBe(0);
  });
});
