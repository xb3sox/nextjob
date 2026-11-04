import { eq } from "@workspace/db";
import {
  careerClaim,
  careerPreference,
  careerProfile,
  jobApplication,
  jobListing,
  submissionReceiptTable,
} from "@workspace/db/schema";

import {
  computeJobFingerprint,
  getGlobalJobCatalog,
  getUserStore,
  upsertGlobalJobListings,
} from "./store";

import type { CareerClaimItem, RawJobListing } from "./store";
import type { CareerClaimType } from "@workspace/db/schema";

export interface PostgresSyncSummary {
  connected: boolean;
  mode: "postgres_drizzle" | "in_memory_fallback";
  syncedClaimsCount: number;
  syncedJobsCount: number;
  syncedApplicationsCount: number;
  syncedAt: string;
  error?: string;
}

const mapCategoryToDbClaimType = (
  category: CareerClaimItem["category"],
): CareerClaimType => {
  switch (category) {
    case "experience":
    case "education":
    case "skill":
    case "project":
    case "certification":
    case "achievement":
    case "language":
      return category;
    default:
      return "summary";
  }
};

const mapDbTypeToCategory = (
  type: CareerClaimType,
): CareerClaimItem["category"] => {
  switch (type) {
    case "experience":
    case "education":
    case "skill":
    case "project":
    case "certification":
    case "achievement":
    case "language":
      return type;
    default:
      return "summary";
  }
};

/**
 * Synchronizes the user's in-memory NextJob workspace and global job catalog
 * with PostgreSQL via Drizzle ORM (`@workspace/db/server`) when `DATABASE_URL` is configured.
 * Gracefully falls back to in-memory state in test or offline environments.
 */
