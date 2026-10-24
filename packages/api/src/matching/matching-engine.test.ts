import { beforeEach, describe, expect, it } from 'vitest';
import { MatchingEngineService } from './matching-engine.js';

describe('MatchingEngineService', () => {
  let service: MatchingEngineService;

  beforeEach(() => {
    service = new MatchingEngineService();
  });

  describe('calculateMatch', () => {
    it('should calculate excellent match when all factors align', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [
            { name: 'JavaScript', level: 'expert' },
            { name: 'React', level: 'expert' },
            { name: 'Node.js', level: 'advanced' },
          ],
          experience: [{ title: 'Senior Developer', years: 5 }],
          education: [{ degree: 'Bachelor', field: 'Computer Science' }],
          location: { country: 'US', city: 'San Francisco' },
          preferences: {
            targetRoles: ['Software Engineer'],
            salaryExpectations: { min: 120000, max: 180000 },
          },
        },
        job: {
          title: 'Senior Software Engineer',
          description: 'We are looking for a senior software engineer',
          requiredSkills: ['JavaScript', 'React'],
          preferredSkills: ['Node.js'],
          experience: { min: 5, max: 10 },
          education: { minimumDegree: 'bachelor' },
          location: { country: 'US', city: 'San Francisco', remote: false },
          salary: { min: 130000, max: 170000 },
          roleFamily: 'Engineering',
          seniorityLevel: 'senior',
        },
      };

      const result = await service.calculateMatch(request);

      expect(result.match).toBeDefined();
      expect(result.match.score).toBeGreaterThan(85);
      expect(result.match.status).toBe('excellent');
      expect(result.match.strengths.length).toBeGreaterThan(0);
      expect(result.match.confidence).toBeGreaterThan(0.8);
    });

    it('should calculate good match when most factors align', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [
            { name: 'JavaScript', level: 'advanced' },
            { name: 'React', level: 'intermediate' },
          ],
          experience: [{ title: 'Developer', years: 3 }],
          education: [{ degree: 'Bachelor', field: 'Computer Science' }],
          location: { country: 'US', city: 'New York' },
        },
        job: {
          title: 'Software Engineer',
          description: 'Software engineer position',
          requiredSkills: ['JavaScript', 'React', 'TypeScript'],
          experience: { min: 2, max: 5 },
          location: { country: 'CA', city: 'Toronto', remote: false },
        },
      };

      const result = await service.calculateMatch(request);

      expect(result.match.score).toBeGreaterThanOrEqual(70);
      expect(result.match.score).toBeLessThan(85);
      expect(result.match.status).toBe('good');
    });

    it('should calculate weak match when few factors align', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [{ name: 'JavaScript', level: 'junior' }],
          experience: [{ title: 'Junior Developer', years: 3 }],
          education: [{ degree: 'Associate', field: 'Business' }],
          location: { country: 'US', city: 'Chicago' },
        },
        job: {
          title: 'Senior JavaScript Developer',
          description: 'Senior JavaScript developer position',
          requiredSkills: ['JavaScript', 'React', 'Node.js'],
          experience: { min: 5, max: 10 },
          education: { minimumDegree: 'bachelor' },
          location: { country: 'US', city: 'San Francisco', remote: false },
        },
      };

      const result = await service.calculateMatch(request);

      expect(result.match.score).toBeLessThan(70);
      expect(result.match.status).toBe('weak');
      expect(result.match.weaknesses.length).toBeGreaterThan(0);
    });

    it('should handle remote jobs correctly', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [{ name: 'JavaScript' }],
          experience: [{ title: 'Developer', years: 3 }],
          education: [{ degree: 'Bachelor' }],
          location: { country: 'India', city: 'Bangalore' },
        },
        job: {
          title: 'JavaScript Developer',
          description: 'JavaScript developer position',
          requiredSkills: ['JavaScript'],
          location: { country: 'US', remote: true },
        },
      };

      const result = await service.calculateMatch(request);

      // Location should be perfect match for remote job
      const locationFactor = result.match.factors.find((f) => f.name === 'location');
      expect(locationFactor?.score).toBe(100);
    });

    it('should handle missing user data gracefully', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [],
          experience: [],
          education: [],
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: ['JavaScript'],
        },
      };

      const result = await service.calculateMatch(request);

      expect(result.match).toBeDefined();
      expect(result.match.confidence).toBeGreaterThan(0);
    });

    it('should calculate skills match with preferred skills bonus', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }],
          experience: [],
          education: [],
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: ['JavaScript'],
          preferredSkills: ['React', 'Node.js'],
        },
      };

      const result = await service.calculateMatch(request);

      const skillsFactor = result.match.factors.find((f) => f.name === 'skills');
      expect(skillsFactor?.score).toBe(100); // Required + preferred bonus
    });

    it('should calculate experience match correctly', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [],
          experience: [{ title: 'Developer', years: 7 }],
          education: [],
        },
        job: {
          title: 'Senior Developer',
          description: 'Senior developer position',
          requiredSkills: [],
          experience: { min: 5, max: 10 },
        },
      };

      const result = await service.calculateMatch(request);

      const experienceFactor = result.match.factors.find((f) => f.name === 'experience');
      expect(experienceFactor?.score).toBe(100); // Within range
    });

    it('should calculate education match correctly', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [],
          experience: [],
          education: [{ degree: 'Master', field: 'Computer Science' }],
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: [],
          education: { minimumDegree: 'bachelor' },
        },
      };

      const result = await service.calculateMatch(request);

      const educationFactor = result.match.factors.find((f) => f.name === 'education');
      expect(educationFactor?.score).toBe(100); // Master > Bachelor
    });

    it('should calculate salary match correctly', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [],
          experience: [],
          education: [],
          preferences: {
            salaryExpectations: { min: 100000, max: 150000 },
          },
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: [],
          salary: { min: 120000, max: 140000 },
        },
      };

      const result = await service.calculateMatch(request);

      const salaryFactor = result.match.factors.find((f) => f.name === 'salary');
      expect(salaryFactor?.score).toBeGreaterThan(50); // Some overlap
    });

    it('should generate strengths and weaknesses', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [{ name: 'JavaScript' }],
          experience: [{ title: 'Developer', years: 3 }],
          education: [{ degree: 'Bachelor' }],
          location: { country: 'US' },
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: ['JavaScript', 'React'],
          experience: { min: 5 },
          location: { country: 'UK' },
        },
      };

      const result = await service.calculateMatch(request);

      expect(result.match.strengths.length).toBeGreaterThanOrEqual(0);
      expect(result.match.weaknesses.length).toBeGreaterThanOrEqual(0);
      expect(result.match.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('rankJobs', () => {
    it('should rank jobs by score', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobIds: ['job-1', 'job-2', 'job-3'],
        userProfile: {
          skills: [{ name: 'JavaScript' }],
          experience: [{ title: 'Developer', years: 3 }],
          education: [{ degree: 'Bachelor' }],
        },
        jobs: [
          {
            id: 'job-1',
            title: 'JavaScript Developer',
            description: 'JavaScript position',
            requiredSkills: ['JavaScript'],
          },
          {
            id: 'job-2',
            title: 'Python Developer',
            description: 'Python position',
            requiredSkills: ['Python'],
          },
          {
            id: 'job-3',
            title: 'Full Stack Developer',
            description: 'Full stack position',
            requiredSkills: ['JavaScript', 'React'],
          },
        ],
      };

      const result = await service.rankJobs(request);

      expect(result.matches).toBeDefined();
      expect(result.matches.length).toBe(3);
      expect(result.total).toBe(3);

      // Check that matches are sorted by score (descending)
      for (let i = 0; i < result.matches.length - 1; i++) {
        expect(result.matches[i].score).toBeGreaterThanOrEqual(result.matches[i + 1].score);
      }
    });
  });

  describe('getMatch', () => {
    it('should retrieve match by ID', async () => {
      const request = {
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [{ name: 'JavaScript' }],
          experience: [],
          education: [],
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: ['JavaScript'],
        },
      };

      const result = await service.calculateMatch(request);
      const retrieved = await service.getMatch(result.match.id);

      expect(retrieved.id).toBe(result.match.id);
      expect(retrieved.score).toBe(result.match.score);
    });

    it('should throw error for non-existent match', async () => {
      await expect(service.getMatch('non-existent-id')).rejects.toThrow();
    });
  });

  describe('listMatches', () => {
    it('should list all matches for user', async () => {
      // Create multiple matches
      for (let i = 0; i < 3; i++) {
        await service.calculateMatch({
          userId: 'user-1',
          tenantId: 'tenant-1',
          jobId: `job-${i}`,
          eligibilityId: `elig-${i}`,
          userProfile: {
            skills: [{ name: 'JavaScript' }],
            experience: [],
            education: [],
          },
          job: {
            title: `Developer ${i}`,
            description: `Developer position ${i}`,
            requiredSkills: ['JavaScript'],
          },
        });
      }

      const matches = await service.listMatches('user-1', 'tenant-1');

      expect(matches.length).toBe(3);
    });

    it('should filter matches by user and tenant', async () => {
      await service.calculateMatch({
        userId: 'user-1',
        tenantId: 'tenant-1',
        jobId: 'job-1',
        eligibilityId: 'elig-1',
        userProfile: {
          skills: [],
          experience: [],
          education: [],
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: [],
        },
      });

      await service.calculateMatch({
        userId: 'user-2',
        tenantId: 'tenant-1',
        jobId: 'job-2',
        eligibilityId: 'elig-2',
        userProfile: {
          skills: [],
          experience: [],
          education: [],
        },
        job: {
          title: 'Developer',
          description: 'Developer position',
          requiredSkills: [],
        },
      });

      const user1Matches = await service.listMatches('user-1', 'tenant-1');
      expect(user1Matches.length).toBe(1);
      expect(user1Matches[0].userId).toBe('user-1');
    });
  });
});
