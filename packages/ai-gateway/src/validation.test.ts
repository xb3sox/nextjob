import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateSchema,
  validateSchemaOrThrow,
  CareerClaimSchema,
  EligibilityAssessmentSchema,
  JobMatchSchema,
  TailoredResumeSchema,
  CoverLetterSchema,
  ValidationError,
} from './validation.js';

// ============================================================================
// Schema Validation Tests
// ============================================================================

describe('Schema Validation', () => {
  describe('validateSchema', () => {
    it('should validate correct data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = validateSchema({ name: 'John', age: 30 }, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('should return error for invalid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = validateSchema({ name: 'John', age: 'thirty' }, schema);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing required fields', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = validateSchema({ name: 'John' }, schema);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateSchemaOrThrow', () => {
    it('should return validated data for valid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = validateSchemaOrThrow({ name: 'John', age: 30 }, schema);

      expect(data).toEqual({ name: 'John', age: 30 });
    });

    it('should throw ValidationError for invalid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      expect(() => {
        validateSchemaOrThrow({ name: 'John', age: 'thirty' }, schema);
      }).toThrow(ValidationError);
    });

    it('should include context in error message', () => {
      const schema = z.object({
        name: z.string(),
      });

      try {
        validateSchemaOrThrow({ name: 123 }, schema, 'test context');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('test context');
      }
    });
  });
});

// ============================================================================
// Career Claim Schema Tests
// ============================================================================

describe('CareerClaimSchema', () => {
  it('should validate valid career claim', () => {
    const claim = {
      type: 'experience',
      title: 'Software Engineer',
      description: 'Developed web applications',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      skills: ['TypeScript', 'React', 'Node.js'],
      confidence: 0.95,
    };

    const result = CareerClaimSchema.safeParse(claim);
    expect(result.success).toBe(true);
  });

  it('should validate minimal career claim', () => {
    const claim = {
      type: 'skill',
      title: 'TypeScript',
    };

    const result = CareerClaimSchema.safeParse(claim);
    expect(result.success).toBe(true);
  });

  it('should reject invalid claim type', () => {
    const claim = {
      type: 'invalid',
      title: 'Test',
    };

    const result = CareerClaimSchema.safeParse(claim);
    expect(result.success).toBe(false);
  });

  it('should reject missing title', () => {
    const claim = {
      type: 'experience',
    };

    const result = CareerClaimSchema.safeParse(claim);
    expect(result.success).toBe(false);
  });

  it('should reject confidence out of range', () => {
    const claim = {
      type: 'experience',
      title: 'Test',
      confidence: 1.5,
    };

    const result = CareerClaimSchema.safeParse(claim);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Eligibility Assessment Schema Tests
// ============================================================================

describe('EligibilityAssessmentSchema', () => {
  it('should validate valid assessment', () => {
    const assessment = {
      eligible: true,
      confidence: 0.9,
      reasons: ['Meets all requirements'],
      missingRequirements: [],
      warnings: [],
    };

    const result = EligibilityAssessmentSchema.safeParse(assessment);
    expect(result.success).toBe(true);
  });

  it('should validate ineligible assessment', () => {
    const assessment = {
      eligible: false,
      confidence: 0.95,
      reasons: ['Missing work authorization'],
      missingRequirements: ['US work authorization'],
    };

    const result = EligibilityAssessmentSchema.safeParse(assessment);
    expect(result.success).toBe(true);
  });

  it('should reject confidence out of range', () => {
    const assessment = {
      eligible: true,
      confidence: 1.5,
      reasons: ['Test'],
    };

    const result = EligibilityAssessmentSchema.safeParse(assessment);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Job Match Schema Tests
// ============================================================================

describe('JobMatchSchema', () => {
  it('should validate valid job match', () => {
    const match = {
      score: 85,
      strengths: ['Strong technical skills', 'Relevant experience'],
      weaknesses: ['Limited management experience'],
      recommendations: ['Highlight leadership projects'],
      confidence: 0.88,
    };

    const result = JobMatchSchema.safeParse(match);
    expect(result.success).toBe(true);
  });

  it('should reject score out of range', () => {
    const match = {
      score: 150,
      strengths: ['Test'],
      weaknesses: [],
      confidence: 0.9,
    };

    const result = JobMatchSchema.safeParse(match);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Tailored Resume Schema Tests
// ============================================================================

describe('TailoredResumeSchema', () => {
  it('should validate valid resume', () => {
    const resume = {
      summary: 'Experienced software engineer',
      experience: [
        {
          title: 'Senior Engineer',
          company: 'Tech Corp',
          description: 'Led development team',
          achievements: ['Improved performance by 50%'],
        },
      ],
      skills: ['TypeScript', 'React', 'Node.js'],
      education: [
        {
          degree: 'B.S. Computer Science',
          institution: 'University',
          year: '2018',
        },
      ],
      certifications: ['AWS Certified'],
    };

    const result = TailoredResumeSchema.safeParse(resume);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const resume = {
      summary: 'Test',
      // Missing experience and skills
    };

    const result = TailoredResumeSchema.safeParse(resume);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Cover Letter Schema Tests
// ============================================================================

describe('CoverLetterSchema', () => {
  it('should validate valid cover letter', () => {
    const letter = {
      greeting: 'Dear Hiring Manager',
      introduction: 'I am writing to apply for...',
      body: ['First paragraph', 'Second paragraph'],
      conclusion: 'Thank you for considering my application',
      signature: 'John Doe',
    };

    const result = CoverLetterSchema.safeParse(letter);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const letter = {
      greeting: 'Dear',
      // Missing other fields
    };

    const result = CoverLetterSchema.safeParse(letter);
    expect(result.success).toBe(false);
  });
});
