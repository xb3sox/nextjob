import type { Job, NormalizeJobResponse, SeniorityLevel, WorkMode } from './types.js';

// ============================================================================
// Job Normalization Service
// ============================================================================

/**
 * Service for normalizing job data from various sources
 */
export class JobNormalizationService {
  /**
   * Normalize job data from external source
   */
  normalizeJob(jobData: Partial<Job>): NormalizeJobResponse {
    const changes: Array<{ field: string; original: any; normalized: any }> = [];
    const normalized = { ...jobData };

    // Normalize work mode
    if (jobData.workMode) {
      const normalizedWorkMode = this.normalizeWorkMode(jobData.workMode);
      if (normalizedWorkMode !== jobData.workMode) {
        changes.push({
          field: 'workMode',
          original: jobData.workMode,
          normalized: normalizedWorkMode,
        });
        normalized.workMode = normalizedWorkMode;
      }
    }

    // Normalize seniority level
    if (jobData.title) {
      const inferredSeniority = this.inferSeniorityFromTitle(jobData.title);
      if (inferredSeniority && !jobData.seniorityLevel) {
        normalized.seniorityLevel = inferredSeniority;
        changes.push({
          field: 'seniorityLevel',
          original: null,
          normalized: inferredSeniority,
        });
      }
    }

    // Normalize location
    if (jobData.location) {
      const normalizedLocation = this.normalizeLocation(jobData.location);
      if (JSON.stringify(normalizedLocation) !== JSON.stringify(jobData.location)) {
        changes.push({
          field: 'location',
          original: jobData.location,
          normalized: normalizedLocation,
        });
        normalized.location = normalizedLocation;
      }
    }

    // Normalize skills
    if (jobData.requiredSkills) {
      const normalizedSkills = this.normalizeSkills(jobData.requiredSkills);
      if (JSON.stringify(normalizedSkills) !== JSON.stringify(jobData.requiredSkills)) {
        changes.push({
          field: 'requiredSkills',
          original: jobData.requiredSkills,
          normalized: normalizedSkills,
        });
        normalized.requiredSkills = normalizedSkills;
      }
    }

    if (jobData.preferredSkills) {
      const normalizedSkills = this.normalizeSkills(jobData.preferredSkills);
      if (JSON.stringify(normalizedSkills) !== JSON.stringify(jobData.preferredSkills)) {
        changes.push({
          field: 'preferredSkills',
          original: jobData.preferredSkills,
          normalized: normalizedSkills,
        });
        normalized.preferredSkills = normalizedSkills;
      }
    }

    // Normalize salary
    if (jobData.salary) {
      const normalizedSalary = this.normalizeSalary(jobData.salary);
      if (JSON.stringify(normalizedSalary) !== JSON.stringify(jobData.salary)) {
        changes.push({
          field: 'salary',
          original: jobData.salary,
          normalized: normalizedSalary,
        });
        normalized.salary = normalizedSalary;
      }
    }

    // Infer role family from title and skills
    if (!jobData.roleFamily && (jobData.title || jobData.requiredSkills)) {
      const inferredRoleFamily = this.inferRoleFamily(jobData.title, jobData.requiredSkills);
      if (inferredRoleFamily) {
        normalized.roleFamily = inferredRoleFamily;
        changes.push({
          field: 'roleFamily',
          original: null,
          normalized: inferredRoleFamily,
        });
      }
    }

    // Calculate freshness score
    if (jobData.postedAt) {
      const freshnessScore = this.calculateFreshnessScore(jobData.postedAt);
      if (freshnessScore !== jobData.freshnessScore) {
        changes.push({
          field: 'freshnessScore',
          original: jobData.freshnessScore,
          normalized: freshnessScore,
        });
        normalized.freshnessScore = freshnessScore;
      }
    }

    return {
      normalized,
      changes,
    };
  }

  /**
   * Normalize work mode from various formats
   */
  private normalizeWorkMode(workMode: string): WorkMode {
    const normalized = workMode.toLowerCase().trim();

    if (normalized.includes('remote') || normalized === 'work from home' || normalized === 'wfh') {
      return 'remote';
    }

    if (normalized.includes('hybrid') || normalized.includes('flexible')) {
      return 'hybrid';
    }

    if (
      normalized.includes('on-site') ||
      normalized.includes('onsite') ||
      normalized.includes('in-office')
    ) {
      return 'on-site';
    }

    return 'any';
  }

