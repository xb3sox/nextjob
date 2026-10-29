import { v4 as uuidv4 } from 'uuid';
import {
  type CalculateMatchRequest,
  type CalculateMatchResponse,
  DEFAULT_MATCHING_CONFIG,
  type JobMatch,
  type MatchFactor,
  type MatchingConfig,
  type MatchStatus,
  type RankJobsRequest,
  type RankJobsResponse,
} from './types.js';

/**
 * Fast O(1) lookup maps for degree and seniority levels to avoid repeated array instantiations
 * and linear indexOf searches on every evaluation.
 */
const DEGREE_LEVEL_MAP: Record<string, number> = {
  high_school: 0,
  associate: 1,
  bachelor: 2,
  master: 3,
  doctorate: 4,
};

const SENIORITY_LEVEL_MAP: Record<string, number> = {
  entry: 0,
  mid: 1,
  senior: 2,
  lead: 3,
  executive: 4,
};

// ============================================================================
// Matching Engine Service
// ============================================================================

/**
 * Service for calculating job matches based on user profile and job requirements
 */
export class MatchingEngineService {
  private config: MatchingConfig;
  private matchesStore: Map<string, JobMatch> = new Map();

  constructor(config: Partial<MatchingConfig> = {}) {
    this.config = { ...DEFAULT_MATCHING_CONFIG, ...config };
  }

  /**
   * Calculate match score between user profile and job
   */
  async calculateMatch(request: CalculateMatchRequest): Promise<CalculateMatchResponse> {
    const { userId, tenantId, jobId, eligibilityId, userProfile, job } = request;

    // Calculate individual factors
    const factors: MatchFactor[] = [];

    // 1. Skills match (30% weight)
    const skillsFactor = this.calculateSkillsMatch(
      userProfile.skills,
      job.requiredSkills,
      job.preferredSkills
    );
    factors.push(skillsFactor);

    // 2. Experience match (25% weight)
    const experienceFactor = this.calculateExperienceMatch(userProfile.experience, job.experience);
    factors.push(experienceFactor);

    // 3. Education match (15% weight)
    const educationFactor = this.calculateEducationMatch(userProfile.education, job.education);
    factors.push(educationFactor);

    // 4. Location match (10% weight)
    const locationFactor = this.calculateLocationMatch(userProfile.location, job.location);
    factors.push(locationFactor);

    // 5. Salary match (10% weight)
    const salaryFactor = this.calculateSalaryMatch(
      userProfile.preferences?.salaryExpectations,
      job.salary
    );
    factors.push(salaryFactor);

    // 6. Role fit (5% weight)
    const roleFitFactor = this.calculateRoleFitMatch(
      userProfile.preferences?.targetRoles,
      job.title,
      job.roleFamily
    );
    factors.push(roleFitFactor);

    // 7. Seniority fit (5% weight)
    const seniorityFitFactor = this.calculateSeniorityMatch(
      userProfile.experience,
      job.seniorityLevel
    );
    factors.push(seniorityFitFactor);

    // Calculate overall score
    const score = this.calculateOverallScore(factors);
    const status = this.determineMatchStatus(score);

    // Generate strengths and weaknesses
    const strengths = this.generateStrengths(factors);
    const weaknesses = this.generateWeaknesses(factors);
    const recommendations = this.generateRecommendations(factors, weaknesses);

    // Calculate confidence
    const confidence = this.calculateConfidence(factors);

    // Create match object
    const match: JobMatch = {
      id: uuidv4(),
      userId,
      tenantId,
      jobId,
      eligibilityId,
      score,
      status,
      factors,
      strengths,
      weaknesses,
      recommendations,
      confidence,
      matchedAt: new Date().toISOString(),
      version: 1,
    };

    // Store match
    this.matchesStore.set(match.id, match);

    // Generate explanation
    const explanation = this.generateExplanation(match);

    return {
      match,
      eligible: true, // Assuming eligibility was already checked
      explanation,
    };
  }

  /**
   * Rank multiple jobs for a user
   * Optimized: calculates job matches concurrently using Promise.all to avoid sequential blocking loops.
   */
  async rankJobs(request: RankJobsRequest): Promise<RankJobsResponse> {
    const { userId, tenantId, userProfile, jobs } = request;

    const matches = await Promise.all(
      jobs.map(async (job) => {
        const matchRequest: CalculateMatchRequest = {
          userId,
          tenantId,
          jobId: job.id,
          eligibilityId: 'temp', // Will be replaced with actual eligibility check
          userProfile,
          job,
        };

        const result = await this.calculateMatch(matchRequest);

        return {
          jobId: job.id,
          score: result.match.score,
          status: result.match.status,
          strengths: result.match.strengths,
          weaknesses: result.match.weaknesses,
        };
      })
    );

    // Sort by score (descending)
    matches.sort((a, b) => b.score - a.score);

    return {
      matches,
      total: matches.length,
    };
  }