export const syncUserWorkspaceWithPostgres = async (
  userId: string,
): Promise<PostgresSyncSummary> => {
  const store = getUserStore(userId);
  const catalog = getGlobalJobCatalog();
  const syncedAt = new Date().toISOString();

  if (!process.env.DATABASE_URL) {
    return {
      connected: false,
      mode: "in_memory_fallback",
      syncedClaimsCount: store.claims.length,
      syncedJobsCount: catalog.length,
      syncedApplicationsCount: store.applications.length,
      syncedAt,
    };
  }

  try {
    const { db } = await import("@workspace/db/server");

    // 1. Upsert career profile
    await db
      .insert(careerProfile)
      .values({
        userId,
        headline: store.profile.headline,
        summary: store.profile.summary,
        locationCountry: store.profile.location,
        workAuthorizations: store.preferences.workAuthorizationCountries,
        needsSponsorship: store.preferences.requiresSponsorship,
        automationMode: store.preferences.requireApprovalBeforeSubmit
          ? "approve_and_apply"
          : "assist",
      })
      .onConflictDoUpdate({
        target: careerProfile.userId,
        set: {
          headline: store.profile.headline,
          summary: store.profile.summary,
          locationCountry: store.profile.location,
          workAuthorizations: store.preferences.workAuthorizationCountries,
          needsSponsorship: store.preferences.requiresSponsorship,
          updatedAt: new Date(),
        },
      });

    // 2. Upsert career preferences
    await db
      .insert(careerPreference)
      .values({
        userId,
        targetRoles: store.preferences.targetRoles,
        locations: store.preferences.locations,
        workMode: store.preferences.workModes[0] ?? "remote",
        salaryMin: store.preferences.minSalary,
        salaryCurrency: store.preferences.currency,
        excludedCompanies: store.preferences.excludedCompanies,
      })
      .onConflictDoUpdate({
        target: careerPreference.userId,
        set: {
          targetRoles: store.preferences.targetRoles,
          locations: store.preferences.locations,
          workMode: store.preferences.workModes[0] ?? "remote",
          salaryMin: store.preferences.minSalary,
          salaryCurrency: store.preferences.currency,
          excludedCompanies: store.preferences.excludedCompanies,
          updatedAt: new Date(),
        },
      });

    // 3. Upsert career claims
    for (const claim of store.claims) {
      const dbStatus =
        claim.verificationStatus === "verified"
          ? "verified"
          : claim.verificationStatus === "rejected" ||
              claim.verificationStatus === "archived"
            ? "rejected"
            : claim.verificationStatus === "unverified"
              ? "unverified"
              : "pending_review";

      await db
        .insert(careerClaim)
        .values({
          id: claim.id,
          userId,
          type: mapCategoryToDbClaimType(claim.category),
          title: claim.title,
          description: claim.description,
          content: {
            organization: claim.organization,
            location: claim.location,
            startDate: claim.startDate,
            endDate: claim.endDate,
            skills: claim.skills,
            metrics: claim.metrics,
          },
          evidenceSource: claim.evidenceId ?? "PostgreSQL Career Graph",
          confidence: claim.confidence,
          verificationStatus: dbStatus,
          version: 1,
          archived: claim.verificationStatus === "archived",
        })
        .onConflictDoUpdate({
          target: careerClaim.id,
          set: {
            title: claim.title,
            description: claim.description,
            verificationStatus: dbStatus,
            archived: claim.verificationStatus === "archived",
            updatedAt: new Date(),
          },
        });
    }

    // 4. Upsert global job listings
    for (const job of catalog) {
      await db
        .insert(jobListing)
        .values({
          id: job.id,
          sourceName: job.sourceName,
          externalId: job.externalId,
          fingerprint: computeJobFingerprint(
            job.company,
            job.title,
            job.location,
          ),
          title: job.title,
          companyName: job.company,
          locationCountry: job.location,
          remote: job.workMode === "remote",
          workMode: job.workMode,
          employmentType: job.employmentType,
          salaryMin: job.salaryMin ?? undefined,
          salaryMax: job.salaryMax ?? undefined,
          salaryCurrency: job.salaryCurrency ?? "USD",
          description: job.description,
          requiredSkills: job.requiredSkills,
          preferredSkills: job.preferredSkills,
          minimumYearsExperience: job.requiredExperienceYears ?? undefined,
          minimumDegree: job.requiredEducation ?? undefined,
          visaSponsorship: job.sponsorshipAvailable ?? false,
          sourceUrl: job.sourceUrl,
          status: job.status,
        })
        .onConflictDoNothing();
    }

    // 5. Upsert applications and receipts
    for (const app of store.applications) {
      await db
        .insert(jobApplication)
        .values({
          id: app.id,
          userId,
          jobId: app.jobId,
          status: app.uiStatus,
          machineState: app.internalState,
          notes: app.notes ?? undefined,
          submittedAt: app.submittedAt ? new Date(app.submittedAt) : undefined,
        })
        .onConflictDoUpdate({
          target: jobApplication.id,
          set: {
            status: app.uiStatus,
            machineState: app.internalState,
            notes: app.notes ?? undefined,
            updatedAt: new Date(),
          },
        });

      if (app.receipt) {
        await db
          .insert(submissionReceiptTable)
          .values({
            id: app.receipt.id,
            receiptId: app.receipt.id,
            applicationId: app.id,
            userId,
            jobVersion: "1",
            fieldHashes: { payloadHash: app.receipt.payloadHash },
            answerHashes: [],
            confirmationEvidenceId: app.receipt.confirmationCode ?? undefined,
            verificationStatus:
              app.receipt.verificationStatus === "SUBMITTED_VERIFIED"
                ? "verified"
                : "unverified",
            contentHash: app.receipt.receiptHash,
            submittedAt: new Date(app.receipt.submittedAt),
          })
          .onConflictDoNothing();
      }
    }

    return {
      connected: true,
      mode: "postgres_drizzle",
      syncedClaimsCount: store.claims.length,
      syncedJobsCount: catalog.length,
      syncedApplicationsCount: store.applications.length,
      syncedAt,
    };
  } catch (err) {
    return {
      connected: false,
      mode: "in_memory_fallback",
      syncedClaimsCount: store.claims.length,
      syncedJobsCount: catalog.length,
      syncedApplicationsCount: store.applications.length,
      syncedAt,
      error:
        err instanceof Error
          ? err.message
          : "PostgreSQL connection unavailable",
    };
  }
};

