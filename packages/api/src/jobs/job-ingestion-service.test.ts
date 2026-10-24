import { beforeEach, describe, expect, it } from 'vitest';
import { JobIngestionService } from './job-ingestion-service.js';
import { JobNotFoundError } from './types.js';

describe('JobIngestionService', () => {
  let service: JobIngestionService;

  beforeEach(() => {
    service = new JobIngestionService();
  });

  describe('ingestJob', () => {
    it('should ingest a new job successfully', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: {
          country: 'US',
          city: 'San Francisco',
        },
        userId: 'user-1',
      };

      const result = await service.ingestJob(request);

      expect(result.job.id).toBeDefined();
      expect(result.job.tenantId).toBe('tenant-1');
      expect(result.job.companyName).toBe('Tech Corp');
      expect(result.job.title).toBe('Software Engineer');
      expect(result.isDuplicate).toBe(false);
      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('Tech Corp');
    });

    it('should detect duplicate jobs', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: {
          country: 'US',
          city: 'San Francisco',
        },
        userId: 'user-1',
      };

      // Ingest first job
      await service.ingestJob(request);

      // Ingest duplicate job
      const duplicateRequest = {
        ...request,
        source: 'indeed' as const,
        companyName: 'tech corp', // Different case
        title: 'software engineer', // Different case
      };

      const result = await service.ingestJob(duplicateRequest);

      expect(result.isDuplicate).toBe(true);
      expect(result.canonicalJobId).toBeDefined();
    });

    it('should normalize job data during ingestion', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Senior Software Engineer',
        description: 'We are looking for a software engineer',
        location: {
          country: 'US',
          city: 'SF',
          state: 'CA',
        },
        workMode: 'Work From Home' as any,
        userId: 'user-1',
      };

      const result = await service.ingestJob(request);

      expect(result.job.workMode).toBe('remote');
      expect(result.job.seniorityLevel).toBe('senior');
      expect(result.job.location?.country).toBe('United States');
    });

    it('should create company if it does not exist', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'New Company',
        companyWebsite: 'https://newcompany.com',
        companySize: 'medium' as const,
        title: 'Software Engineer',
        description: 'Job description',
        location: {
          country: 'US',
        },
        userId: 'user-1',
      };

      const result = await service.ingestJob(request);

      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('New Company');
      expect(result.company?.website).toBe('https://newcompany.com');
      expect(result.company?.size).toBe('medium');
    });

    it('should reuse existing company', async () => {
      const request1 = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job 1',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const request2 = {
        tenantId: 'tenant-1',
        source: 'indeed' as const,
        companyName: 'Tech Corp',
        title: 'Product Manager',
        description: 'Job 2',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const result1 = await service.ingestJob(request1);
      const result2 = await service.ingestJob(request2);

      expect(result1.company?.id).toBe(result2.company?.id);
    });
  });

  describe('getJob', () => {
    it('should retrieve job by ID', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job description',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const ingested = await service.ingestJob(request);
      const retrieved = await service.getJob(ingested.job.id, 'tenant-1');

      expect(retrieved.id).toBe(ingested.job.id);
      expect(retrieved.title).toBe('Software Engineer');
    });

    it('should throw error if job not found', async () => {
      await expect(service.getJob('non-existent-id', 'tenant-1')).rejects.toThrow(JobNotFoundError);
    });

    it('should throw error if job belongs to different tenant', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job description',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const ingested = await service.ingestJob(request);

      await expect(service.getJob(ingested.job.id, 'tenant-2')).rejects.toThrow(JobNotFoundError);
    });

    it('should return canonical job if job is duplicate', async () => {
      const request1 = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job description',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const request2 = {
        tenantId: 'tenant-1',
        source: 'indeed' as const,
        companyName: 'tech corp',
        title: 'software engineer',
        description: 'Job description',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const result1 = await service.ingestJob(request1);
      const result2 = await service.ingestJob(request2);

      const retrieved = await service.getJob(result2.job.id, 'tenant-1');

      expect(retrieved.id).toBe(result1.job.id);
    });
  });

  describe('updateJob', () => {
    it('should update job and increment version', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job description',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const ingested = await service.ingestJob(request);
      const updated = await service.updateJob(
        ingested.job.id,
        'tenant-1',
        { title: 'Senior Software Engineer' },
        'user-1'
      );

      expect(updated.title).toBe('Senior Software Engineer');
      expect(updated.version).toBe(2);
    });
  });

  describe('deleteJob', () => {
    it('should soft delete job', async () => {
      const request = {
        tenantId: 'tenant-1',
        source: 'linkedin' as const,
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job description',
        location: { country: 'US' },
        userId: 'user-1',
      };

      const ingested = await service.ingestJob(request);
      await service.deleteJob(ingested.job.id, 'tenant-1', 'user-1');

      await expect(service.getJob(ingested.job.id, 'tenant-1')).rejects.toThrow(JobNotFoundError);
    });
  });

  describe('listJobs', () => {
    it('should list jobs for tenant', async () => {
      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job 1',
        location: { country: 'US' },
        userId: 'user-1',
      });

      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'indeed',
        companyName: 'Tech Corp',
        title: 'Product Manager',
        description: 'Job 2',
        location: { country: 'US' },
        userId: 'user-1',
      });

      const result = await service.listJobs({ tenantId: 'tenant-1' });

      expect(result.jobs).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const ingested = await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job',
        location: { country: 'US' },
        userId: 'user-1',
      });

      await service.updateJob(ingested.job.id, 'tenant-1', { status: 'closed' }, 'user-1');

      const result = await service.listJobs({
        tenantId: 'tenant-1',
        status: 'active',
      });

      expect(result.jobs).toHaveLength(0);
    });

    it('should filter by work mode', async () => {
      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job',
        location: { country: 'US' },
        workMode: 'remote',
        userId: 'user-1',
      });

      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'indeed',
        companyName: 'Tech Corp',
        title: 'Product Manager',
        description: 'Job',
        location: { country: 'US' },
        workMode: 'on-site',
        userId: 'user-1',
      });

      const result = await service.listJobs({
        tenantId: 'tenant-1',
        workMode: 'remote',
      });

      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].workMode).toBe('remote');
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 5; i++) {
        await service.ingestJob({
          tenantId: 'tenant-1',
          source: 'linkedin',
          companyName: 'Tech Corp',
          title: `Job ${i}`,
          description: `Description ${i}`,
          location: { country: 'US' },
          userId: 'user-1',
        });
      }

      const result = await service.listJobs({
        tenantId: 'tenant-1',
        page: 1,
        pageSize: 2,
      });

      expect(result.jobs).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('updateFreshnessScores', () => {
    it('should update freshness scores for all jobs', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job',
        location: { country: 'US' },
        postedAt: thirtyDaysAgo.toISOString(),
        userId: 'user-1',
      });

      await service.updateFreshnessScores('tenant-1');

      const result = await service.listJobs({ tenantId: 'tenant-1' });

      expect(result.jobs[0].freshnessScore).toBeLessThan(1);
    });
  });

  describe('markStaleJobsAsExpired', () => {
    it('should mark old jobs as expired', async () => {
      const ninetyOneDaysAgo = new Date();
      ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job',
        location: { country: 'US' },
        userId: 'user-1',
      });

      // Manually update lastSeenAt to be old
      const jobs = await service.listJobs({ tenantId: 'tenant-1' });
      await service.updateJob(
        jobs.jobs[0].id,
        'tenant-1',
        { lastSeenAt: ninetyOneDaysAgo.toISOString() },
        'user-1'
      );

      const expiredCount = await service.markStaleJobsAsExpired('tenant-1', 90);

      expect(expiredCount).toBe(1);

      const updatedJobs = await service.listJobs({
        tenantId: 'tenant-1',
        status: 'expired',
      });

      expect(updatedJobs.jobs).toHaveLength(1);
    });
  });

  describe('getJobStats', () => {
    it('should return job statistics', async () => {
      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'linkedin',
        companyName: 'Tech Corp',
        title: 'Software Engineer',
        description: 'Job',
        location: { country: 'US' },
        workMode: 'remote',
        seniorityLevel: 'senior',
        userId: 'user-1',
      });

      await service.ingestJob({
        tenantId: 'tenant-1',
        source: 'indeed',
        companyName: 'Tech Corp',
        title: 'Product Manager',
        description: 'Job',
        location: { country: 'US' },
        workMode: 'on-site',
        seniorityLevel: 'mid',
        userId: 'user-1',
      });

      const stats = await service.getJobStats('tenant-1');

      expect(stats.totalJobs).toBe(2);
      expect(stats.activeJobs).toBe(2);
      expect(stats.bySource.linkedin).toBe(1);
      expect(stats.bySource.indeed).toBe(1);
      expect(stats.byWorkMode.remote).toBe(1);
      expect(stats.byWorkMode['on-site']).toBe(1);
      expect(stats.bySeniority.senior).toBe(1);
      expect(stats.bySeniority.mid).toBe(1);
    });
  });
});
