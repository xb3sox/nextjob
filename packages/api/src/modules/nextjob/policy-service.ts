import { computeSha256, createId } from "./store";

const nowIso = (): string => new Date().toISOString();

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "sensitive"
  | "unsupported";

export type PolicyAuthority =
  | "legal_safety"
  | "platform"
  | "nextjob"
  | "organization"
  | "user"
  | "context";

export type PolicyAction =
  | "auto_fill"
  | "suggest_and_review"
  | "user_only_input"
  | "block";

export type ApprovalDecision =
  | "approve_once"
  | "approve_always"
  | "edit"
  | "reject"
  | "block";

export interface FieldMetadata {
  key: string;
  label?: string;
  name?: string;
  type?: string;
  category?: string;
  contextQuestion?: string;
  proposedAnswer?: string;
}

export interface FieldClassification {
  key: string;
  riskLevel: RiskLevel;
  action: PolicyAction;
  reason: string;
  authority: PolicyAuthority;
  requiresUserApproval: boolean;
  canAutoFill: boolean;
}

export interface PolicyRuleEvaluation {
  authority: PolicyAuthority;
  riskLevel: RiskLevel;
  action: PolicyAction;
  reason: string;
  effective: boolean;
}

export interface PolicyEvaluationResult {
  field: FieldMetadata;
  effectiveClassification: FieldClassification;
  rulesEvaluated: PolicyRuleEvaluation[];
}

export interface CustomPolicyOverride {
  authority: PolicyAuthority;
  matches: (field: FieldMetadata) => boolean;
  riskLevel: RiskLevel;
  action: PolicyAction;
  reason: string;
}

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  userId: string;
  jobId: string;
  fieldKey: string;
  question: string;
  proposedAnswer?: string;
  evidenceClaimIds: string[];
  riskLevel: RiskLevel;
  impactDescription: string;
  payloadHash: string;
  payloadVersion: number;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  requestId: string;
  decision: ApprovalDecision;
  editedAnswer?: string;
  payloadHash: string;
  payloadVersion: number;
  decidedAt: string;
  userId: string;
}

export interface CreateApprovalRequestParams {
  tenantId: string;
  userId: string;
  jobId: string;
  fieldKey: string;
  question: string;
  proposedAnswer?: string;
  evidenceClaimIds?: string[];
  riskLevel: RiskLevel;
  impactDescription?: string;
  payloadVersion?: number;
}

const SENSITIVE_KEYWORDS = [
  "disability",
  "handicap",
  "health",
  "medical",
  "race",
  "ethnicity",
  "hispanic",
  "latino",
  "gender",
  "gender_identity",
  "sexual_orientation",
  "sexuality",
  "lgbt",
  "veteran",
  "military_service",
  "religion",
  "creed",
  "demographic",
] as const;

const UNSUPPORTED_KEYWORDS = [
  "captcha",
  "recaptcha",
  "turnstile",
  "mfa",
  "2fa",
  "one_time_code",
  "authenticator",
  "ssn",
  "social_security",
  "national_id",
  "biometric",
] as const;

const HIGH_RISK_KEYWORDS = [
  "salary",
  "compensation",
  "expected_pay",
  "current_pay",
  "desired_salary",
  "hourly_rate",
  "notice_period",
  "earliest_start",
  "start_date",
  "criminal",
  "felony",
  "conviction",
  "nda",
  "non_compete",
  "equity",
] as const;

const MEDIUM_RISK_KEYWORDS = [
  "cover_letter",
  "why_us",
  "why_company",
  "essay",
  "additional_info",
  "comments",
  "motivation",
] as const;

/**
 * Strict policy precedence hierarchy (FR-07):
 * Legal/Safety > Platform > NextJob > Organization > User > Context
 */
export const AUTHORITY_ORDER: readonly PolicyAuthority[] = [
  "legal_safety",
  "platform",
  "nextjob",
  "organization",
  "user",
  "context",
] as const;

const RISK_SEVERITY: Record<RiskLevel, number> = {
  unsupported: 4,
  sensitive: 3,
  high: 2,
  medium: 1,
  low: 0,
};

export const getAuthorityPriority = (authority: PolicyAuthority): number => {
  const index = AUTHORITY_ORDER.indexOf(authority);
  return index === -1 ? 999 : index;
};

/**
 * Classifies an application form field into its baseline risk level
 * following FR-03, FR-07, and compliance standards.
 */
