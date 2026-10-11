import { z } from 'zod';

// ============================================================================
// Preference Types
// ============================================================================

export type WorkMode = 'remote' | 'hybrid' | 'on-site' | 'any';
export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

// ============================================================================
// Preferences Schema
// ============================================================================

export const PreferencesSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Target roles
  targetRoles: z.array(z.string().min(1)).min(1, 'At least one target role required'),
  targetRoleFamilies: z.array(z.string()).optional(),
  
  // Seniority
  seniorityLevels: z.array(z.enum(['entry', 'mid', 'senior', 'lead', 'executive'])).optional(),
  yearsOfExperience: z.number().min(0).optional(),
  
  // Industries
  targetIndustries: z.array(z.string()).optional(),
  excludedIndustries: z.array(z.string()).optional(),
  
  // Locations
  targetLocations: z.array(z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1),
    remote: z.boolean().optional(),
  })).optional(),
  
  // Work mode
  workMode: z.enum(['remote', 'hybrid', 'on-site', 'any']).default('any'),
  workModePreference: z.string().optional(), // e.g., "3 days in office"
  
  // Salary expectations
  salaryExpectations: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
    currency: z.string().default('USD'),
    period: z.enum(['hourly', 'daily', 'monthly', 'yearly']).default('yearly'),
    flexible: z.boolean().default(false),
  }).optional(),
  
  // Company preferences
  preferredCompanySizes: z.array(z.enum(['startup', 'small', 'medium', 'large', 'enterprise'])).optional(),
  preferredCompanyStages: z.array(z.enum(['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'public'])).optional(),
  targetCompanies: z.array(z.string()).optional(),
  excludedCompanies: z.array(z.string()).optional(),
  
  // Relocation
  willingToRelocate: z.boolean().default(false),
  relocationLocations: z.array(z.string()).optional(),
  relocationAssistance: z.boolean().optional(),
  
  // Notice period
  noticePeriod: z.object({
    weeks: z.number().min(0).optional(),
    months: z.number().min(0).optional(),
    immediate: z.boolean().default(false),
    negotiable: z.boolean().default(false),
  }).optional(),
  
  // Job search preferences
  jobSearchIntensity: z.enum(['casual', 'active', 'urgent']).default('active'),
  applicationFrequency: z.number().min(0).optional(), // applications per week
  
  // Additional preferences
  keywords: z.array(z.string()).optional(),
  excludedKeywords: z.array(z.string()).optional(),
  mustHaveSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  
  // Metadata
  version: z.number().int().positive().default(1),
  previousVersionId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
  
  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreatePreferencesRequest {
  userId: string;
  tenantId: string;
  targetRoles: string[];
  targetRoleFamilies?: string[];
  seniorityLevels?: SeniorityLevel[];
  yearsOfExperience?: number;
  targetIndustries?: string[];
  excludedIndustries?: string[];
  targetLocations?: Array<{
    city?: string;
    state?: string;
    country: string;
    remote?: boolean;
  }>;
  workMode?: WorkMode;
  workModePreference?: string;
  salaryExpectations?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'hourly' | 'daily' | 'monthly' | 'yearly';
    flexible?: boolean;
  };
  preferredCompanySizes?: Array<'startup' | 'small' | 'medium' | 'large' | 'enterprise'>;
  preferredCompanyStages?: Array<'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'public'>;
  targetCompanies?: string[];
  excludedCompanies?: string[];
  willingToRelocate?: boolean;
  relocationLocations?: string[];
  relocationAssistance?: boolean;
  noticePeriod?: {
    weeks?: number;
    months?: number;
    immediate?: boolean;
    negotiable?: boolean;
  };
  jobSearchIntensity?: 'casual' | 'active' | 'urgent';
  applicationFrequency?: number;
  keywords?: string[];
  excludedKeywords?: string[];
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
}

export interface UpdatePreferencesRequest {
  targetRoles?: string[];
  targetRoleFamilies?: string[];
  seniorityLevels?: SeniorityLevel[];
  yearsOfExperience?: number;
  targetIndustries?: string[];
  excludedIndustries?: string[];
  targetLocations?: Array<{
    city?: string;
    state?: string;
    country: string;
    remote?: boolean;
  }>;
  workMode?: WorkMode;
  workModePreference?: string;
  salaryExpectations?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'hourly' | 'daily' | 'monthly' | 'yearly';
    flexible?: boolean;
  };
  preferredCompanySizes?: Array<'startup' | 'small' | 'medium' | 'large' | 'enterprise'>;
  preferredCompanyStages?: Array<'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'public'>;
  targetCompanies?: string[];
  excludedCompanies?: string[];
  willingToRelocate?: boolean;
  relocationLocations?: string[];
  relocationAssistance?: boolean;
  noticePeriod?: {
    weeks?: number;
    months?: number;
    immediate?: boolean;
    negotiable?: boolean;
  };
  jobSearchIntensity?: 'casual' | 'active' | 'urgent';
  applicationFrequency?: number;
  keywords?: string[];
  excludedKeywords?: string[];
  mustHaveSkills?: string[];
  niceToHaveSkills?: string[];
}

export interface PreferencesResponse {
  preferences: Preferences;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class PreferencesError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'PreferencesError';
  }
}

export class PreferencesNotFoundError extends PreferencesError {
  constructor(userId: string) {
    super(`Preferences not found for user: ${userId}`, 'PREFERENCES_NOT_FOUND', 404);
    this.name = 'PreferencesNotFoundError';
  }
}

export class InvalidPreferencesError extends PreferencesError {
  constructor(validationErrors: any) {
    super(
      'Invalid preferences data',
      'INVALID_PREFERENCES',
      400,
      { validationErrors }
    );
    this.name = 'InvalidPreferencesError';
  }
}

export class VersionConflictError extends PreferencesError {
  constructor(currentVersion: number, requestedVersion: number) {
    super(
      `Version conflict: current=${currentVersion}, requested=${requestedVersion}`,
      'VERSION_CONFLICT',
      409,
      { currentVersion, requestedVersion }
    );
    this.name = 'VersionConflictError';
  }
}
