import { z } from 'zod';
import type { ValidationResult } from '../types.js';
import { ValidationError } from '../types.js';

// ============================================================================
// Schema Validation Functions
// ============================================================================

/**
 * Validates data against a Zod schema
 */
export function validateSchema<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError 
        ? error 
        : new z.ZodError([{ code: 'custom', path: [], message: 'Unknown validation error' }]),
    };
  }
}

/**
 * Validates data and throws ValidationError if invalid
 */
export function validateSchemaOrThrow<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context?: string
): T {
  const result = validateSchema(data, schema);
  
  if (!result.success) {
    const message = context 
      ? `Validation failed for ${context}: ${result.error.message}`
      : `Validation failed: ${result.error.message}`;
    throw new ValidationError(message, result.error);
  }
  
  return result.data!;
}

/**
 * Creates a structured output schema with metadata
 */
export function createStructuredSchema<T extends z.ZodRawShape>(
  name: string,
  description: string,
  shape: T
): z.ZodObject<T> {
  const schema = z.object(shape);
  
  // Attach metadata for documentation
  (schema as any)._def.name = name;
  (schema as any)._def.description = description;
  
  return schema;
}

// ============================================================================
// Common Schemas
// ============================================================================

/**
 * Schema for career claim extraction
 */
export const CareerClaimSchema = z.object({
  type: z.enum(['experience', 'education', 'skill', 'certification', 'project', 'achievement']),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type CareerClaim = z.infer<typeof CareerClaimSchema>;

/**
 * Schema for job eligibility assessment
 */
export const EligibilityAssessmentSchema = z.object({
  eligible: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  missingRequirements: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export type EligibilityAssessment = z.infer<typeof EligibilityAssessmentSchema>;

/**
 * Schema for job match scoring
 */
export const JobMatchSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
});

export type JobMatch = z.infer<typeof JobMatchSchema>;

/**
 * Schema for resume tailoring
 */
export const TailoredResumeSchema = z.object({
  summary: z.string(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    description: z.string(),
    achievements: z.array(z.string()),
  })),
  skills: z.array(z.string()),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string().optional(),
  })).optional(),
  certifications: z.array(z.string()).optional(),
});

export type TailoredResume = z.infer<typeof TailoredResumeSchema>;

/**
 * Schema for cover letter generation
 */
export const CoverLetterSchema = z.object({
  greeting: z.string(),
  introduction: z.string(),
  body: z.array(z.string()),
  conclusion: z.string(),
  signature: z.string(),
});

export type CoverLetter = z.infer<typeof CoverLetterSchema>;

/**
 * Schema for application answer
 */
export const ApplicationAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  evidence: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type ApplicationAnswer = z.infer<typeof ApplicationAnswerSchema>;

/**
 * Schema for interview preparation
 */
export const InterviewPrepSchema = z.object({
  likelyQuestions: z.array(z.object({
    question: z.string(),
    category: z.enum(['behavioral', 'technical', 'situational', 'general']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    suggestedAnswer: z.string().optional(),
  })),
  keyPoints: z.array(z.string()),
  questionsToAsk: z.array(z.string()),
});

export type InterviewPrep = z.infer<typeof InterviewPrepSchema>;

// ============================================================================
// Schema Registry
// ============================================================================

export const SchemaRegistry = {
  CareerClaim: CareerClaimSchema,
  EligibilityAssessment: EligibilityAssessmentSchema,
  JobMatch: JobMatchSchema,
  TailoredResume: TailoredResumeSchema,
  CoverLetter: CoverLetterSchema,
  ApplicationAnswer: ApplicationAnswerSchema,
  InterviewPrep: InterviewPrepSchema,
} as const;

export type SchemaName = keyof typeof SchemaRegistry;

/**
 * Gets a schema by name
 */
export function getSchema(name: SchemaName): z.ZodSchema<any> {
  return SchemaRegistry[name];
}
