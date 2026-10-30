import type { FieldClassification, FieldMetadata } from './types';

const SENSITIVE_KEYWORDS = [
  'disability',
  'handicap',
  'health',
  'medical',
  'race',
  'ethnicity',
  'hispanic',
  'latino',
  'gender',
  'gender_identity',
  'sexual_orientation',
  'sexuality',
  'lgbt',
  'veteran',
  'military_service',
  'religion',
  'creed',
  'demographic',
];

const UNSUPPORTED_KEYWORDS = [
  'captcha',
  'recaptcha',
  'turnstile',
  'mfa',
  '2fa',
  'one_time_code',
  'authenticator',
  'ssn',
  'social_security',
  'national_id',
  'biometric',
];

const HIGH_RISK_KEYWORDS = [
  'salary',
  'compensation',
  'expected_pay',
  'current_pay',
  'desired_salary',
  'hourly_rate',
  'notice_period',
  'earliest_start',
  'start_date',
  'criminal',
  'felony',
  'conviction',
  'nda',
  'non_compete',
  'equity',
];

const MEDIUM_RISK_KEYWORDS = [
  'cover_letter',
  'why_us',
  'why_company',
  'essay',
  'additional_info',
  'comments',
  'motivation',
];

/**
 * Classifies an application form field into its standard baseline risk level
 * following PRD FR-03, FR-07, and compliance standards.
 */
export function classifyField(field: FieldMetadata): FieldClassification {
  const normalizedKey = (field.key || '').toLowerCase();
  const normalizedLabel = (field.label || '').toLowerCase();
  const normalizedName = (field.name || '').toLowerCase();
  const normalizedCategory = (field.category || '').toLowerCase();
  const normalizedQuestion = (field.contextQuestion || '').toLowerCase();

  const combinedText = `${normalizedKey} ${normalizedLabel} ${normalizedName} ${normalizedCategory} ${normalizedQuestion}`;

  // 1. Check Sensitive (FR-03, AC-03)
  for (const kw of SENSITIVE_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: 'sensitive',
        action: 'user_only_input',
        reason: `Demographics and protected personal status (${kw}) requires explicit user-only interactive input (FR-03).`,
        authority: 'legal_safety',
        requiresUserApproval: true,
        canAutoFill: false,
      };
    }
  }

  // 2. Check Unsupported (Platform boundaries)
  for (const kw of UNSUPPORTED_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: 'unsupported',
        action: 'block',
        reason: `Prohibited automation field (${kw}) blocked by platform policy.`,
        authority: 'platform',
        requiresUserApproval: true,
        canAutoFill: false,
      };
    }
  }

  // 3. Check High Risk
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: 'high',
        action: 'suggest_and_review',
        reason: `High impact field (${kw}) requires explicit user confirmation.`,
        authority: 'nextjob',
        requiresUserApproval: true,
        canAutoFill: false,
      };
    }
  }

  // 4. Check Medium Risk
  for (const kw of MEDIUM_RISK_KEYWORDS) {
    if (combinedText.includes(kw)) {
      return {
        key: field.key,
        riskLevel: 'medium',
        action: 'auto_fill',
        reason: 'Evidence-backed tailored statement.',
        authority: 'nextjob',
        requiresUserApproval: false,
        canAutoFill: true,
      };
    }
  }

  // 5. Default Low Risk
  return {
    key: field.key,
    riskLevel: 'low',
    action: 'auto_fill',
    reason: 'Standard verified profile factual claim.',
    authority: 'nextjob',
    requiresUserApproval: false,
    canAutoFill: true,
  };
}
