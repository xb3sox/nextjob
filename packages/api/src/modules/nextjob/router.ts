import { Hono } from "hono";
import * as z from "zod";

import { enforceAuth, validate } from "../../middleware";
import {
  approveApplicationPayloadSchema,
  careerPreferencesSchema,
  conversationalUpdatePayloadSchema,
  createApplicationPayloadSchema,
  createManualClaimPayloadSchema,
  evaluateFieldPolicyPayloadSchema,
  generateTailoredDocumentPayloadSchema,
  importCareerPayloadSchema,
  submitApplicationPayloadSchema,
  transitionApplicationPayloadSchema,
  updateTailoredStatementPayloadSchema,
  upsertReusableAnswerPayloadSchema,
  verifyClaimPayloadSchema,
} from "../../schema/nextjob";
import {
  generateTailoredDocumentWithAi,
  importCareerDocumentWithAi,
} from "./ai-provider";
import {
  approveApplicationForSubmission,
  createOrPrepareApplication,
  getTodayDashboardForUser,
  listApplicationsForUser,
  recordApplicationSubmission,
  transitionApplicationStatus,
  verifySubmissionReceiptIntegrity,
} from "./applications-service";
import {
  createManualCareerClaim,
  exportProfileAsJsonResume,
  getCareerWorkspace,
  importCareerDocument,
  proposeConversationalCareerUpdate,
  resetCareerPreferences,
  updateCareerPreferences,
  upsertReusableAnswer,
  verifyOrUpdateCareerClaim,
} from "./career-service";
import {
  hydrateWorkspaceFromPostgres,
  syncUserWorkspaceWithPostgres,
} from "./db-persistence";
import {
  listJobsWithFitForUser,
  syncPermittedPublicJobSources,
  toggleSavedJob,
} from "./jobs-service";
import { defaultPolicyEvaluator } from "./policy-service";
import { getUserStore } from "./store";
import {
  exportTailoredDocument,
  generateTailoredDocumentForJob,
  updateTailoredStatement,
} from "./tailoring-service";

