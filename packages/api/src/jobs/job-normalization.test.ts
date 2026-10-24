import { beforeEach, describe, expect, it } from 'vitest';
import { JobNormalizationService } from './job-normalization.js';

describe('JobNormalizationService', () => {
  let service: JobNormalizationService;

  beforeEach(() => {
    service = new JobNormalizationService();
  });

  describe('normalizeJob', () => {
    it('should normalize work mode from various formats', () => {
      const job = {
        workMode: 'Work From Home' as any,
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.workMode).toBe('remote');
      expect(result.changes).toContainEqual(
        expect.objectContaining({
          field: 'workMode',
          original: 'Work From Home',
          normalized: 'remote',
        })
      );
    });

    it('should infer seniority from title', () => {
      const job = {
        title: 'Senior Software Engineer',
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.seniorityLevel).toBe('senior');
    });

    it('should infer entry level from title', () => {
      const job = {
        title: 'Junior Developer',
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.seniorityLevel).toBe('entry');
    });

    it('should infer lead level from title', () => {
      const job = {
        title: 'Tech Lead',
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.seniorityLevel).toBe('lead');
    });

    it('should normalize location', () => {
      const job = {
        location: {
          city: 'SF',
          state: 'CA',
          country: 'US',
        },
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.location?.country).toBe('United States');
      expect(result.normalized.location?.state).toBe('California');
    });

    it('should normalize remote location', () => {
      const job = {
        location: {
          city: 'Remote',
          country: 'Anywhere',
        },
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.location?.remote).toBe(true);
      expect(result.normalized.location?.city).toBeUndefined();
    });

    it('should normalize skills', () => {
      const job = {
        requiredSkills: [' JavaScript ', 'PYTHON', 'javascript'],
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.requiredSkills).toEqual(['javascript', 'python']);
    });

    it('should normalize salary', () => {
      const job = {
        salary: {
          min: 150000,
          max: 100000, // Invalid: min > max
          currency: 'usd',
        },
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.salary?.min).toBe(100000);
      expect(result.normalized.salary?.max).toBe(150000);
      expect(result.normalized.salary?.currency).toBe('USD');
    });

    it('should infer role family from title', () => {
      const job = {
        title: 'Software Engineer',
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.roleFamily).toBe('Engineering');
    });

    it('should infer role family from skills', () => {
      const job = {
        requiredSkills: ['React', 'Node.js'],
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.roleFamily).toBe('Engineering');
    });

    it('should calculate freshness score', () => {
      const now = new Date();
      const job = {
        postedAt: now.toISOString(),
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.freshnessScore).toBe(1.0);
    });

    it('should calculate lower freshness for older jobs', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const job = {
        postedAt: thirtyDaysAgo.toISOString(),
      };

      const result = service.normalizeJob(job);

      expect(result.normalized.freshnessScore).toBeLessThan(1.0);
      expect(result.normalized.freshnessScore).toBeGreaterThan(0.5);
    });

    it('should track all changes', () => {
      const job = {
        title: 'Senior Developer',
        workMode: 'Remote' as any,
        location: {
          city: 'NYC',
          state: 'NY',
          country: 'USA',
        },
        requiredSkills: ['javascript', 'JAVASCRIPT'],
      };

      const result = service.normalizeJob(job);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes).toContainEqual(expect.objectContaining({ field: 'workMode' }));
      expect(result.changes).toContainEqual(expect.objectContaining({ field: 'location' }));
      expect(result.changes).toContainEqual(expect.objectContaining({ field: 'requiredSkills' }));
    });
  });
});