export const classifyField = (field: FieldMetadata): FieldClassification => {
  const normalizedKey = (field.key || "").toLowerCase();
  const normalizedLabel = (field.label || "").toLowerCase();
  const normalizedName = (field.name || "").toLowerCase();
  const normalizedCategory = (field.category || "").toLowerCase();
  const normalizedQuestion = (field.contextQuestion || "").toLowerCase();

  const combinedText = `${normalizedKey} ${normalizedLabel} ${normalizedName} ${normalizedCategory} ${normalizedQuestion}`;

  for (const kw of SENSITIVE_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: "sensitive",
        action: "user_only_input",
        reason: `Demographics and protected personal status (${kw}) requires explicit user-only interactive input (FR-03).`,
        authority: "legal_safety",
        requiresUserApproval: true,
        canAutoFill: false,
      };
    }
  }

  for (const kw of UNSUPPORTED_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: "unsupported",
        action: "block",
        reason: `Prohibited automation field (${kw}) blocked by platform policy.`,
        authority: "platform",
        requiresUserApproval: true,
        canAutoFill: false,
      };
    }
  }

  for (const kw of HIGH_RISK_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: "high",
        action: "suggest_and_review",
        reason: `High impact field (${kw}) requires explicit user confirmation.`,
        authority: "nextjob",
        requiresUserApproval: true,
        canAutoFill: false,
      };
    }
  }

  for (const kw of MEDIUM_RISK_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: "medium",
        action: "auto_fill",
        reason: "Evidence-backed tailored statement.",
        authority: "nextjob",
        requiresUserApproval: false,
        canAutoFill: true,
      };
    }
  }

  return {
    key: field.key,
    riskLevel: "low",
    action: "auto_fill",
    reason: "Standard verified profile factual claim.",
    authority: "nextjob",
    requiresUserApproval: false,
    canAutoFill: true,
  };
};

/**
 * Resolves multiple policy evaluations for a field by enforcing strict precedence hierarchy.
 * Lower-priority authorities cannot relax or override higher-priority restrictions.
 */
export const resolvePolicyPrecedence = (
  key: string,
  evaluations: Array<{
    authority: PolicyAuthority;
    riskLevel: RiskLevel;
    action: PolicyAction;
    reason: string;
  }>,
): {
  effective: FieldClassification;
  history: PolicyRuleEvaluation[];
} => {
  const firstEval = evaluations[0];
  if (!firstEval) {
    return {
      effective: {
        key,
        riskLevel: "low",
        action: "auto_fill",
        reason: "Default fallback (no explicit rules matched)",
        authority: "nextjob",
        requiresUserApproval: false,
        canAutoFill: true,
      },
      history: [],
    };
  }

  const sorted = [...evaluations].sort(
    (a, b) =>
      getAuthorityPriority(a.authority) - getAuthorityPriority(b.authority),
  );

  let currentEval = sorted[0] ?? firstEval;

  for (let i = 1; i < sorted.length; i++) {
    const candidate = sorted[i];
    if (!candidate) continue;

    if (
      (currentEval.authority === "legal_safety" ||
        currentEval.authority === "platform") &&
      (currentEval.riskLevel === "sensitive" ||
        currentEval.riskLevel === "unsupported")
    ) {
      continue;
    }

    const currentSev = RISK_SEVERITY[currentEval.riskLevel];
    const candidateSev = RISK_SEVERITY[candidate.riskLevel];

    if (candidateSev < currentSev) {
      continue;
    }

    if (candidateSev > currentSev) {
      currentEval = candidate;
    }
  }

  const effectiveRisk = currentEval.riskLevel;
  const isSensitive = effectiveRisk === "sensitive";
  const isUnsupported = effectiveRisk === "unsupported";
  const action: PolicyAction = isSensitive
    ? "user_only_input"
    : isUnsupported
      ? "block"
      : currentEval.action;

  const requiresUserApproval =
    isSensitive || effectiveRisk === "high" || action === "suggest_and_review";
  const canAutoFill = !isSensitive && !isUnsupported && action === "auto_fill";

  const history: PolicyRuleEvaluation[] = sorted.map((e) => ({
    authority: e.authority,
    riskLevel: e.riskLevel,
    action: e.action,
    reason: e.reason,
    effective:
      e.authority === currentEval.authority &&
      e.riskLevel === currentEval.riskLevel,
  }));

  return {
    effective: {
      key,
      riskLevel: effectiveRisk,
      action,
      reason: currentEval.reason,
      authority: currentEval.authority,
      requiresUserApproval,
      canAutoFill,
    },
    history,
  };
};

export interface PolicyEvaluator {
  registerOverride: (override: CustomPolicyOverride) => void;
  evaluateField: (field: FieldMetadata) => PolicyEvaluationResult;
  isAutoFillAllowed: (field: FieldMetadata) => boolean;
  evaluateBatch: (fields: FieldMetadata[]) => PolicyEvaluationResult[];
}

/**
 * Functional Risk and Policy Evaluator (replaces class PolicyEngine per TurboStarter rules).
 */
