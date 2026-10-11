import { describe, it, expect, beforeEach } from 'vitest';
import { TailoringEngine } from './tailoring-engine.js';
import {
  CareerGraph,
  JobRequirements,
  TailoringRequest,
  EvidenceConstraintViolationError,
  InsufficientEvidenceError,
  InvalidTailoringRequestError,
} from './types.js';

describe('TailoringEngine', () => {
  let engine: TailoringEngine;

  beforeEach(() => {
    engine = new TailoringEngine();
  });

  describe('tailor - Resume', () => {
    it('should tailor resume with complete evidence', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Senior Software Engineer',
            content: {
              company: 'Tech Corp',
              startDate: '2020-01-01',
              endDate: '2023-12-31',
              achievements: ['Led team of 5 engineers'],
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
          {
            id: 'claim-2',
            type: 'skill',
            title: 'JavaScript',
            content: { level: 'expert', yearsOfExperience: 5 },
            evidenceId: 'evidence-2',
            verificationStatus: 'verified',
            confidence: 0.9,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Software Engineer',
        requiredSkills: ['JavaScript'],
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.type).toBe('resume');
      expect(result.content).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(result.sections!.length).toBeGreaterThan(0);
      expect(result.evidenceTraceability.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.unsupportedClaims).toEqual([]);
    });

    it('should preserve exact company names', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'Acme Corporation International',
              startDate: '2020-01-01',
              endDate: '2023-01-01',
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.content).toContain('Acme Corporation International');
    });

    it('should preserve exact dates', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'TechCo',
              startDate: '2020-03-15',
              endDate: '2023-07-20',
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.content).toContain('2020-03-15');
      expect(result.content).toContain('2023-07-20');
    });

    it('should reject unverified claims', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'Unknown Corp',
            },
            evidenceId: null,
            verificationStatus: 'unverified',
            confidence: 0.3,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      await expect(engine.tailor(request)).rejects.toThrow(InsufficientEvidenceError);
    });

    it('should reject low confidence claims', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'TechCo',
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.5, // Below threshold
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      await expect(engine.tailor(request)).rejects.toThrow(InsufficientEvidenceError);
    });
  });

  describe('tailor - Cover Letter', () => {
    it('should tailor cover letter with experience', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Software Engineer',
            content: {
              company: 'Tech Corp',
              achievements: ['Built scalable systems'],
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Software Engineer',
        company: 'Innovate Inc',
      };

      const request: TailoringRequest = {
        type: 'cover_letter',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.type).toBe('cover_letter');
      expect(result.content).toContain('Innovate Inc');
      expect(result.content).toContain('Tech Corp');
      expect(result.sections).toBeDefined();
      expect(result.evidenceTraceability.length).toBeGreaterThan(0);
    });

    it('should not fabricate company names', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'Actual Corp',
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
        company: 'Target Company',
      };

      const request: TailoringRequest = {
        type: 'cover_letter',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.content).toContain('Actual Corp');
      expect(result.content).not.toContain('Target Company');
    });
  });

  describe('tailor - Application Answer', () => {
    it('should tailor application answer with evidence', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Engineer',
            content: {
              company: 'TechCo',
              years: 5,
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Engineer',
      };

      const request: TailoringRequest = {
        type: 'application_answer',
        careerGraph,
        jobRequirements,
        question: 'Why are you qualified?',
      };

      const result = await engine.tailor(request);

      expect(result.type).toBe('application_answer');
      expect(result.content).toContain('TechCo');
      expect(result.content).toContain('5');
      expect(result.evidenceTraceability.length).toBeGreaterThan(0);
    });

    it('should throw error if question is missing', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Engineer',
            content: { company: 'TechCo' },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Engineer',
      };

      const request: TailoringRequest = {
        type: 'application_answer',
        careerGraph,
        jobRequirements,
        // question is missing
      };

      await expect(engine.tailor(request)).rejects.toThrow(InvalidTailoringRequestError);
    });
  });

  describe('tailor - Professional Summary', () => {
    it('should tailor professional summary with experience and skills', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'TechCo',
              years: 7,
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
          {
            id: 'claim-2',
            type: 'skill',
            title: 'JavaScript',
            content: { level: 'expert' },
            evidenceId: 'evidence-2',
            verificationStatus: 'verified',
            confidence: 0.9,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'professional_summary',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.type).toBe('professional_summary');
      expect(result.content).toContain('7');
      expect(result.content).toContain('JavaScript');
      expect(result.evidenceTraceability.length).toBeGreaterThan(0);
    });

    it('should respect max length option', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: { company: 'TechCo', years: 7 },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
          {
            id: 'claim-2',
            type: 'skill',
            title: 'JavaScript',
            content: { level: 'expert' },
            evidenceId: 'evidence-2',
            verificationStatus: 'verified',
            confidence: 0.9,
          },
          {
            id: 'claim-3',
            type: 'skill',
            title: 'Python',
            content: { level: 'advanced' },
            evidenceId: 'evidence-3',
            verificationStatus: 'verified',
            confidence: 0.9,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'professional_summary',
        careerGraph,
        jobRequirements,
        options: { maxLength: 50 },
      };

      const result = await engine.tailor(request);

      expect(result.content.length).toBeLessThanOrEqual(50);
    });
  });

  describe('tailor - Skills Section', () => {
    it('should tailor skills section with verified skills', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'skill',
            title: 'JavaScript',
            content: { level: 'expert', yearsOfExperience: 5 },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
          {
            id: 'claim-2',
            type: 'skill',
            title: 'React',
            content: { level: 'advanced', yearsOfExperience: 3 },
            evidenceId: 'evidence-2',
            verificationStatus: 'verified',
            confidence: 0.9,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Frontend Developer',
        requiredSkills: ['JavaScript', 'React'],
      };

      const request: TailoringRequest = {
        type: 'skills_section',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.type).toBe('skills_section');
      expect(result.skills).toBeDefined();
      expect(result.skills!.length).toBe(2);
      expect(result.skills![0].name).toBe('JavaScript');
      expect(result.skills![0].priority).toBe('high');
      expect(result.skills![1].name).toBe('React');
      expect(result.skills![1].priority).toBe('high');
    });

    it('should prioritize job-required skills', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'skill',
            title: 'Python',
            content: { level: 'expert' },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
          {
            id: 'claim-2',
            type: 'skill',
            title: 'JavaScript',
            content: { level: 'intermediate' },
            evidenceId: 'evidence-2',
            verificationStatus: 'verified',
            confidence: 0.8,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'JavaScript Developer',
        requiredSkills: ['JavaScript'],
      };

      const request: TailoringRequest = {
        type: 'skills_section',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.skills![0].name).toBe('JavaScript');
      expect(result.skills![0].priority).toBe('high');
    });

    it('should not upgrade skill levels', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'skill',
            title: 'JavaScript',
            content: { level: 'intermediate' },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
        requiredSkills: ['JavaScript'],
      };

      const request: TailoringRequest = {
        type: 'skills_section',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.skills![0].level).toBe('intermediate');
      expect(result.skills![0].level).not.toBe('expert');
    });
  });

  describe('Evidence Constraints', () => {
    it('should throw error for fabricated company names', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: {
              company: 'Actual Corp',
            },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      // Should contain actual company name
      expect(result.content).toContain('Actual Corp');
      // Should not contain any other company name
      expect(result.content).not.toMatch(/Company|Corp|Inc/i);
    });

    it('should throw error for unsupported claims', async () => {
      const careerGraph: CareerGraph = {
        claims: [
          {
            id: 'claim-1',
            type: 'experience',
            title: 'Developer',
            content: { company: 'TechCo' },
            evidenceId: 'evidence-1',
            verificationStatus: 'verified',
            confidence: 0.95,
          },
          {
            id: 'claim-2',
            type: 'achievement',
            title: 'Award',
            content: { description: 'Some award' },
            evidenceId: null,
            verificationStatus: 'unverified',
            confidence: 0.2,
          },
        ],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      const result = await engine.tailor(request);

      expect(result.unsupportedClaims).toContain('claim-2');
    });
  });

  describe('Error Handling', () => {
    it('should throw InvalidTailoringRequestError for invalid request', async () => {
      const request = {
        type: 'invalid_type' as any,
        careerGraph: { claims: [] },
        jobRequirements: { title: 'Developer' },
      };

      await expect(engine.tailor(request)).rejects.toThrow(InvalidTailoringRequestError);
    });

    it('should throw InsufficientEvidenceError for empty career graph', async () => {
      const careerGraph: CareerGraph = {
        claims: [],
      };

      const jobRequirements: JobRequirements = {
        title: 'Developer',
      };

      const request: TailoringRequest = {
        type: 'resume',
        careerGraph,
        jobRequirements,
      };

      await expect(engine.tailor(request)).rejects.toThrow(InsufficientEvidenceError);
    });
  });
});
