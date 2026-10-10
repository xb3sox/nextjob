import { describe, it, expect, beforeEach } from 'vitest';
import { PreferencesService } from './preferences-service.js';
import { PreferencesNotFoundError, InvalidPreferencesError, VersionConflictError } from './types.js';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    service = new PreferencesService();
  });

  describe('createPreferences', () => {
    it('should create preferences with required fields', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer', 'Senior Developer'],
      };

      const result = await service.createPreferences(request);

      expect(result.preferences.userId).toBe('user-123');
      expect(result.preferences.targetRoles).toEqual(['Software Engineer', 'Senior Developer']);
      expect(result.preferences.version).toBe(1);
      expect(result.preferences.workMode).toBe('any');
      expect(result.preferences.jobSearchIntensity).toBe('active');
    });

    it('should create preferences with all optional fields', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
        targetRoleFamilies: ['Engineering'],
        seniorityLevels: ['senior' as const, 'lead' as const],
        yearsOfExperience: 5,
        targetIndustries: ['Technology', 'Finance'],
        excludedIndustries: ['Gambling'],
        targetLocations: [
          { city: 'San Francisco', state: 'CA', country: 'US', remote: true },
          { country: 'US', remote: true },
        ],
        workMode: 'hybrid' as const,
        workModePreference: '3 days in office',
        salaryExpectations: {
          min: 120000,
          max: 180000,
          currency: 'USD',
          period: 'yearly' as const,
          flexible: true,
        },
        preferredCompanySizes: ['medium' as const, 'large' as const],
        preferredCompanyStages: ['series-b' as const, 'series-c' as const],
        targetCompanies: ['Google', 'Meta'],
        excludedCompanies: ['Facebook'],
        willingToRelocate: true,
        relocationLocations: ['New York', 'London'],
        relocationAssistance: true,
        noticePeriod: {
          weeks: 2,
          immediate: false,
          negotiable: true,
        },
        jobSearchIntensity: 'active' as const,
        applicationFrequency: 10,
        keywords: ['remote', 'startup'],
        excludedKeywords: ['onsite'],
        mustHaveSkills: ['TypeScript', 'React'],
        niceToHaveSkills: ['Node.js', 'GraphQL'],
      };

      const result = await service.createPreferences(request);

      expect(result.preferences.targetRoleFamilies).toEqual(['Engineering']);
      expect(result.preferences.seniorityLevels).toEqual(['senior', 'lead']);
      expect(result.preferences.yearsOfExperience).toBe(5);
      expect(result.preferences.targetIndustries).toEqual(['Technology', 'Finance']);
      expect(result.preferences.workMode).toBe('hybrid');
      expect(result.preferences.salaryExpectations?.min).toBe(120000);
      expect(result.preferences.willingToRelocate).toBe(true);
      expect(result.preferences.noticePeriod?.weeks).toBe(2);
      expect(result.preferences.mustHaveSkills).toEqual(['TypeScript', 'React']);
    });

    it('should throw error if targetRoles is empty', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: [],
      };

      await expect(service.createPreferences(request)).rejects.toThrow(InvalidPreferencesError);
    });
  });

  describe('getPreferences', () => {
    it('should retrieve preferences for a user', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);
      const result = await service.getPreferences('user-123');

      expect(result.preferences.userId).toBe('user-123');
      expect(result.preferences.targetRoles).toEqual(['Software Engineer']);
      expect(result.version).toBe(1);
    });

    it('should throw error if preferences not found', async () => {
      await expect(service.getPreferences('non-existent-user')).rejects.toThrow(
        PreferencesNotFoundError
      );
    });

    it('should throw error if preferences are deleted', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);
      await service.deletePreferences('user-123');

      await expect(service.getPreferences('user-123')).rejects.toThrow(PreferencesNotFoundError);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences and increment version', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);

      const updateRequest = {
        targetRoles: ['Senior Software Engineer', 'Tech Lead'],
        workMode: 'remote' as const,
      };

      const result = await service.updatePreferences('user-123', updateRequest);

      expect(result.preferences.targetRoles).toEqual(['Senior Software Engineer', 'Tech Lead']);
      expect(result.preferences.workMode).toBe('remote');
      expect(result.version).toBe(2);
    });

    it('should preserve unchanged fields', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
        yearsOfExperience: 5,
        workMode: 'hybrid' as const,
      };

      await service.createPreferences(request);

      const updateRequest = {
        targetRoles: ['Senior Software Engineer'],
      };

      const result = await service.updatePreferences('user-123', updateRequest);

      expect(result.preferences.yearsOfExperience).toBe(5);
      expect(result.preferences.workMode).toBe('hybrid');
    });

    it('should throw version conflict error if expected version mismatch', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      const result = await service.createPreferences(request);

      const updateRequest = {
        targetRoles: ['Senior Software Engineer'],
      };

      await expect(
        service.updatePreferences('user-123', updateRequest, 999)
      ).rejects.toThrow(VersionConflictError);
    });

    it('should succeed if expected version matches', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      const result = await service.createPreferences(request);

      const updateRequest = {
        targetRoles: ['Senior Software Engineer'],
      };

      const updated = await service.updatePreferences('user-123', updateRequest, result.version);

      expect(updated.version).toBe(2);
    });
  });

  describe('deletePreferences', () => {
    it('should soft delete preferences', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);
      await service.deletePreferences('user-123');

      await expect(service.getPreferences('user-123')).rejects.toThrow(PreferencesNotFoundError);
    });

    it('should throw error if preferences not found', async () => {
      await expect(service.deletePreferences('non-existent-user')).rejects.toThrow(
        PreferencesNotFoundError
      );
    });
  });

  describe('getPreferencesHistory', () => {
    it('should return all versions of preferences', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);

      await service.updatePreferences('user-123', {
        targetRoles: ['Senior Software Engineer'],
      });

      await service.updatePreferences('user-123', {
        targetRoles: ['Tech Lead'],
      });

      const history = await service.getPreferencesHistory('user-123');

      expect(history).toHaveLength(3);
      expect(history[0].targetRoles).toEqual(['Software Engineer']);
      expect(history[1].targetRoles).toEqual(['Senior Software Engineer']);
      expect(history[2].targetRoles).toEqual(['Tech Lead']);
    });

    it('should throw error if preferences not found', async () => {
      await expect(service.getPreferencesHistory('non-existent-user')).rejects.toThrow(
        PreferencesNotFoundError
      );
    });
  });

  describe('hasPreferences', () => {
    it('should return true if preferences exist', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);

      const hasPrefs = await service.hasPreferences('user-123');
      expect(hasPrefs).toBe(true);
    });

    it('should return false if preferences do not exist', async () => {
      const hasPrefs = await service.hasPreferences('non-existent-user');
      expect(hasPrefs).toBe(false);
    });

    it('should return false if preferences are deleted', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
      };

      await service.createPreferences(request);
      await service.deletePreferences('user-123');

      const hasPrefs = await service.hasPreferences('user-123');
      expect(hasPrefs).toBe(false);
    });
  });

  describe('getPreferencesSummary', () => {
    it('should return summary for matching engine', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        targetRoles: ['Software Engineer'],
        seniorityLevels: ['senior' as const],
        targetLocations: [
          { city: 'San Francisco', state: 'CA', country: 'US' },
        ],
        workMode: 'hybrid' as const,
        salaryExpectations: {
          min: 120000,
          max: 180000,
          currency: 'USD',
        },
        mustHaveSkills: ['TypeScript', 'React'],
        keywords: ['remote', 'startup'],
      };

      await service.createPreferences(request);

      const summary = await service.getPreferencesSummary('user-123');

      expect(summary).not.toBeNull();
      expect(summary?.targetRoles).toEqual(['Software Engineer']);
      expect(summary?.seniorityLevels).toEqual(['senior']);
      expect(summary?.targetLocations).toEqual(['San Francisco, CA, US']);
      expect(summary?.workMode).toBe('hybrid');
      expect(summary?.salaryRange.min).toBe(120000);
      expect(summary?.salaryRange.max).toBe(180000);
      expect(summary?.mustHaveSkills).toEqual(['TypeScript', 'React']);
      expect(summary?.keywords).toEqual(['remote', 'startup']);
    });

    it('should return null if preferences do not exist', async () => {
      const summary = await service.getPreferencesSummary('non-existent-user');
      expect(summary).toBeNull();
    });
  });
});