export const createPolicyEvaluator = (
  initialOverrides: CustomPolicyOverride[] = [],
): PolicyEvaluator => {
  const customOverrides: CustomPolicyOverride[] = [...initialOverrides];

  const registerOverride = (override: CustomPolicyOverride): void => {
    customOverrides.push(override);
  };

  const evaluateField = (field: FieldMetadata): PolicyEvaluationResult => {
    const baseline = classifyField(field);
    const evaluations: Array<{
      authority: PolicyAuthority;
      riskLevel: RiskLevel;
      action: PolicyAction;
      reason: string;
    }> = [
      {
        authority: baseline.authority,
        riskLevel: baseline.riskLevel,
        action: baseline.action,
        reason: baseline.reason,
      },
    ];

    for (const rule of customOverrides) {
      if (rule.matches(field)) {
        evaluations.push({
          authority: rule.authority,
          riskLevel: rule.riskLevel,
          action: rule.action,
          reason: rule.reason,
        });
      }
    }

    const { effective, history } = resolvePolicyPrecedence(
      field.key,
      evaluations,
    );

    return {
      field,
      effectiveClassification: effective,
      rulesEvaluated: history,
    };
  };

  const isAutoFillAllowed = (field: FieldMetadata): boolean =>
    evaluateField(field).effectiveClassification.canAutoFill;

  const evaluateBatch = (fields: FieldMetadata[]): PolicyEvaluationResult[] =>
    fields.map((f) => evaluateField(f));

  return {
    registerOverride,
    evaluateField,
    isAutoFillAllowed,
    evaluateBatch,
  };
};

export const defaultPolicyEvaluator = createPolicyEvaluator();

export interface ApprovalManager {
  computePayloadHash: (question: string, proposedAnswer?: string) => string;
  createRequest: (params: CreateApprovalRequestParams) => ApprovalRequest;
  getSavedPreference: (
    userId: string,
    question: string,
  ) => { decision: "approve_always" | "block"; answer?: string } | undefined;
  resolveRequest: (
    request: ApprovalRequest,
    decision: ApprovalDecision,
    options: { userId: string; editedAnswer?: string },
  ) => ApprovalRecord;
  clearPreferences: () => void;
}

export const computeApprovalPayloadHash = (
  question: string,
  proposedAnswer?: string,
): string => {
  const raw = `${question.trim().toLowerCase()}:${(proposedAnswer || "").trim()}`;
  return computeSha256(raw);
};

/**
 * Functional Approval Manager (replaces class ApprovalService per TurboStarter rules).
 */
export const createApprovalManager = (): ApprovalManager => {
  const savedPreferences = new Map<
    string,
    { decision: "approve_always" | "block"; answer?: string }
  >();

  const createRequest = (
    params: CreateApprovalRequestParams,
  ): ApprovalRequest => {
    const payloadHash = computeApprovalPayloadHash(
      params.question,
      params.proposedAnswer,
    );

    const impact =
      params.impactDescription ||
      (params.riskLevel === "sensitive"
        ? "Sensitive personal demographics submitted directly to external employer ATS"
        : params.riskLevel === "high"
          ? "Binding application commitment (compensation or availability)"
          : "Profile tailoring statement");

    return {
      id: createId("apr"),
      tenantId: params.tenantId,
      userId: params.userId,
      jobId: params.jobId,
      fieldKey: params.fieldKey,
      question: params.question,
      proposedAnswer: params.proposedAnswer,
      evidenceClaimIds: params.evidenceClaimIds ?? [],
      riskLevel: params.riskLevel,
      impactDescription: impact,
      payloadHash,
      payloadVersion: params.payloadVersion ?? 1,
      createdAt: nowIso(),
    };
  };

  const getSavedPreference = (userId: string, question: string) => {
    const key = `${userId}:${question.trim().toLowerCase()}`;
    return savedPreferences.get(key);
  };

  const resolveRequest = (
    request: ApprovalRequest,
    decision: ApprovalDecision,
    options: { userId: string; editedAnswer?: string },
  ): ApprovalRecord => {
    if (decision === "edit" && !options.editedAnswer?.trim()) {
      throw new Error('Edited answer must be provided when decision is "edit"');
    }

    if (decision === "approve_always") {
      const key = `${options.userId}:${request.question.trim().toLowerCase()}`;
      savedPreferences.set(key, {
        decision: "approve_always",
        answer: request.proposedAnswer,
      });
    } else if (decision === "block") {
      const key = `${options.userId}:${request.question.trim().toLowerCase()}`;
      savedPreferences.set(key, {
        decision: "block",
      });
    }

    return {
      id: createId("aprec"),
      requestId: request.id,
      decision,
      editedAnswer:
        decision === "edit" ? options.editedAnswer?.trim() : undefined,
      payloadHash: request.payloadHash,
      payloadVersion: request.payloadVersion,
      decidedAt: nowIso(),
      userId: options.userId,
    };
  };

  const clearPreferences = (): void => {
    savedPreferences.clear();
  };

  return {
    computePayloadHash: computeApprovalPayloadHash,
    createRequest,
    getSavedPreference,
    resolveRequest,
    clearPreferences,
  };
};

export const defaultApprovalManager = createApprovalManager();