  /**
   * Infer seniority level from job title
   */
  private inferSeniorityFromTitle(title: string): SeniorityLevel | null {
    const normalizedTitle = title.toLowerCase();

    // Executive level
    if (
      normalizedTitle.includes('cto') ||
      normalizedTitle.includes('ceo') ||
      normalizedTitle.includes('vp ') ||
      normalizedTitle.includes('vice president') ||
      normalizedTitle.includes('director') ||
      normalizedTitle.includes('head of')
    ) {
      return 'executive';
    }

    // Lead level
    if (
      normalizedTitle.includes('lead') ||
      normalizedTitle.includes('principal') ||
      normalizedTitle.includes('staff') ||
      normalizedTitle.includes('architect')
    ) {
      return 'lead';
    }

    // Senior level
    if (
      normalizedTitle.includes('senior') ||
      normalizedTitle.includes('sr.') ||
      normalizedTitle.includes('sr ')
    ) {
      return 'senior';
    }

    // Mid level
    if (
      normalizedTitle.includes('mid') ||
      normalizedTitle.includes('ii') ||
      normalizedTitle.includes('2') ||
      normalizedTitle.includes('experienced')
    ) {
      return 'mid';
    }

    // Entry level
    if (
      normalizedTitle.includes('junior') ||
      normalizedTitle.includes('jr.') ||
      normalizedTitle.includes('jr ') ||
      normalizedTitle.includes('entry') ||
      normalizedTitle.includes('intern') ||
      normalizedTitle.includes('associate')
    ) {
      return 'entry';
    }

    return null;
  }

  /**
   * Normalize location data
   */
  private normalizeLocation(location: Job['location']): Job['location'] {
    const normalized = { ...location };

    // Normalize country names
    if (normalized.country) {
      normalized.country = this.normalizeCountryName(normalized.country);
    }

    // Normalize state/province
    if (normalized.state) {
      normalized.state = this.normalizeStateName(normalized.state);
    }

    // Normalize city
    if (normalized.city) {
      normalized.city = this.normalizeCityName(normalized.city);
    }

    // Set remote flag based on location
    if (
      normalized.city?.toLowerCase() === 'remote' ||
      normalized.city?.toLowerCase() === 'anywhere' ||
      normalized.city?.toLowerCase() === 'worldwide'
    ) {
      normalized.remote = true;
      normalized.city = undefined;
      normalized.state = undefined;
    }

    return normalized;
  }

  /**
   * Normalize country name
   */
  private normalizeCountryName(country: string): string {
    const countryMap: Record<string, string> = {
      us: 'United States',
      usa: 'United States',
      'u.s.': 'United States',
      'u.s.a.': 'United States',
      'united states of america': 'United States',
      uk: 'United Kingdom',
      'u.k.': 'United Kingdom',
      'great britain': 'United Kingdom',
      england: 'United Kingdom',
    };

    const normalized = country.toLowerCase().trim();
    return countryMap[normalized] || country;
  }

  /**
   * Normalize state/province name
   */
  private normalizeStateName(state: string): string {
    // Common state abbreviations
    const stateMap: Record<string, string> = {
      ca: 'California',
      ny: 'New York',
      tx: 'Texas',
      fl: 'Florida',
      wa: 'Washington',
      ma: 'Massachusetts',
      il: 'Illinois',
      pa: 'Pennsylvania',
      oh: 'Ohio',
      ga: 'Georgia',
    };

    const normalized = state.toLowerCase().trim();
    return stateMap[normalized] || state;
  }

  /**
   * Normalize city name
   */
  private normalizeCityName(city: string): string {
    // Remove common suffixes and normalize
    return city.replace(/\s+(city|town|village)$/i, '').trim();
  }

  /**
   * Normalize skills list
   */
  private normalizeSkills(skills: string[]): string[] {
    return skills
      .map((skill) => skill.trim().toLowerCase())
      .filter((skill) => skill.length > 0)
      .reduce((acc: string[], skill) => {
        // Remove duplicates (case-insensitive)
        if (!acc.some((s) => s.toLowerCase() === skill)) {
          acc.push(skill);
        }
        return acc;
      }, []);
  }

