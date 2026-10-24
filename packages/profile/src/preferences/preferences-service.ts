import { v4 as uuidv4 } from 'uuid';
import {
  type CreatePreferencesRequest,
  InvalidPreferencesError,
  type Preferences,
  PreferencesNotFoundError,
  type PreferencesResponse,
  PreferencesSchema,
  type UpdatePreferencesRequest,
  VersionConflictError,
} from './types.js';

// ============================================================================
// Preferences Service
// ============================================================================

/**
 * Service for managing user job search preferences
 */
export class PreferencesService {
  // In-memory storage (replace with database in production)
  private preferencesStore: Map<string, Preferences> = new Map();

  /**
   * Create new preferences for a user
   */
  async createPreferences(request: CreatePreferencesRequest): Promise<PreferencesResponse> {
    const now = new Date().toISOString();
    const preferencesId = uuidv4();

    const preferences: Preferences = {
      id: preferencesId,
      userId: request.userId,
      tenantId: request.tenantId,
      targetRoles: request.targetRoles,
      targetRoleFamilies: request.targetRoleFamilies,
      seniorityLevels: request.seniorityLevels,
      yearsOfExperience: request.yearsOfExperience,
      targetIndustries: request.targetIndustries,
      excludedIndustries: request.excludedIndustries,
      targetLocations: request.targetLocations,
      workMode: request.workMode || 'any',
      workModePreference: request.workModePreference,
      salaryExpectations: request.salaryExpectations,
      preferredCompanySizes: request.preferredCompanySizes,
      preferredCompanyStages: request.preferredCompanyStages,
      targetCompanies: request.targetCompanies,
      excludedCompanies: request.excludedCompanies,
      willingToRelocate: request.willingToRelocate || false,
      relocationLocations: request.relocationLocations,
      relocationAssistance: request.relocationAssistance,
      noticePeriod: request.noticePeriod,
      jobSearchIntensity: request.jobSearchIntensity || 'active',
      applicationFrequency: request.applicationFrequency,
      keywords: request.keywords,
      excludedKeywords: request.excludedKeywords,
      mustHaveSkills: request.mustHaveSkills,
      niceToHaveSkills: request.niceToHaveSkills,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: request.userId,
      updatedBy: request.userId,
      deleted: false,
    };

    // Validate preferences
    const validatedPreferences = this.validatePreferences(preferences);

    // Store preferences
    this.preferencesStore.set(request.userId, validatedPreferences);
    this.preferencesStore.set(preferencesId, validatedPreferences);

    return {
      preferences: validatedPreferences,
      version: validatedPreferences.version,
      createdAt: validatedPreferences.createdAt,
      updatedAt: validatedPreferences.updatedAt,
    };
  }

  /**
   * Get preferences for a user
   */
  async getPreferences(userId: string): Promise<PreferencesResponse> {
    const preferences = this.preferencesStore.get(userId);

    if (!preferences || preferences.deleted) {
      throw new PreferencesNotFoundError(userId);
    }

    return {
      preferences,
      version: preferences.version,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    };
  }

