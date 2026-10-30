import { classifyField } from './classifier';
import { resolvePolicyPrecedence } from './precedence';
import type {
  FieldMetadata,
  PolicyAction,
  PolicyAuthority,
  PolicyEvaluationResult,
  RiskLevel,
} from './types';

export interface CustomPolicyOverride {
  authority: PolicyAuthority;
  matches: (field: FieldMetadata) => boolean;
  riskLevel: RiskLevel;
  action: PolicyAction;
  reason: string;
}

/**
 * Risk and Policy Engine (T-19, Phase 6)
 * Enforces risk classification (Low/Medium/High/Sensitive/Unsupported),
 * strict policy precedence (Legal > Platform > NextJob > Org > User > Context),
 * and strict user-only protection for sensitive fields (FR-03, FR-07).
 */
export class PolicyEngine {
  private customOverrides: CustomPolicyOverride[] = [];

  constructor(overrides: CustomPolicyOverride[] = []) {
    this.customOverrides = [...overrides];
  }

  /**
   * Registers custom organization, user, or platform rules
   */
  public registerOverride(override: CustomPolicyOverride): void {
    this.customOverrides.push(override);
  }

  /**
   * Evaluates a field through all applicable policy tiers and resolves final precedence.
   */
  public evaluateField(field: FieldMetadata): PolicyEvaluationResult {
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

    // Evaluate matching custom overrides
    for (const rule of this.customOverrides) {
      if (rule.matches(field)) {
        evaluations.push({
          authority: rule.authority,
          riskLevel: rule.riskLevel,
          action: rule.action,
          reason: rule.reason,
        });
      }
    }

    const { effective, history } = resolvePolicyPrecedence(field.key, evaluations);

    return {
      field,
      effectiveClassification: effective,
      rulesEvaluated: history,
    };
  }

  /**
   * Quick check whether a field is eligible for automated submission
   * Sensitive and Unsupported fields ALWAYS return false (FR-03).
   */
  public isAutoFillAllowed(field: FieldMetadata): boolean {
    const evaluation = this.evaluateField(field);
    return evaluation.effectiveClassification.canAutoFill;
  }

  /**
   * Classifies a batch of form fields
   */
  public evaluateBatch(fields: FieldMetadata[]): PolicyEvaluationResult[] {
    return fields.map((f) => this.evaluateField(f));
  }
}

/**
 * Default singleton instance of PolicyEngine with standard baseline rules.
 */
export const defaultPolicyEngine = new PolicyEngine();