/**
 * Hydrates in-memory store from PostgreSQL when a database connection is active.
 */
export const hydrateWorkspaceFromPostgres = async (
  userId: string,
): Promise<{ hydratedClaims: number; hydratedJobs: number }> => {
  if (!process.env.DATABASE_URL) {
    return { hydratedClaims: 0, hydratedJobs: 0 };
  }

  try {
    const { db } = await import("@workspace/db/server");
    const store = getUserStore(userId);

    const dbClaims = await db
      .select()
      .from(careerClaim)
      .where(eq(careerClaim.userId, userId));

    const existingClaimIds = new Set(store.claims.map((c) => c.id));
    let hydratedClaims = 0;

    for (const row of dbClaims) {
      if (!existingClaimIds.has(row.id)) {
        const contentObj = row.content ?? {};
        store.claims.push({
          id: row.id,
          userId,
          profileId: store.profile.id,
          evidenceId: row.evidenceId ?? null,
          category: mapDbTypeToCategory(row.type),
          title: row.title,
          organization:
            typeof contentObj.organization === "string"
              ? contentObj.organization
              : null,
          location:
            typeof contentObj.location === "string"
              ? contentObj.location
              : null,
          startDate:
            typeof contentObj.startDate === "string"
              ? contentObj.startDate
              : null,
          endDate:
            typeof contentObj.endDate === "string" ? contentObj.endDate : null,
          isCurrent: false,
          description: row.description ?? "",
          skills: Array.isArray(contentObj.skills)
            ? contentObj.skills.filter(
                (s): s is string => typeof s === "string",
              )
            : [],
          metrics: Array.isArray(contentObj.metrics)
            ? contentObj.metrics.filter(
                (m): m is string => typeof m === "string",
              )
            : [],
          verificationStatus:
            row.verificationStatus === "verified"
              ? "verified"
              : "pending_review",
          confidence: row.confidence,
          conflictWithClaimId: null,
          conflictDetails: null,
          updatedAt: row.updatedAt.toISOString(),
        });
        hydratedClaims++;
      }
    }

    const dbJobs = await db.select().from(jobListing);
    const normalizedJobs: RawJobListing[] = dbJobs.map((j) => ({
      id: j.id,
      externalId: j.externalId ?? j.id,
      sourceName: j.sourceName,
      sourceUrl: j.sourceUrl,
      title: j.title,
      company: j.companyName,
      location: j.locationCountry,
      workMode:
        j.workMode === "remote" ||
        j.workMode === "hybrid" ||
        j.workMode === "on-site"
          ? j.workMode
          : "remote",
      employmentType: "full-time",
      seniorityLevel: "Senior",
      salaryMin: j.salaryMin ?? null,
      salaryMax: j.salaryMax ?? null,
      salaryCurrency: j.salaryCurrency,
      description: j.description,
      requiredSkills: j.requiredSkills,
      preferredSkills: j.preferredSkills,
      requiredExperienceYears: j.minimumYearsExperience ?? null,
      requiredEducation: j.minimumDegree ?? null,
      sponsorshipAvailable: j.visaSponsorship,
      allowedCountries: ["Global"],
      status: j.status === "expired" ? "expired" : "active",
      postedAt: j.postedAt.toISOString(),
    }));

    const hydratedJobs = upsertGlobalJobListings(normalizedJobs);

    return { hydratedClaims, hydratedJobs };
  } catch {
    return { hydratedClaims: 0, hydratedJobs: 0 };
  }
};