  /**
   * Normalize salary data
   */
  private normalizeSalary(salary: Job['salary']): Job['salary'] {
    if (!salary) return salary;

    const normalized = { ...salary };

    // Normalize currency
    if (normalized.currency) {
      normalized.currency = normalized.currency.toUpperCase();
    }

    // Ensure min < max
    if (normalized.min && normalized.max && normalized.min > normalized.max) {
      [normalized.min, normalized.max] = [normalized.max, normalized.min];
    }

    return normalized;
  }

  /**
   * Infer role family from title and skills
   */
  private inferRoleFamily(title?: string, skills?: string[]): string | null {
    const normalizedTitle = title?.toLowerCase() || '';
    const normalizedSkills = skills?.map((s) => s.toLowerCase()) || [];

    // Engineering
    if (
      normalizedTitle.includes('engineer') ||
      normalizedTitle.includes('developer') ||
      normalizedTitle.includes('programmer') ||
      normalizedSkills.some(
        (s) =>
          s.includes('javascript') ||
          s.includes('python') ||
          s.includes('java') ||
          s.includes('react') ||
          s.includes('node')
      )
    ) {
      return 'Engineering';
    }

    // Design
    if (
      normalizedTitle.includes('designer') ||
      normalizedTitle.includes('ux') ||
      normalizedTitle.includes('ui') ||
      normalizedSkills.some(
        (s) => s.includes('figma') || s.includes('sketch') || s.includes('adobe')
      )
    ) {
      return 'Design';
    }

    // Product
    if (
      normalizedTitle.includes('product manager') ||
      normalizedTitle.includes('product owner') ||
      normalizedTitle.includes('po ')
    ) {
      return 'Product';
    }

    // Marketing
    if (
      normalizedTitle.includes('marketing') ||
      normalizedTitle.includes('seo') ||
      normalizedTitle.includes('content') ||
      normalizedTitle.includes('growth')
    ) {
      return 'Marketing';
    }

    // Sales
    if (
      normalizedTitle.includes('sales') ||
      normalizedTitle.includes('account executive') ||
      normalizedTitle.includes('business development')
    ) {
      return 'Sales';
    }

    // Data
    if (
      normalizedTitle.includes('data scientist') ||
      normalizedTitle.includes('data analyst') ||
      normalizedTitle.includes('data engineer') ||
      normalizedTitle.includes('ml engineer') ||
      normalizedTitle.includes('machine learning')
    ) {
      return 'Data';
    }

    // Operations
    if (
      normalizedTitle.includes('operations') ||
      normalizedTitle.includes('ops') ||
      normalizedTitle.includes('logistics')
    ) {
      return 'Operations';
    }

    // HR
    if (
      normalizedTitle.includes('hr') ||
      normalizedTitle.includes('human resources') ||
      normalizedTitle.includes('recruiter') ||
      normalizedTitle.includes('talent')
    ) {
      return 'Human Resources';
    }

    // Finance
    if (
      normalizedTitle.includes('finance') ||
      normalizedTitle.includes('accounting') ||
      normalizedTitle.includes('controller') ||
      normalizedTitle.includes('cfo')
    ) {
      return 'Finance';
    }

    return null;
  }

  /**
   * Calculate freshness score based on posted date
   */
  private calculateFreshnessScore(postedAt: string): number {
    const posted = new Date(postedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

    // Freshness decays over time
    // 0-7 days: 1.0 (fresh)
    // 7-30 days: 0.8-1.0
    // 30-60 days: 0.5-0.8
    // 60-90 days: 0.2-0.5
    // 90+ days: 0.0-0.2

    if (daysDiff <= 7) {
      return 1.0;
    } else if (daysDiff <= 30) {
      return 1.0 - (daysDiff - 7) * 0.01;
    } else if (daysDiff <= 60) {
      return 0.8 - (daysDiff - 30) * 0.01;
    } else if (daysDiff <= 90) {
      return 0.5 - (daysDiff - 60) * 0.01;
    } else {
      return Math.max(0, 0.2 - (daysDiff - 90) * 0.002);
    }
  }
}

// Export singleton instance
export const jobNormalizationService = new JobNormalizationService();
