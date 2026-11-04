export type BenchmarkEligibilityStatus = "eligible" | "ineligible" | "unknown";

export type BenchmarkCheckType =
  | "location"
  | "work_authorization"
  | "sponsorship"
  | "license"
  | "certification"
  | "education"
  | "experience"
  | "skill"
  | "language"
  | "clearance";

export interface BenchmarkEligibilityRule {
  tenantId: string;
  name: string;
  checkType: BenchmarkCheckType;
  required?: boolean;
  condition: Record<string, unknown>;
  userId: string;
}

export interface BenchmarkUserProfile {
  location?: {
    country: string;
    city?: string;
    state?: string;
  };
  willingToRelocate?: boolean;
  workAuthorization?: {
    authorizations: string[];
  };
  needsSponsorship?: boolean;
  licenses?: Array<{
    name: string;
    valid: boolean;
  }>;
  certifications?: Array<{
    name: string;
  }>;
  education?: Array<{
    degree?: string;
    field?: string;
  }>;
  experience?: Array<{
    startDate?: string;
    endDate?: string;
  }>;
  skills?: Array<{
    name: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency?: string;
  }>;
  securityClearance?: string;
}

export interface BenchmarkJob {
  location?: {
    country: string;
    city?: string;
    remote?: boolean;
  };
  visaSponsorship?: boolean;
}

export interface BenchmarkCheckResult {
  type: BenchmarkCheckType;
  status: BenchmarkEligibilityStatus;
  required: boolean;
  reason?: string;
  details?: Record<string, unknown>;
}

const DEGREE_LEVELS = [
  "high_school",
  "associate",
  "bachelor",
  "master",
  "doctorate",
] as const;

const PROFICIENCY_LEVELS = [
  "basic",
  "intermediate",
  "professional",
  "fluent",
  "native",
] as const;

const CLEARANCE_LEVELS = [
  "none",
  "confidential",
  "secret",
  "top_secret",
  "ts_sci",
] as const;

