export type AtsPlatform = 'greenhouse' | 'lever' | 'workday' | 'generic';

export interface CandidateProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  workAuthorization?: 'yes' | 'no';
  sponsorship?: 'yes' | 'no';
  customAnswers?: Record<string, string>;
}

export interface ConnectorDetectionResult {
  isDetected: boolean;
  platform: AtsPlatform;
  confidence: number;
  formElement: HTMLFormElement | null;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
}

export interface ConnectorFillPayload {
  profile: CandidateProfile;
  jobId: string;
  idempotencyKey: string;
  answers?: Record<string, string>;
}

export interface FilledFieldReport {
  key: string;
  name: string;
  value: string;
  success: boolean;
  error?: string;
}

export interface ConnectorFillResult {
  success: boolean;
  detected: boolean;
  platform: AtsPlatform;
  isDuplicate: boolean;
  filledFieldCount: number;
  skippedFieldCount: number;
  fields: FilledFieldReport[];
  idempotencyKey: string;
  submissionHash?: string;
  error?: string;
}

export interface SubmissionRecord {
  jobId: string;
  idempotencyKey: string;
  submissionHash: string;
  submittedAt: string;
  platform: AtsPlatform;
}