  /**
   * Update preferences (creates new version)
   */
  async updatePreferences(
    userId: string,
    request: UpdatePreferencesRequest,
    expectedVersion?: number
  ): Promise<PreferencesResponse> {
    const currentPreferences = await this.getPreferences(userId);

    // Check version conflict if expected version provided
    if (expectedVersion !== undefined && currentPreferences.version !== expectedVersion) {
      throw new VersionConflictError(currentPreferences.version, expectedVersion);
    }

    const now = new Date().toISOString();
    const newPreferencesId = uuidv4();

    // Merge updates with current preferences
    const updatedPreferences: Preferences = {
      ...currentPreferences.preferences,
      id: newPreferencesId,
      previousVersionId: currentPreferences.preferences.id,
      version: currentPreferences.version + 1,
      targetRoles: request.targetRoles ?? currentPreferences.preferences.targetRoles,
      targetRoleFamilies:
        request.targetRoleFamilies ?? currentPreferences.preferences.targetRoleFamilies,
      seniorityLevels: request.seniorityLevels ?? currentPreferences.preferences.seniorityLevels,
      yearsOfExperience:
        request.yearsOfExperience ?? currentPreferences.preferences.yearsOfExperience,
      targetIndustries: request.targetIndustries ?? currentPreferences.preferences.targetIndustries,
      excludedIndustries:
        request.excludedIndustries ?? currentPreferences.preferences.excludedIndustries,
      targetLocations: request.targetLocations ?? currentPreferences.preferences.targetLocations,
      workMode: request.workMode ?? currentPreferences.preferences.workMode,
      workModePreference:
        request.workModePreference ?? currentPreferences.preferences.workModePreference,
      salaryExpectations:
        request.salaryExpectations ?? currentPreferences.preferences.salaryExpectations,
      preferredCompanySizes:
        request.preferredCompanySizes ?? currentPreferences.preferences.preferredCompanySizes,
      preferredCompanyStages:
        request.preferredCompanyStages ?? currentPreferences.preferences.preferredCompanyStages,
      targetCompanies: request.targetCompanies ?? currentPreferences.preferences.targetCompanies,
      excludedCompanies:
        request.excludedCompanies ?? currentPreferences.preferences.excludedCompanies,
      willingToRelocate:
        request.willingToRelocate ?? currentPreferences.preferences.willingToRelocate,
      relocationLocations:
        request.relocationLocations ?? currentPreferences.preferences.relocationLocations,
      relocationAssistance:
        request.relocationAssistance ?? currentPreferences.preferences.relocationAssistance,
      noticePeriod: request.noticePeriod ?? currentPreferences.preferences.noticePeriod,
      jobSearchIntensity:
        request.jobSearchIntensity ?? currentPreferences.preferences.jobSearchIntensity,
      applicationFrequency:
        request.applicationFrequency ?? currentPreferences.preferences.applicationFrequency,
      keywords: request.keywords ?? currentPreferences.preferences.keywords,
      excludedKeywords: request.excludedKeywords ?? currentPreferences.preferences.excludedKeywords,
      mustHaveSkills: request.mustHaveSkills ?? currentPreferences.preferences.mustHaveSkills,
      niceToHaveSkills: request.niceToHaveSkills ?? currentPreferences.preferences.niceToHaveSkills,
      updatedAt: now,
      updatedBy: userId,
    };

    // Validate updated preferences
    const validatedPreferences = this.validatePreferences(updatedPreferences);

    // Store updated preferences
    this.preferencesStore.set(userId, validatedPreferences);
    this.preferencesStore.set(newPreferencesId, validatedPreferences);
    this.preferencesStore.set(currentPreferences.preferences.id, currentPreferences.preferences);

    return {
      preferences: validatedPreferences,
      version: validatedPreferences.version,
      createdAt: validatedPreferences.createdAt,
      updatedAt: validatedPreferences.updatedAt,
    };
  }

  /**
   * Delete preferences (soft delete)
   */
  async deletePreferences(userId: string): Promise<void> {
    const preferences = this.preferencesStore.get(userId);

    if (!preferences || preferences.deleted) {
      throw new PreferencesNotFoundError(userId);
    }

    const now = new Date().toISOString();
    preferences.deleted = true;
    preferences.deletedAt = now;
    preferences.updatedAt = now;
    preferences.updatedBy = userId;

    this.preferencesStore.set(userId, preferences);
  }

  /**
   * Get preferences history (all versions)
   */
  async getPreferencesHistory(userId: string): Promise<Preferences[]> {
    const currentPreferences = this.preferencesStore.get(userId);

    if (!currentPreferences || currentPreferences.deleted) {
      throw new PreferencesNotFoundError(userId);
    }

    const history: Preferences[] = [currentPreferences];

    // Traverse previous versions
    let current = currentPreferences;
    while (current.previousVersionId) {
      const previous = this.preferencesStore.get(current.previousVersionId);
      if (!previous) break;

      history.unshift(previous);
      current = previous;
    }

    return history;
  }

  /**
   * Check if preferences exist for a user
   */
  async hasPreferences(userId: string): Promise<boolean> {
    const preferences = this.preferencesStore.get(userId);
    return preferences !== undefined && !preferences.deleted;
  }

  /**
   * Get preferences summary (for matching engine)
   */
  async getPreferencesSummary(userId: string): Promise<{
    targetRoles: string[];
    seniorityLevels: string[];
    targetLocations: string[];
    workMode: string;
    salaryRange: { min?: number; max?: number; currency: string };
    mustHaveSkills: string[];
    keywords: string[];
  } | null> {
    try {
      const response = await this.getPreferences(userId);
      const prefs = response.preferences;

      return {
        targetRoles: prefs.targetRoles,
        seniorityLevels: prefs.seniorityLevels || [],
        targetLocations:
          prefs.targetLocations?.map((loc) =>
            [loc.city, loc.state, loc.country].filter(Boolean).join(', ')
          ) || [],
        workMode: prefs.workMode,
        salaryRange: {
          min: prefs.salaryExpectations?.min,
          max: prefs.salaryExpectations?.max,
          currency: prefs.salaryExpectations?.currency || 'USD',
        },
        mustHaveSkills: prefs.mustHaveSkills || [],
        keywords: prefs.keywords || [],
      };
    } catch (error) {
      if (error instanceof PreferencesNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate preferences data
   */
  private validatePreferences(preferences: Preferences): Preferences {
    try {
      return PreferencesSchema.parse(preferences);
    } catch (error) {
      throw new InvalidPreferencesError(error);
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