export const nextjobRouter = new Hono()
  .use(enforceAuth)
  .get("/today", (c) => {
    c.header("Cache-Control", "no-store");
    return c.json(getTodayDashboardForUser(c.var.user.id));
  })
  .get("/career", (c) => {
    c.header("Cache-Control", "no-store");
    return c.json(getCareerWorkspace(c.var.user.id));
  })
  .post("/career/import", validate("json", importCareerPayloadSchema), (c) => {
    return c.json(importCareerDocument(c.var.user.id, c.req.valid("json")));
  })
  .post("/career/claims/verify", validate("json", verifyClaimPayloadSchema), (c) => {
    return c.json(verifyOrUpdateCareerClaim(c.var.user.id, c.req.valid("json")));
  })
  .post(
    "/career/claims/manual",
    validate("json", createManualClaimPayloadSchema),
    (c) => {
      return c.json(createManualCareerClaim(c.var.user.id, c.req.valid("json")));
    },
  )
  .post(
    "/career/conversational",
    validate("json", conversationalUpdatePayloadSchema),
    (c) => {
      return c.json(
        proposeConversationalCareerUpdate(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .put("/career/preferences", validate("json", careerPreferencesSchema), (c) => {
    return c.json(updateCareerPreferences(c.var.user.id, c.req.valid("json")));
  })
  .post("/career/preferences/reset", (c) => {
    return c.json(resetCareerPreferences(c.var.user.id));
  })
  .post(
    "/career/answers",
    validate("json", upsertReusableAnswerPayloadSchema),
    (c) => {
      return c.json(upsertReusableAnswer(c.var.user.id, c.req.valid("json")));
    },
  )
  .get("/career/export/json-resume", (c) => {
    return c.json(exportProfileAsJsonResume(c.var.user.id));
  })
  .get(
    "/jobs",
    validate(
      "query",
      z.object({
        search: z.string().optional(),
        workMode: z.string().optional(),
        eligibility: z.string().optional(),
        includeDuplicates: z.string().optional(),
        includeExpired: z.string().optional(),
        savedOnly: z.string().optional(),
      }),
    ),
    (c) => {
      const q = c.req.valid("query");
      return c.json({
        jobs: listJobsWithFitForUser(c.var.user.id, {
          search: q.search,
          workMode: q.workMode,
          eligibility: q.eligibility,
          includeDuplicates: q.includeDuplicates === "true",
          includeExpired: q.includeExpired === "true",
          savedOnly: q.savedOnly === "true",
        }),
      });
    },
  )
  .post(
    "/jobs/save",
    validate("json", z.object({ jobId: z.string().min(1) })),
    (c) => {
      return c.json(toggleSavedJob(c.var.user.id, c.req.valid("json").jobId));
    },
  )
  .post("/jobs/sync", async (c) => {
    return c.json(await syncPermittedPublicJobSources(c.var.user.id));
  })
  .get("/tailoring", (c) => {
    const store = getUserStore(c.var.user.id);
    return c.json({ documents: store.tailoredDocuments });
  })
  .post(
    "/tailoring/generate",
    validate("json", generateTailoredDocumentPayloadSchema),
    (c) => {
      return c.json(
        generateTailoredDocumentForJob(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/tailoring/statement",
    validate("json", updateTailoredStatementPayloadSchema),
    (c) => {
      return c.json(
        updateTailoredStatement(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/tailoring/export",
    validate(
      "json",
      z.object({
        documentId: z.string().min(1),
        format: z.enum(["docx", "pdf_html", "json"]),
      }),
    ),
    (c) => {
      const { documentId, format } = c.req.valid("json");
      return c.json(exportTailoredDocument(c.var.user.id, documentId, format));
    },
  )
  .get("/applications", (c) => {
    c.header("Cache-Control", "no-store");
    const store = getUserStore(c.var.user.id);
    return c.json({
      applications: listApplicationsForUser(c.var.user.id),
      documents: store.tailoredDocuments,
    });
  })
  .post(
    "/applications/prepare",
    validate("json", createApplicationPayloadSchema),
    (c) => {
      return c.json(
        createOrPrepareApplication(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/applications/approve",
    validate("json", approveApplicationPayloadSchema),
    (c) => {
      return c.json(
        approveApplicationForSubmission(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/applications/submit",
    validate("json", submitApplicationPayloadSchema),
    (c) => {
      return c.json(
        recordApplicationSubmission(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/applications/transition",
    validate("json", transitionApplicationPayloadSchema),
    (c) => {
      return c.json(
        transitionApplicationStatus(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/applications/verify-receipt",
    validate("json", z.object({ applicationId: z.string().min(1) })),
    (c) => {
      const store = getUserStore(c.var.user.id);
      const app = store.applications.find(
        (a) => a.id === c.req.valid("json").applicationId,
      );
      if (!app || !app.receipt) {
        return c.json({ verified: false, reason: "No receipt found." });
      }
      const isAuthentic = verifySubmissionReceiptIntegrity(app.receipt);
      return c.json({
        verified: isAuthentic,
        receiptHash: app.receipt.receiptHash,
        payloadHash: app.receipt.payloadHash,
        verificationStatus: app.receipt.verificationStatus,
      });
    },
  )
  .post(
    "/policy/evaluate",
    validate("json", evaluateFieldPolicyPayloadSchema),
    (c) => {
      const { fields } = c.req.valid("json");
      return c.json({
        results: defaultPolicyEvaluator.evaluateBatch(fields),
      });
    },
  )
  .post("/career/sync-db", async (c) => {
    return c.json(await syncUserWorkspaceWithPostgres(c.var.user.id));
  })
  .post("/career/hydrate-db", async (c) => {
    return c.json(await hydrateWorkspaceFromPostgres(c.var.user.id));
  })
  .post(
    "/career/import-ai",
    validate("json", importCareerPayloadSchema),
    async (c) => {
      return c.json(
        await importCareerDocumentWithAi(c.var.user.id, c.req.valid("json")),
      );
    },
  )
  .post(
    "/tailoring/generate-ai",
    validate("json", generateTailoredDocumentPayloadSchema),
    async (c) => {
      const store = getUserStore(c.var.user.id);
      const verifiedClaims = store.claims.filter(
        (claim) => claim.verificationStatus === "verified",
      );
      return c.json(
        await generateTailoredDocumentWithAi(
          c.var.user.id,
          c.req.valid("json"),
          verifiedClaims,
        ),
      );
    },
  )
  .get("/extension/autofill-bundle", (c) => {
    const store = getUserStore(c.var.user.id);
    const verifiedClaims = store.claims.filter(
      (claim) => claim.verificationStatus === "verified",
    );
    const latestExp = verifiedClaims.find(
      (claim) => claim.category === "experience",
    );
    const userDisplayName = c.var.user.name || "Alex Rivera";
    const [firstName = "Alex", ...lastParts] = userDisplayName.split(" ");
    const lastName = lastParts.join(" ") || "Rivera";

    const standardFields = defaultPolicyEvaluator.evaluateBatch([
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "desired_salary", label: "Expected Salary" },
      { key: "disability_status", label: "Voluntary Disability Self-ID" },
    ]);

    return c.json({
      profile: {
        firstName,
        lastName,
        fullName: userDisplayName,
        email: c.var.user.email || "alex.rivera@nextjob.dev",
        phone: "+1-555-019-2834",
        location: store.profile.location,
        linkedinUrl: "https://linkedin.com/in/alexrivera-dev",
        githubUrl: "https://github.com/alexrivera",
        portfolioUrl: "https://alexrivera.dev",
        currentCompany: latestExp?.organization ?? "CloudScale Technologies",
        currentTitle: latestExp?.title ?? store.profile.headline,
        summary: store.profile.summary,
      },
      automationPaused: false,
      requireApprovalBeforeSubmit:
        store.preferences.requireApprovalBeforeSubmit,
      reusableAnswers: store.reusableAnswers,
      policyPreview: standardFields,
    });
  });