const runSingleRuleCheck = (
  rule: BenchmarkEligibilityRule,
  userProfile: BenchmarkUserProfile,
  job: BenchmarkJob,
): BenchmarkCheckResult => {
  const required = rule.required ?? true;
  const condition = rule.condition;

  switch (rule.checkType) {
    case "location": {
      const userLocation = userProfile.location;
      const jobLocation = job.location;

      if (!userLocation) {
        return {
          type: "location",
          status: "unknown",
          required,
          reason: "Location information missing",
        };
      }

      if (jobLocation?.remote && condition.allowRemote !== false) {
        return {
          type: "location",
          status: "eligible",
          required,
          reason: "Remote position",
        };
      }

      const countries = Array.isArray(condition.countries)
        ? (condition.countries as string[])
        : null;
      if (countries && !countries.includes(userLocation.country)) {
        return {
          type: "location",
          status: "ineligible",
          required,
          reason: `User location (${userLocation.country}) not in allowed countries`,
          details: { allowed: countries },
        };
      }

      if (condition.requireRelocation && !userProfile.willingToRelocate) {
        return {
          type: "location",
          status: "ineligible",
          required,
          reason: "Job requires relocation but user is not willing",
        };
      }

      return { type: "location", status: "eligible", required };
    }

    case "work_authorization": {
      const userAuth = userProfile.workAuthorization;
      if (!userAuth) {
        return {
          type: "work_authorization",
          status: "unknown",
          required,
          reason: "Work authorization information missing",
        };
      }

      const requiredAuths = Array.isArray(condition.requiredAuthorizations)
        ? (condition.requiredAuthorizations as string[])
        : null;

      if (requiredAuths) {
        const hasAuth = requiredAuths.some((auth) =>
          userAuth.authorizations?.includes(auth),
        );
        if (!hasAuth) {
          return {
            type: "work_authorization",
            status: "ineligible",
            required,
            reason: "User does not have required work authorization",
            details: { required: requiredAuths },
          };
        }
      }

      return { type: "work_authorization", status: "eligible", required };
    }

    case "sponsorship": {
      const userNeedsSponsorship = userProfile.needsSponsorship;
      const jobOffersSponsorship = job.visaSponsorship;

      if (userNeedsSponsorship && !jobOffersSponsorship) {
        return {
          type: "sponsorship",
          status: "ineligible",
          required,
          reason: "User needs sponsorship but job does not offer it",
        };
      }

      if (condition.requireNoSponsorship && userNeedsSponsorship) {
        return {
          type: "sponsorship",
          status: "ineligible",
          required,
          reason: "Job requires no sponsorship needed",
        };
      }

      return { type: "sponsorship", status: "eligible", required };
    }

    case "license": {
      const userLicenses = userProfile.licenses ?? [];
      const requiredLicenses = Array.isArray(condition.requiredLicenses)
        ? (condition.requiredLicenses as string[])
        : null;

      if (requiredLicenses) {
        const hasAll = requiredLicenses.every((req) =>
          userLicenses.some((u) => u.name === req && u.valid),
        );
        if (!hasAll) {
          return {
            type: "license",
            status: "ineligible",
            required,
            reason: "User does not have required licenses",
            details: { required: requiredLicenses },
          };
        }
      }

      return { type: "license", status: "eligible", required };
    }

    case "certification": {
      const userCerts = userProfile.certifications ?? [];
      const requiredCerts = Array.isArray(condition.requiredCertifications)
        ? (condition.requiredCertifications as string[])
        : null;

      if (requiredCerts) {
        const hasAll = requiredCerts.every((req) =>
          userCerts.some((u) => u.name === req),
        );
        if (!hasAll) {
          return {
            type: "certification",
            status: "ineligible",
            required,
            reason: "User does not have required certifications",
            details: { required: requiredCerts },
          };
        }
      }

      return { type: "certification", status: "eligible", required };
    }

    case "education": {
      const userEducation = userProfile.education ?? [];
      if (typeof condition.minimumDegree === "string") {
        const requiredLevel = DEGREE_LEVELS.indexOf(
          condition.minimumDegree as (typeof DEGREE_LEVELS)[number],
        );
        const hasDegree = userEducation.some((edu) => {
          const userLevel = DEGREE_LEVELS.indexOf(
            (edu.degree?.toLowerCase() ?? "") as (typeof DEGREE_LEVELS)[number],
          );
          return userLevel >= requiredLevel;
        });
        if (!hasDegree) {
          return {
            type: "education",
            status: "ineligible",
            required,
            reason: `User does not have minimum required education (${condition.minimumDegree})`,
          };
        }
      }

      const requiredFields = Array.isArray(condition.requiredFields)
        ? (condition.requiredFields as string[])
        : null;
      if (requiredFields) {
        const hasField = userEducation.some((edu) =>
          requiredFields.some((field) =>
            edu.field?.toLowerCase().includes(field.toLowerCase()),
          ),
        );
        if (!hasField) {
          return {
            type: "education",
            status: "ineligible",
            required,
            reason: "User does not have required field of study",
            details: { required: requiredFields },
          };
        }
      }

      return { type: "education", status: "eligible", required };
    }

    case "experience": {
      const userExperience = userProfile.experience ?? [];
      if (typeof condition.minimumYears === "number") {
        const totalYears = userExperience.reduce((total, exp) => {
          if (!exp.startDate) return total;
          const start = new Date(exp.startDate);
          const end = exp.endDate ? new Date(exp.endDate) : new Date();
          const years =
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return total + years;
        }, 0);

        if (totalYears < condition.minimumYears) {
          return {
            type: "experience",
            status: "ineligible",
            required,
            reason: `User has ${totalYears.toFixed(1)} years of experience, but ${condition.minimumYears} required`,
          };
        }
      }

      return { type: "experience", status: "eligible", required };
    }

    case "skill": {
      const userSkills = new Set(
        (userProfile.skills ?? []).map((s) => s.name.toLowerCase()),
      );
      const requiredSkills = Array.isArray(condition.requiredSkills)
        ? (condition.requiredSkills as string[])
        : null;

      if (requiredSkills) {
        const missing = requiredSkills.filter(
          (req) => !userSkills.has(req.toLowerCase()),
        );
        if (missing.length > 0) {
          return {
            type: "skill",
            status: "ineligible",
            required,
            reason: "User does not have required skills",
            details: { missing },
          };
        }
      }

      return { type: "skill", status: "eligible", required };
    }

    case "language": {
      const userLanguages = userProfile.languages ?? [];
      const requiredLanguages = Array.isArray(condition.requiredLanguages)
        ? (condition.requiredLanguages as Array<{
            language: string;
            proficiency?: string;
          }>)
        : null;

      if (requiredLanguages) {
        const hasAll = requiredLanguages.every((req) =>
          userLanguages.some((user) => {
            if (user.language.toLowerCase() !== req.language.toLowerCase()) {
              return false;
            }
            const reqLevel = PROFICIENCY_LEVELS.indexOf(
              (req.proficiency?.toLowerCase() ??
                "intermediate") as (typeof PROFICIENCY_LEVELS)[number],
            );
            const userLevel = PROFICIENCY_LEVELS.indexOf(
              (user.proficiency?.toLowerCase() ??
                "basic") as (typeof PROFICIENCY_LEVELS)[number],
            );
            return userLevel >= reqLevel;
          }),
        );
        if (!hasAll) {
          return {
            type: "language",
            status: "ineligible",
            required,
            reason: "User does not have required language proficiency",
            details: { required: requiredLanguages },
          };
        }
      }

      return { type: "language", status: "eligible", required };
    }

    case "clearance": {
      const userClearance = userProfile.securityClearance;
      if (typeof condition.requiredClearance === "string") {
        const reqLevel = CLEARANCE_LEVELS.indexOf(
          condition.requiredClearance.toLowerCase() as (typeof CLEARANCE_LEVELS)[number],
        );
        const userLevel = CLEARANCE_LEVELS.indexOf(
          (userClearance?.toLowerCase() ??
            "none") as (typeof CLEARANCE_LEVELS)[number],
        );
        if (userLevel < reqLevel) {
          return {
            type: "clearance",
            status: "ineligible",
            required,
            reason: `User has ${userClearance ?? "no"} clearance, but ${condition.requiredClearance} required`,
          };
        }
      }

      return { type: "clearance", status: "eligible", required };
    }
  }
};

export const evaluateEligibilityBenchmarkCase = (
  rules: BenchmarkEligibilityRule[],
  profile: BenchmarkUserProfile,
  job: BenchmarkJob,
): {
  status: BenchmarkEligibilityStatus;
  checks: BenchmarkCheckResult[];
} => {
  const checks = rules.map((rule) => runSingleRuleCheck(rule, profile, job));

  const hasIneligible = checks.some(
    (c) => c.status === "ineligible" && c.required,
  );
  const hasUnknown = checks.some((c) => c.status === "unknown" && c.required);

  const status: BenchmarkEligibilityStatus = hasIneligible
    ? "ineligible"
    : hasUnknown
      ? "unknown"
      : "eligible";

  return {
    status,
    checks,
  };
};
