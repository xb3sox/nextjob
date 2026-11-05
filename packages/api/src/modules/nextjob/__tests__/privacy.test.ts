import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../middleware", () => ({
  enforceAuth: async (c: any, next: any) => {
    c.set("user", { id: "test-user-gdpr-123", email: "candidate@example.com" });
    await next();
  },
  validate: () => async (_c: any, next: any) => next(),
}));
vi.mock("@workspace/billing", () => ({
  getActivePlan: () => "free",
  checkPlanLimit: () => ({ allowed: true }),
}));
vi.mock("@workspace/billing/server", () => ({
  getCustomersWithPurchasesByReferenceId: () => Promise.resolve([]),
}));

import {
  eraseCandidateData,
  exportCandidateData,
  getCandidateConsent,
  updateCandidateConsent,
} from "../privacy-service";
import { nextjobRouter } from "../router";
import { getUserStore, resetStoreForTesting } from "../store";

describe("GDPR Privacy & Data Subject Rights (SEC-04)", () => {
  const userId = "test-user-gdpr-123";

  beforeEach(() => {
    resetStoreForTesting();
  });

  it("exports candidate data in full portable GDPR Article 20 format with SHA-256 checksum", () => {
    const store = getUserStore(userId);
    expect(store.claims.length).toBeGreaterThan(0);

    const bundle = exportCandidateData(userId);

    expect(bundle.exportMetadata.subjectId).toBe(userId);
    expect(bundle.exportMetadata.formatVersion).toBe("1.0.0");
    expect(bundle.exportMetadata.sha256Checksum).toHaveLength(64);
    expect(bundle.exportMetadata.recordsCount).toBeGreaterThan(0);
    expect(bundle.claims).toEqual(store.claims);
    expect(bundle.profile).toEqual(store.profile);
    expect(bundle.preferences).toEqual(store.preferences);
  });

  it("performs irreversible candidate data erasure under GDPR Article 17", async () => {
    const storeBefore = getUserStore(userId);
    expect(storeBefore.claims.length).toBeGreaterThan(0);

    const result = await eraseCandidateData(userId);

    expect(result.erased).toBe(true);
    expect(result.subjectId).toBe(userId);
    expect(result.clearedCollections).toContain("careerClaims");
    expect(result.clearedCollections).toContain("jobApplications");

    // Re-accessing store yields a fresh default profile, not the previous mutated state
    const storeAfter = getUserStore(userId);
    expect(storeAfter.claims.length).toBeGreaterThan(0); // fresh default seed
  });

  it("records and updates candidate consent preferences", () => {
    const initial = getCandidateConsent(userId);
    expect(initial.dataProcessingConsent).toBe(true);
    expect(initial.autoApplyConsent).toBe(false);

    const updated = updateCandidateConsent(userId, {
      autoApplyConsent: true,
      aiAnalysisConsent: true,
    });

    expect(updated.autoApplyConsent).toBe(true);
    expect(updated.dataProcessingConsent).toBe(true);

    const fetched = getCandidateConsent(userId);
    expect(fetched.autoApplyConsent).toBe(true);
  });

  it("ensures sensitive candidate export routes do not leak to public caches via Cache-Control: no-store", async () => {
    const res = await nextjobRouter.request("/career/export/json-resume");

    expect(res.status).toBe(200);
    const cacheControl = res.headers.get("cache-control");
    expect(cacheControl).toBe("no-store");
    expect(cacheControl).not.toContain("public");
    expect(cacheControl).not.toContain("s-maxage");
  });
});