  /**
   * Get match by ID
   */
  async getMatch(matchId: string): Promise<JobMatch> {
    const match = this.matchesStore.get(matchId);
    if (!match) {
      throw new Error(`Match not found: ${matchId}`);
    }
    return match;
  }

  /**
   * List matches for a user
   */
  async listMatches(userId: string, tenantId: string): Promise<JobMatch[]> {
    return Array.from(this.matchesStore.values())
      .filter((match) => match.userId === userId && match.tenantId === tenantId)
      .sort((a, b) => b.score - a.score);
  }

  // ============================================================================
  // Factor Calculation Methods
  // ============================================================================

  /**
   * Calculate skills match factor
   * Optimized with Set lookup to achieve O(U + R + P) time complexity instead of O(U * (R + P))
   * and avoid intermediate array allocations during filtering.
   */
  private calculateSkillsMatch(
    userSkills: Array<{ name: string; level?: string }>,
    requiredSkills: string[],
    preferredSkills?: string[]
  ): MatchFactor {
    const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));

    // Calculate required skills match
    let matchedRequired = 0;
    for (const skill of requiredSkills) {
      if (userSkillNames.has(skill.toLowerCase())) {
        matchedRequired++;
      }
    }
    const requiredScore =
      requiredSkills.length > 0 ? (matchedRequired / requiredSkills.length) * 100 : 100;

    // Calculate preferred skills match (bonus)
    let matchedPreferred = 0;
    const preferredList = preferredSkills || [];
    for (const skill of preferredList) {
      if (userSkillNames.has(skill.toLowerCase())) {
        matchedPreferred++;
      }
    }
    const preferredBonus =
      preferredList.length > 0
        ? (matchedPreferred / preferredList.length) * 20 // 20% bonus
        : 0;

    const score = Math.min(100, requiredScore + preferredBonus);

    const explanation =
      `Matched ${matchedRequired}/${requiredSkills.length} required skills` +
      (preferredList.length > 0
        ? ` and ${matchedPreferred}/${preferredList.length} preferred skills`
        : '');

    return {
      name: 'skills',
      score,
      weight: this.config.weights.skills,
      explanation,
    };
  }

  /**
   * Calculate experience match factor
   */
  private calculateExperienceMatch(
    userExperience: Array<{ title: string; years?: number }>,
    jobExperience?: { min?: number; max?: number }
  ): MatchFactor {
    if (!jobExperience || (!jobExperience.min && !jobExperience.max)) {
      return {
        name: 'experience',
        score: 100,
        weight: this.config.weights.experience,
        explanation: 'No experience requirements specified',
      };
    }

    // Calculate total years of experience
    const totalYears = userExperience.reduce((sum, exp) => sum + (exp.years || 0), 0);

    let score = 100;
    let explanation = '';

    if (jobExperience.min && totalYears < jobExperience.min) {
      score = (totalYears / jobExperience.min) * 100;
      explanation = `User has ${totalYears} years, but ${jobExperience.min} minimum required`;
    } else if (jobExperience.max && totalYears > jobExperience.max) {
      score = 100 - ((totalYears - jobExperience.max) / jobExperience.max) * 20;
      score = Math.max(0, score);
      explanation = `User has ${totalYears} years, which exceeds maximum of ${jobExperience.max}`;
    } else {
      explanation = `User has ${totalYears} years, within required range`;
    }

    return {
      name: 'experience',
      score: Math.min(100, score),
      weight: this.config.weights.experience,
      explanation,
    };
  }

  /**
   * Calculate education match factor
   */
  private calculateEducationMatch(
    userEducation: Array<{ degree: string; field?: string }>,
    jobEducation?: { minimumDegree?: string; requiredFields?: string[] }
  ): MatchFactor {
    if (!jobEducation || (!jobEducation.minimumDegree && !jobEducation.requiredFields)) {
      return {
        name: 'education',
        score: 100,
        weight: this.config.weights.education,
        explanation: 'No education requirements specified',
      };
    }

    let score = 100;
    const explanations: string[] = [];

    // Check degree level (using O(1) map lookup)
    if (jobEducation.minimumDegree) {
      const requiredLevel = DEGREE_LEVEL_MAP[jobEducation.minimumDegree.toLowerCase()] ?? -1;

      const hasRequiredDegree = userEducation.some((edu) => {
        const userLevel = DEGREE_LEVEL_MAP[edu.degree.toLowerCase()] ?? -1;
        return userLevel >= requiredLevel && userLevel !== -1;
      });

      if (!hasRequiredDegree) {
        score = 0;
        explanations.push(
          `User does not have minimum required degree (${jobEducation.minimumDegree})`
        );
      } else {
        explanations.push(`User meets minimum degree requirement`);
      }
    }

    // Check field of study
    if (jobEducation.requiredFields && jobEducation.requiredFields.length > 0) {
      const hasRequiredField = userEducation.some((edu) =>
        jobEducation.requiredFields!.some((field) =>
          edu.field?.toLowerCase().includes(field.toLowerCase())
        )
      );

      if (!hasRequiredField) {
        score *= 0.5; // Reduce score by 50%
        explanations.push(`User does not have required field of study`);
      } else {
        explanations.push(`User has required field of study`);
      }
    }

    return {
      name: 'education',
      score,
      weight: this.config.weights.education,
      explanation: explanations.join('; '),
    };
  }

  /**
   * Calculate location match factor
   */
  private calculateLocationMatch(
    userLocation?: { country: string; city?: string },
    jobLocation?: { country: string; city?: string; remote?: boolean }
  ): MatchFactor {
    if (!userLocation || !jobLocation) {
      return {
        name: 'location',
        score: 100,
        weight: this.config.weights.location,
        explanation: 'Location information not available',
      };
    }

    // Remote job - perfect match
    if (jobLocation.remote) {
      return {
        name: 'location',
        score: 100,
        weight: this.config.weights.location,
        explanation: 'Remote position - location not a constraint',
      };
    }

    // Same country
    if (userLocation.country.toLowerCase() === jobLocation.country.toLowerCase()) {
      // Same city - perfect match
      if (
        userLocation.city &&
        jobLocation.city &&
        userLocation.city.toLowerCase() === jobLocation.city.toLowerCase()
      ) {
        return {
          name: 'location',
          score: 100,
          weight: this.config.weights.location,
          explanation: 'Perfect location match (same city)',
        };
      }

      // Same country, different city
      return {
        name: 'location',
        score: 80,
        weight: this.config.weights.location,
        explanation: 'Same country, different city',
      };
    }

    // Different country
    return {
      name: 'location',
      score: 20,
      weight: this.config.weights.location,
      explanation: 'Different country',
    };
  }

  /**
   * Calculate salary match factor
   */
  private calculateSalaryMatch(
    userSalary?: { min?: number; max?: number },
    jobSalary?: { min?: number; max?: number }
  ): MatchFactor {
    if (!userSalary || !jobSalary) {
      return {
        name: 'salary',
        score: 100,
        weight: this.config.weights.salary,
        explanation: 'Salary information not available',
      };
    }

    const userMin = userSalary.min || 0;
    const userMax = userSalary.max || Infinity;
    const jobMin = jobSalary.min || 0;
    const jobMax = jobSalary.max || Infinity;

    // Check for overlap
    if (userMax < jobMin || jobMax < userMin) {
      return {
        name: 'salary',
        score: 0,
        weight: this.config.weights.salary,
        explanation: 'No overlap between user expectations and job salary',
      };
    }

    // Calculate overlap percentage
    const overlapMin = Math.max(userMin, jobMin);
    const overlapMax = Math.min(userMax, jobMax);
    const overlapRange = Math.max(0, overlapMax - overlapMin);
    const userRange = userMax - userMin;
    const jobRange = jobMax - jobMin;
    const relevantRange = Math.min(userRange, jobRange) || userRange || jobRange;

    const score = relevantRange > 0 ? (overlapRange / relevantRange) * 100 : 100;

    return {
      name: 'salary',
      score: Math.min(100, score),
      weight: this.config.weights.salary,
      explanation: `Salary ranges overlap by ${Math.round(score)}%`,
    };
  }

  /**
   * Calculate role fit factor
   */
  private calculateRoleFitMatch(
    targetRoles?: string[],
    jobTitle?: string,
    jobRoleFamily?: string
  ): MatchFactor {
    if (!targetRoles || targetRoles.length === 0 || !jobTitle) {
      return {
        name: 'roleFit',
        score: 100,
        weight: this.config.weights.roleFit,
        explanation: 'Role preferences not specified',
      };
    }

    const jobTitleLower = jobTitle.toLowerCase();
    const jobRoleFamilyLower = jobRoleFamily?.toLowerCase() || '';

    // Check if job title matches any target role
    const matchesTargetRole = targetRoles.some((role) => {
      const roleLower = role.toLowerCase();
      return jobTitleLower.includes(roleLower) || roleLower.includes(jobTitleLower);
    });

    if (matchesTargetRole) {
      return {
        name: 'roleFit',
        score: 100,
        weight: this.config.weights.roleFit,
        explanation: 'Job title matches target role',
      };
    }

    // Check if job role family matches
    if (jobRoleFamilyLower) {
      const matchesRoleFamily = targetRoles.some(
        (role) =>
          role.toLowerCase().includes(jobRoleFamilyLower) ||
          jobRoleFamilyLower.includes(role.toLowerCase())
      );

      if (matchesRoleFamily) {
        return {
          name: 'roleFit',
          score: 70,
          weight: this.config.weights.roleFit,
          explanation: 'Job role family matches target role',
        };
      }
    }

    return {
      name: 'roleFit',
      score: 30,
      weight: this.config.weights.roleFit,
      explanation: 'Job does not match target roles',
    };
  }

  /**
   * Calculate seniority match factor
   */
  private calculateSeniorityMatch(
    userExperience?: Array<{ title: string; years?: number }>,
    jobSeniority?: string
  ): MatchFactor {
    if (!jobSeniority || !userExperience) {
      return {
        name: 'seniorityFit',
        score: 100,
        weight: this.config.weights.seniorityFit,
        explanation: 'Seniority information not available',
      };
    }

    // Estimate user seniority from experience (using O(1) map lookup)
    const totalYears = userExperience.reduce((sum, exp) => sum + (exp.years || 0), 0);

    const userSeniority = this.estimateSeniority(totalYears);
    const requiredSeniority = jobSeniority.toLowerCase();

    const userLevel = SENIORITY_LEVEL_MAP[userSeniority] ?? -1;
    const requiredLevel = SENIORITY_LEVEL_MAP[requiredSeniority] ?? -1;

    if (userLevel === -1 || requiredLevel === -1) {
      return {
        name: 'seniorityFit',
        score: 100,
        weight: this.config.weights.seniorityFit,
        explanation: 'Unable to determine seniority match',
      };
    }

    const levelDiff = Math.abs(userLevel - requiredLevel);
    const score = Math.max(0, 100 - levelDiff * 25);

    return {
      name: 'seniorityFit',
      score,
      weight: this.config.weights.seniorityFit,
      explanation: `User seniority (${userSeniority}) ${levelDiff === 0 ? 'matches' : `differs by ${levelDiff} levels from`} required (${requiredSeniority})`,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Estimate seniority level from years of experience
   */
  private estimateSeniority(years: number): string {
    if (years < 2) return 'entry';
    if (years < 5) return 'mid';
    if (years < 10) return 'senior';
    if (years < 15) return 'lead';
    return 'executive';
  }

  /**
   * Calculate overall match score from factors
   */
  private calculateOverallScore(factors: MatchFactor[]): number {
    const weightedSum = factors.reduce((sum, factor) => {
      return sum + factor.score * factor.weight;
    }, 0);

    return Math.round(weightedSum);
  }

  /**
   * Determine match status from score
   */
  private determineMatchStatus(score: number): MatchStatus {
    if (score >= this.config.thresholds.excellent) return 'excellent';
    if (score >= this.config.thresholds.good) return 'good';
    if (score >= this.config.thresholds.weak) return 'weak';
    return 'none';
  }

  /**
   * Generate strengths list from factors
   */
  private generateStrengths(factors: MatchFactor[]): string[] {
    return factors
      .filter((f) => f.score >= 80)
      .map((f) => f.explanation)
      .slice(0, 3); // Top 3 strengths
  }

  /**
   * Generate weaknesses list from factors
   */
  private generateWeaknesses(factors: MatchFactor[]): string[] {
    return factors
      .filter((f) => f.score < 70)
      .map((f) => f.explanation)
      .slice(0, 3); // Top 3 weaknesses
  }

  /**
   * Generate recommendations based on weaknesses
   */
  private generateRecommendations(factors: MatchFactor[], weaknesses: string[]): string[] {
    const recommendations: string[] = [];

    factors.forEach((factor) => {
      if (factor.score < 70) {
        switch (factor.name) {
          case 'skills':
            recommendations.push('Consider learning missing required skills');
            break;
          case 'experience':
            recommendations.push('Highlight relevant experience in application');
            break;
          case 'education':
            recommendations.push('Emphasize transferable skills from your education');
            break;
          case 'location':
            recommendations.push('Consider remote work options or relocation');
            break;
          case 'salary':
            recommendations.push('Be flexible with salary expectations or negotiate');
            break;
        }
      }
    });

    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(factors: MatchFactor[]): number {
    // Confidence is based on how many factors have complete data
    const factorsWithData = factors.filter((f) => f.score > 0).length;
    const totalFactors = factors.length;

    return totalFactors > 0 ? factorsWithData / totalFactors : 0;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(match: JobMatch): string {
    const parts: string[] = [];

    parts.push(`Overall match score: ${match.score}/100 (${match.status})`);

    if (match.strengths.length > 0) {
      parts.push(`Strengths: ${match.strengths.join(', ')}`);
    }

    if (match.weaknesses.length > 0) {
      parts.push(`Areas for improvement: ${match.weaknesses.join(', ')}`);
    }

    return parts.join('. ');
  }
}

// Export singleton instance
export const matchingEngineService = new MatchingEngineService();
