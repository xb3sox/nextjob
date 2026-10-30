export type RiskLevel = 'low' | 'medium' | 'high' | 'sensitive' | 'unsupported';

export type PolicyAuthority =
  | 'legal_safety'
  | 'platform'
  | 'nextjob'
  | 'organization'
  | 'user'
  | 'context';

export type PolicyAction = 'auto_fill' | 'suggest_and_review' | 'user_only_input' | 'block';

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
