export type AtsPlatform = "greenhouse" | "lever" | "workday" | "generic";

export type StandardFieldKey =
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "phone"
  | "linkedin"
  | "github"
  | "portfolio"
  | "resume"
  | "workAuthorization"
  | "sponsorship";

export interface CandidateProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  workAuthorization?: "yes" | "no";
  sponsorship?: "yes" | "no";
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

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  key: StandardFieldKey | "custom";
  name: string;
  type: string;
  required: boolean;
  confidence: number;
}

export interface FillResult {
  fieldKey: string;
  name: string;
  success: boolean;
  value: string;
  error?: string;
}

export interface SyntheticTestReport {
  platform: AtsPlatform;
  detectedCount: number;
  filledCount: number;
  results: FillResult[];
  logs: string[];
}
