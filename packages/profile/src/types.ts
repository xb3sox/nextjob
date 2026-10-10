import { z } from 'zod';

// ============================================================================
// Profile Import Types
// ============================================================================

export type FileType = 'pdf' | 'docx';

export interface ImportRequest {
  userId: string;
  tenantId: string;
  file: Buffer;
  fileName: string;
  fileType: FileType;
}

export interface ImportResult {
  success: boolean;
  extractedData?: ExtractedProfileData;
  confidence: number;
  warnings: string[];
  errors: string[];
  processingTime: number;
}

// ============================================================================
// Extracted Profile Data Schema
// ============================================================================

export const ExtractedProfileDataSchema = z.object({
  personalInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url().optional(),
    website: z.string().url().optional(),
  }),
  
  summary: z.string().optional(),
  
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string().optional(),
    achievements: z.array(z.string()).optional(),
  })).optional(),
  
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
    honors: z.array(z.string()).optional(),
  })).optional(),
  
  skills: z.array(z.object({
    name: z.string(),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    yearsOfExperience: z.number().optional(),
  })).optional(),
  
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    date: z.string().optional(),
    expirationDate: z.string().optional(),
    credentialId: z.string().optional(),
  })).optional(),
  
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    url: z.string().url().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  
  achievements: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().optional(),
    issuer: z.string().optional(),
  })).optional(),
  
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']).optional(),
  })).optional(),
});

export type ExtractedProfileData = z.infer<typeof ExtractedProfileDataSchema>;

// ============================================================================
// AI Extraction Types
// ============================================================================

export interface AIExtractionRequest {
  text: string;
  userId: string;
  tenantId: string;
}

export interface AIExtractionResult {
  data: ExtractedProfileData;
  confidence: number;
  rawResponse: string;
  processingTime: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class ProfileImportError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ProfileImportError';
  }
}

export class FileParsingError extends ProfileImportError {
  constructor(message: string, public fileType: FileType, public originalError?: Error) {
    super(message, 'FILE_PARSING_ERROR', 400, { fileType, originalError });
    this.name = 'FileParsingError';
  }
}

export class AIExtractionError extends ProfileImportError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'AI_EXTRACTION_ERROR', 500, { originalError });
    this.name = 'AIExtractionError';
  }
}

export class ValidationError extends ProfileImportError {
  constructor(
    message: string,
    public validationErrors: z.ZodError
  ) {
    super(message, 'VALIDATION_ERROR', 400, { validationErrors });
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Extraction Confidence Levels
// ============================================================================

export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface ConfidenceThresholds {
  high: number;
  medium: number;
  low: number;
}

export const DEFAULT_CONFIDENCE_THRESHOLDS: ConfidenceThresholds = {
  high: 0.8,
  medium: 0.6,
  low: 0.4,
};

// ============================================================================
// File Size Limits
// ============================================================================

export const FILE_SIZE_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  maxTextLength: 100000, // 100,000 characters
  minTextLength: 100, // 100 characters
};

// ============================================================================
// Supported File Types
// ============================================================================

export const SUPPORTED_FILE_TYPES: FileType[] = ['pdf', 'docx'];

export function isValidFileType(mimeType: string): FileType | null {
  const mimeToType: Record<string, FileType> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  
  return mimeToType[mimeType] || null;
}
