export type AtsPlatform = 'greenhouse' | 'lever' | 'workday' | 'generic';

export type StandardFieldKey =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'resume'
  | 'workAuthorization'
  | 'sponsorship';

export interface CandidateProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  workAuthorization: 'yes' | 'no';
  sponsorship: 'yes' | 'no';
  customAnswers?: Record<string, string>;
}

export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  key: StandardFieldKey | 'custom';
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
