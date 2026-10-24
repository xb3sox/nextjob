// ============================================================================
// Matching Types
// ============================================================================

export type MatchStatus = 'excellent' | 'good' | 'weak' | 'none';

export interface MatchFactor {
  name: string;
  score: number; // 0-100
  weight: number; // 0-1
  explanation: string;
}

export interface JobMatch {
  id: string;
  userId: string;
  tenantId: string;
  jobId: string;
  eligibilityId: string;

  // Overall score
  score: number; // 0-100
  status: MatchStatus;

  // Detailed factors
  factors: MatchFactor[];

  // Strengths and weaknesses
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  // Confidence
  confidence: number; // 0-1

  // Metadata
  matchedAt: string;
  version: number;
}

// ============================================================================
// Matching Request/Response
// ============================================================================

export interface CalculateMatchRequest {
  userId: string;
  tenantId: string;
  jobId: string;
  eligibilityId: string;
  userProfile: {
    skills: Array<{ name: string; level?: string }>;
    experience: Array<{ title: string; years?: number }>;
    education: Array<{ degree: string; field?: string }>;
    location?: { country: string; city?: string };
    preferences?: {
      targetRoles?: string[];
      targetIndustries?: string[];
      salaryExpectations?: { min?: number; max?: number };
    };
  };
  job: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills?: string[];
    experience?: { min?: number; max?: number };
    education?: { minimumDegree?: string; requiredFields?: string[] };
    location?: { country: string; city?: string; remote?: boolean };
    salary?: { min?: number; max?: number };
    roleFamily?: string;
    seniorityLevel?: string;
  };
}

export interface CalculateMatchResponse {
  match: JobMatch;
  eligible: boolean;
  explanation: string;
}

export interface RankJobsRequest {
  userId: string;
  tenantId: string;
  jobIds: string[];
  userProfile: CalculateMatchRequest['userProfile'];
  jobs: Array<{
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills?: string[];
    experience?: { min?: number; max?: number };
    education?: { minimumDegree?: string; requiredFields?: string[] };
    location?: { country: string; city?: string; remote?: boolean };
    salary?: { min?: number; max?: number };
    roleFamily?: string;
    seniorityLevel?: string;
  }>;
}

export interface RankJobsResponse {
  matches: Array<{
    jobId: string;
    score: number;
    status: MatchStatus;
    strengths: string[];
    weaknesses: string[];
  }>;
  total: number;
}

// ============================================================================
// Matching Configuration
// ============================================================================

export interface MatchingConfig {
  weights: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    salary: number;
    roleFit: number;
    seniorityFit: number;
  };
  thresholds: {
    excellent: number;
    good: number;
    weak: number;
  };
}

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  weights: {
    skills: 0.3,
    experience: 0.25,
    education: 0.15,
    location: 0.1,
    salary: 0.1,
    roleFit: 0.05,
    seniorityFit: 0.05,
  },
  thresholds: {
    excellent: 85,
    good: 70,
    weak: 50,
  },
};

// ============================================================================
// Error Types
// ============================================================================

export class MatchingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'MatchingError';
  }
}

export class MatchNotFoundError extends MatchingError {
  constructor(matchId: string) {
    super(`Match not found: ${matchId}`, 'MATCH_NOT_FOUND', 404);
    this.name = 'MatchNotFoundError';
  }
}

export class InvalidMatchDataError extends MatchingError {
  constructor(validationErrors: any) {
    super('Invalid match data', 'INVALID_MATCH_DATA', 400, { validationErrors });
    this.name = 'InvalidMatchDataError';
  }
}
