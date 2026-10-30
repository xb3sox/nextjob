import type {
  FieldClassification,
  PolicyAction,
  PolicyAuthority,
  PolicyRuleEvaluation,
  RiskLevel,
} from './types';

/**
 * Strict policy precedence hierarchy (FR-07):
 * Legal/Safety > Platform > NextJob > Organization > User > Context
 * Rule: Higher-level policy restrictions cannot be overridden by lower levels.
 */
export const AUTHORITY_ORDER: readonly PolicyAuthority[] = [
  'legal_safety',
  'platform',
  'nextjob',
  'organization',
  'user',
  'context',
] as const;

export function getAuthorityPriority(authority: PolicyAuthority): number {
  const index = AUTHORITY_ORDER.indexOf(authority);
  return index === -1 ? 999 : index;
}

const RISK_SEVERITY: Record<RiskLevel, number> = {
  unsupported: 4,
  sensitive: 3,
  high: 2,
  medium: 1,
  low: 0,
};

/**
 * Resolves multiple policy evaluations for a field by enforcing strict precedence hierarchy.
 * Invariant: Lower-priority authorities cannot relax or override higher-priority restrictions.
 * Invariant (FR-03): Sensitive fields MUST NEVER allow auto-fill.
 */
export function resolvePolicyPrecedence(
  key: string,
  evaluations: Array<{
    authority: PolicyAuthority;
    riskLevel: RiskLevel;
    action: PolicyAction;
    reason: string;
  }>
): {
  effective: FieldClassification;
  history: PolicyRuleEvaluation[];
} {
  if (evaluations.length === 0) {
    return {
      effective: {
        key,
        riskLevel: 'low',
        action: 'auto_fill',
        reason: 'Default fallback (no explicit rules matched)',
        authority: 'nextjob',
        requiresUserApproval: false,
        canAutoFill: true,
      },
      history: [],
    };
  }

  // Sort by priority ascending (0 = highest priority = legal_safety)
  const sorted = [...evaluations].sort(
    (a, b) => getAuthorityPriority(a.authority) - getAuthorityPriority(b.authority)
  );

  let currentEval = sorted[0];

  // Evaluate cascading lower authorities
  for (let i = 1; i < sorted.length; i++) {
    const candidate = sorted[i];

    // Legal / Platform absolute boundaries cannot be modified by any lower authority
    if (
      (currentEval.authority === 'legal_safety' || currentEval.authority === 'platform') &&
      (currentEval.riskLevel === 'sensitive' || currentEval.riskLevel === 'unsupported')
    ) {
      continue;
    }

    const currentSev = RISK_SEVERITY[currentEval.riskLevel];
    const candidateSev = RISK_SEVERITY[candidate.riskLevel];

    // Lower authority attempts to relax higher authority restriction: REJECTED (FR-07)
    if (candidateSev < currentSev) {
      continue;
    }

    // Lower authority imposes stricter restriction: ACCEPTED
    if (candidateSev > currentSev) {
      currentEval = candidate;
    }
  }

  const effectiveRisk = currentEval.riskLevel;
  const isSensitive = effectiveRisk === 'sensitive';
  const isUnsupported = effectiveRisk === 'unsupported';
  const action: PolicyAction = isSensitive
    ? 'user_only_input'
    : isUnsupported
      ? 'block'
      : currentEval.action;

  const requiresUserApproval =
    isSensitive || effectiveRisk === 'high' || action === 'suggest_and_review';
  const canAutoFill = !isSensitive && !isUnsupported && action === 'auto_fill';

  const history: PolicyRuleEvaluation[] = sorted.map((e) => ({
    authority: e.authority,
    riskLevel: e.riskLevel,
    action: e.action,
    reason: e.reason,
    effective: e.authority === currentEval.authority && e.riskLevel === currentEval.riskLevel,
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
}
