import { describe, it, expect, beforeEach } from 'vitest';
import { JobDeduplicationService } from './job-deduplication.js';
import { Job } from './types.js';

describe('JobDeduplicationService', () => {
  let service: JobDeduplicationService;

  beforeEach(() => {
    service = new JobDeduplicationService();
  });

  describe('generateJobFingerprint', () => {
    it('should generate consistent fingerprint for same job', () => {
      const job = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
        },
        description: 'We are looking for a software engineer',
      };

      const fingerprint1 = service.generateJobFingerprint(job);
      const fingerprint2 = service.generateJobFingerprint(job);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate same fingerprint for similar jobs', () => {
      const job1 = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: {
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
        },
        description: 'We are looking for a software engineer',
      };

      const job2 = {
        companyName: 'tech corp', // Different case
        title: 'software engineer', // Different case
        location: {
          city: 'san francisco', // Different case
          state: 'ca', // Different case
          country: 'us', // Different case
        },
        description: 'We are looking for a software engineer',
      };

      const fingerprint1 = service.generateJobFingerprint(job1);
      const fingerprint2 = service.generateJobFingerprint(job2);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate different fingerprints for different jobs', () => {
      const job1 = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: {
          city: 'San Francisco',
          country: 'US',
        },
        description: 'Software engineer position',
      };

      const job2 = {
        companyName: 'Tech Corp',
        title: 'Product Manager', // Different title
        location: {
          city: 'San Francisco',
          country: 'US',
        },
        description: 'Product manager position',
      };

      const fingerprint1 = service.generateJobFingerprint(job1);
      const fingerprint2 = service.generateJobFingerprint(job2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe('areJobsDuplicate', () => {
    it('should return true for duplicate jobs', () => {
      const job1 = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: {
          city: 'San Francisco',
          country: 'US',
        },
        description: 'Software engineer position',
      };

      const job2 = {
        companyName: 'tech corp',
        title: 'software engineer',
        location: {
          city: 'san francisco',
          country: 'us',
        },
        description: 'Software engineer position',
      };

      expect(service.areJobsDuplicate(job1, job2)).toBe(true);
    });

    it('should return false for different jobs', () => {
      const job1 = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: {
          city: 'San Francisco',
          country: 'US',
        },
        description: 'Software engineer position',
      };

      const job2 = {
        companyName: 'Tech Corp',
        title: 'Product Manager',
        location: {
          city: 'San Francisco',
          country: 'US',
        },
        description: 'Product manager position',
      };

      expect(service.areJobsDuplicate(job1, job2)).toBe(false);
    });
  });

  describe('findDuplicates', () => {
    it('should find duplicate jobs', () => {
      const now = new Date().toISOString();
      const jobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Software engineer position',
          location: { country: 'US', city: 'San Francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
        {
          id: 'job-2',
          tenantId: 'tenant-1',
          source: 'indeed',
          companyName: 'tech corp',
          title: 'software engineer',
          description: 'Software engineer position',
          location: { country: 'US', city: 'san francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const duplicates = service.findDuplicates(jobs);

      expect(duplicates.size).toBe(1);
      const duplicateGroup = Array.from(duplicates.values())[0];
      expect(duplicateGroup).toHaveLength(2);
    });

    it('should not include non-duplicate jobs', () => {
      const now = new Date().toISOString();
      const jobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Software engineer position',
          location: { country: 'US', city: 'San Francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
        {
          id: 'job-2',
          tenantId: 'tenant-1',
          source: 'indeed',
          companyName: 'Tech Corp',
          title: 'Product Manager', // Different title
          description: 'Product manager position',
          location: { country: 'US', city: 'San Francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const duplicates = service.findDuplicates(jobs);

      expect(duplicates.size).toBe(0);
    });

    it('should exclude deleted jobs', () => {
      const now = new Date().toISOString();
      const jobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Software engineer position',
          location: { country: 'US', city: 'San Francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: true, // Deleted
        },
        {
          id: 'job-2',
          tenantId: 'tenant-1',
          source: 'indeed',
          companyName: 'tech corp',
          title: 'software engineer',
          description: 'Software engineer position',
          location: { country: 'US', city: 'san francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const duplicates = service.findDuplicates(jobs);

      expect(duplicates.size).toBe(0);
    });
  });

  describe('selectCanonicalJob', () => {
    it('should select job with most complete data', () => {
      const now = new Date().toISOString();
      const jobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Short',
          location: { country: 'US' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
        {
          id: 'job-2',
          tenantId: 'tenant-1',
          source: 'indeed',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Very long description with lots of details about the job',
          location: { country: 'US', city: 'San Francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const canonical = service.selectCanonicalJob(jobs);

      expect(canonical.id).toBe('job-2');
    });

    it('should select newer job if completeness is equal', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const jobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Description',
          location: { country: 'US' },
          workMode: 'remote',
          status: 'active',
          postedAt: yesterday.toISOString(),
          lastSeenAt: yesterday.toISOString(),
          freshnessScore: 1,
          version: 1,
          createdAt: yesterday.toISOString(),
          updatedAt: yesterday.toISOString(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
        {
          id: 'job-2',
          tenantId: 'tenant-1',
          source: 'indeed',
          companyName: 'Tech Corp',
          title: 'Software Engineer',
          description: 'Description',
          location: { country: 'US' },
          workMode: 'remote',
          status: 'active',
          postedAt: now.toISOString(),
          lastSeenAt: now.toISOString(),
          freshnessScore: 1,
          version: 1,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const canonical = service.selectCanonicalJob(jobs);

      expect(canonical.id).toBe('job-2');
    });
  });

  describe('mergeDuplicateJobs', () => {
    it('should merge missing fields from duplicates', () => {
      const now = new Date().toISOString();
      const canonical: Job = {
        id: 'job-1',
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Description',
        location: { country: 'US' },
        workMode: 'remote',
        status: 'active',
        postedAt: now,
        lastSeenAt: now,
        freshnessScore: 1,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        deleted: false,
      };

      const duplicate: Job = {
        ...canonical,
        id: 'job-2',
        requirements: 'Requirements',
        benefits: 'Benefits',
        requiredSkills: ['JavaScript', 'TypeScript'],
      };

      const merged = service.mergeDuplicateJobs(canonical, [duplicate]);

      expect(merged.requirements).toBe('Requirements');
      expect(merged.benefits).toBe('Benefits');
      expect(merged.requiredSkills).toEqual(['JavaScript', 'TypeScript']);
    });

    it('should merge skills without duplicates', () => {
      const now = new Date().toISOString();
      const canonical: Job = {
        id: 'job-1',
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Description',
        location: { country: 'US' },
        workMode: 'remote',
        status: 'active',
        postedAt: now,
        lastSeenAt: now,
        freshnessScore: 1,
        requiredSkills: ['JavaScript'],
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: 'user-1',
        updatedBy: 'user-1',
        deleted: false,
      };

      const duplicate: Job = {
        ...canonical,
        id: 'job-2',
        requiredSkills: ['JavaScript', 'TypeScript'],
      };

      const merged = service.mergeDuplicateJobs(canonical, [duplicate]);

      expect(merged.requiredSkills).toEqual(['JavaScript', 'TypeScript']);
    });
  });

  describe('findPotentialDuplicates', () => {
    it('should find potential duplicates above threshold', () => {
      const now = new Date().toISOString();
      const newJob = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: { country: 'US', city: 'San Francisco' },
        description: 'Software engineer position',
      };

      const existingJobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'tech corp',
          title: 'software engineer',
          description: 'Software engineer position',
          location: { country: 'US', city: 'san francisco' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const duplicates = service.findPotentialDuplicates(newJob, existingJobs, 0.8);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].id).toBe('job-1');
    });

    it('should not find duplicates below threshold', () => {
      const now = new Date().toISOString();
      const newJob = {
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        location: { country: 'US', city: 'San Francisco' },
        description: 'Software engineer position',
      };

      const existingJobs: Job[] = [
        {
          id: 'job-1',
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Different Company',
          title: 'Product Manager',
          description: 'Product manager position',
          location: { country: 'US', city: 'New York' },
          workMode: 'remote',
          status: 'active',
          postedAt: now,
          lastSeenAt: now,
          freshnessScore: 1,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: 'user-1',
          updatedBy: 'user-1',
          deleted: false,
        },
      ];

      const duplicates = service.findPotentialDuplicates(newJob, existingJobs, 0.8);

      expect(duplicates).toHaveLength(0);
    });
  });
});
