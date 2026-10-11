import { v4 as uuidv4 } from 'uuid';
import {
  EligibilityRule,
  EligibilityRuleSchema,
  EligibilityAssessment,
  EligibilityAssessmentSchema,
  EligibilityCheck,
  EligibilityStatus,
  CheckEligibilityRequest,
  CheckEligibilityResponse,
  CreateRuleRequest,
  UpdateRuleRequest,
  ListRulesRequest,
  ListRulesResponse,
  RuleNotFoundError,
  InvalidRuleError,
} from './types.js';

// ============================================================================
// Eligibility Engine Service
// ============================================================================

/**
 * Service for checking job eligibility based on user profile and rules
 */
export class EligibilityEngineService {
  // In-memory storage (replace with database in production)
  private rulesStore: Map<string, EligibilityRule> = new Map();
  private assessmentsStore: Map<string, EligibilityAssessment> = new Map();

  /**
   * Create a new eligibility rule
   */
  async createRule(request: CreateRuleRequest): Promise<EligibilityRule> {
    const now = new Date().toISOString();
    const ruleId = uuidv4();

    const rule: EligibilityRule = {
      id: ruleId,
      tenantId: request.tenantId,
      name: request.name,
      description: request.description,
      checkType: request.checkType,
      required: request.required ?? true,
      condition: request.condition,
      priority: request.priority ?? 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: request.userId,
      updatedBy: request.userId,
      deleted: false,
    };

    // Validate rule
    const validatedRule = EligibilityRuleSchema.parse(rule);

    // Store rule
    this.rulesStore.set(ruleId, validatedRule);

    return validatedRule;
  }

  /**
   * Get rule by ID
   */
  async getRule(ruleId: string, tenantId: string): Promise<EligibilityRule> {
    const rule = this.rulesStore.get(ruleId);

    if (!rule || rule.deleted || rule.tenantId !== tenantId) {
      throw new RuleNotFoundError(ruleId);
    }

    return rule;
  }

  /**
   * Update rule
   */
  async updateRule(
    ruleId: string,
    tenantId: string,
    request: UpdateRuleRequest,
    userId: string
  ): Promise<EligibilityRule> {
    const rule = await this.getRule(ruleId, tenantId);

    const now = new Date().toISOString();
    const updatedRule: EligibilityRule = {
      ...rule,
      name: request.name ?? rule.name,
      description: request.description ?? rule.description,
      required: request.required ?? rule.required,
      condition: request.condition ?? rule.condition,
      priority: request.priority ?? rule.priority,
      version: rule.version + 1,
      updatedAt: now,
      updatedBy: userId,
    };

    // Validate updated rule
    const validatedRule = EligibilityRuleSchema.parse(updatedRule);

    // Store updated rule
    this.rulesStore.set(ruleId, validatedRule);

    return validatedRule;
  }

  /**
   * Delete rule (soft delete)
   */
  async deleteRule(ruleId: string, tenantId: string, userId: string): Promise<void> {
    const rule = await this.getRule(ruleId, tenantId);

    const now = new Date().toISOString();
    const deletedRule: EligibilityRule = {
      ...rule,
      deleted: true,
      deletedAt: now,
      updatedAt: now,
      updatedBy: userId,
    };

    this.rulesStore.set(ruleId, deletedRule);
  }

  /**
   * List rules with filters
   */
  async listRules(request: ListRulesRequest): Promise<ListRulesResponse> {
    const { tenantId, checkType, required, page = 1, pageSize = 20 } = request;

    let rules = Array.from(this.rulesStore.values()).filter(
      rule => rule.tenantId === tenantId && !rule.deleted
    );

    // Apply filters
    if (checkType) {
      rules = rules.filter(rule => rule.checkType === checkType);
    }

    if (required !== undefined) {
      rules = rules.filter(rule => rule.required === required);
    }

    // Sort by priority (descending) then by name
    rules.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.name.localeCompare(b.name);
    });

    // Paginate
    const total = rules.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRules = rules.slice(startIndex, endIndex);

    return {
      rules: paginatedRules,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  /**
   * Check eligibility for a job
   */
  async checkEligibility(
    request: CheckEligibilityRequest,
    userProfile: any,
    job: any
  ): Promise<CheckEligibilityResponse> {
    const { userId, tenantId, jobId } = request;

    // Get all rules for tenant
    const { rules } = await this.listRules({
      tenantId,
      page: 1,
      pageSize: 1000,
    });

    // Run all checks
    const checks: EligibilityCheck[] = [];
    const missingRequirements: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const check = await this.runCheck(rule, userProfile, job);
      checks.push(check);

      if (check.status === 'ineligible' && check.required) {
        missingRequirements.push(check.reason || `${rule.checkType} requirement not met`);
      }

      if (check.status === 'unknown' && check.required) {
        warnings.push(`Unable to verify ${rule.checkType}`);
      }
    }

    // Calculate overall status
    const status = this.calculateOverallStatus(checks);
    const confidence = this.calculateConfidence(checks);

    // Create assessment
    const now = new Date().toISOString();
    const assessmentId = uuidv4();

    const assessment: EligibilityAssessment = {
      id: assessmentId,
      userId,
      tenantId,
      jobId,
      status,
      confidence,
      checks,
      missingRequirements: missingRequirements.length > 0 ? missingRequirements : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      assessedAt: now,
      ruleVersion: rules.length > 0 ? Math.max(...rules.map(r => r.version)) : 1,
      deleted: false,
    };

    // Validate and store assessment
    const validatedAssessment = EligibilityAssessmentSchema.parse(assessment);
    this.assessmentsStore.set(assessmentId, validatedAssessment);

    // Calculate summary
    const summary = {
      total: checks.length,
      passed: checks.filter(c => c.status === 'eligible').length,
      failed: checks.filter(c => c.status === 'ineligible').length,
      unknown: checks.filter(c => c.status === 'unknown').length,
    };

    return {
      assessment: validatedAssessment,
      eligible: status === 'eligible',
      unknown: status === 'unknown',
      summary,
    };
  }

  /**
   * Get assessment by ID
   */
  async getAssessment(assessmentId: string, tenantId: string): Promise<EligibilityAssessment> {
    const assessment = this.assessmentsStore.get(assessmentId);

    if (!assessment || assessment.deleted || assessment.tenantId !== tenantId) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    return assessment;
  }

  /**
   * List assessments for a user
   */
  async listAssessments(
    userId: string,
    tenantId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    assessments: EligibilityAssessment[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    let assessments = Array.from(this.assessmentsStore.values()).filter(
      assessment =>
        assessment.userId === userId &&
        assessment.tenantId === tenantId &&
        !assessment.deleted
    );

    // Sort by assessedAt (newest first)
    assessments.sort((a, b) => 
      new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
    );

    // Paginate
    const total = assessments.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssessments = assessments.slice(startIndex, endIndex);

    return {
      assessments: paginatedAssessments,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Run a single eligibility check
   */
  private async runCheck(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): Promise<EligibilityCheck> {
    switch (rule.checkType) {
      case 'location':
        return this.checkLocation(rule, userProfile, job);
      case 'work_authorization':
        return this.checkWorkAuthorization(rule, userProfile, job);
      case 'sponsorship':
        return this.checkSponsorship(rule, userProfile, job);
      case 'license':
        return this.checkLicense(rule, userProfile, job);
      case 'certification':
        return this.checkCertification(rule, userProfile, job);
      case 'education':
        return this.checkEducation(rule, userProfile, job);
      case 'experience':
        return this.checkExperience(rule, userProfile, job);
      case 'skill':
        return this.checkSkill(rule, userProfile, job);
      case 'language':
        return this.checkLanguage(rule, userProfile, job);
      case 'clearance':
        return this.checkClearance(rule, userProfile, job);
      default:
        return {
          type: rule.checkType,
          status: 'unknown',
          required: rule.required,
          reason: `Unknown check type: ${rule.checkType}`,
        };
    }
  }

  /**
   * Check location eligibility
   */
  private checkLocation(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userLocation = userProfile.location;
    const jobLocation = job.location;

    if (!userLocation || !jobLocation) {
      return {
        type: 'location',
        status: 'unknown',
        required: rule.required,
        reason: 'Location information missing',
      };
    }

    // Check if job is remote
    if (jobLocation.remote && condition.allowRemote !== false) {
      return {
        type: 'location',
        status: 'eligible',
        required: rule.required,
        reason: 'Remote position',
      };
    }

    // Check country match
    if (condition.countries && !condition.countries.includes(userLocation.country)) {
      return {
        type: 'location',
        status: 'ineligible',
        required: rule.required,
        reason: `User location (${userLocation.country}) not in allowed countries`,
        details: { allowed: condition.countries },
      };
    }

    // Check if relocation is allowed
    if (condition.requireRelocation && !userProfile.willingToRelocate) {
      return {
        type: 'location',
        status: 'ineligible',
        required: rule.required,
        reason: 'Job requires relocation but user is not willing',
      };
    }

    return {
      type: 'location',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check work authorization eligibility
   */
  private checkWorkAuthorization(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userAuth = userProfile.workAuthorization;

    if (!userAuth) {
      return {
        type: 'work_authorization',
        status: 'unknown',
        required: rule.required,
        reason: 'Work authorization information missing',
      };
    }

    // Check if user has required authorization
    if (condition.requiredAuthorizations) {
      const hasAuth = condition.requiredAuthorizations.some(
        (auth: string) => userAuth.authorizations?.includes(auth)
      );

      if (!hasAuth) {
        return {
          type: 'work_authorization',
          status: 'ineligible',
          required: rule.required,
          reason: 'User does not have required work authorization',
          details: { required: condition.requiredAuthorizations },
        };
      }
    }

    return {
      type: 'work_authorization',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check sponsorship eligibility
   */
  private checkSponsorship(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userNeedsSponsorship = userProfile.needsSponsorship;
    const jobOffersSponsorship = job.visaSponsorship;

    if (userNeedsSponsorship && !jobOffersSponsorship) {
      return {
        type: 'sponsorship',
        status: 'ineligible',
        required: rule.required,
        reason: 'User needs sponsorship but job does not offer it',
      };
    }

    if (condition.requireNoSponsorship && userNeedsSponsorship) {
      return {
        type: 'sponsorship',
        status: 'ineligible',
        required: rule.required,
        reason: 'Job requires no sponsorship needed',
      };
    }

    return {
      type: 'sponsorship',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check license eligibility
   */
  private checkLicense(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userLicenses = userProfile.licenses || [];

    if (condition.requiredLicenses) {
      const hasAllLicenses = condition.requiredLicenses.every(
        (required: string) => 
          userLicenses.some((user: any) => user.name === required && user.valid)
      );

      if (!hasAllLicenses) {
        return {
          type: 'license',
          status: 'ineligible',
          required: rule.required,
          reason: 'User does not have required licenses',
          details: { required: condition.requiredLicenses },
        };
      }
    }

    return {
      type: 'license',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check certification eligibility
   */
  private checkCertification(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userCerts = userProfile.certifications || [];

    if (condition.requiredCertifications) {
      const hasAllCerts = condition.requiredCertifications.every(
        (required: string) => 
          userCerts.some((user: any) => user.name === required)
      );

      if (!hasAllCerts) {
        return {
          type: 'certification',
          status: 'ineligible',
          required: rule.required,
          reason: 'User does not have required certifications',
          details: { required: condition.requiredCertifications },
        };
      }
    }

    return {
      type: 'certification',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check education eligibility
   */
  private checkEducation(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userEducation = userProfile.education || [];

    if (condition.minimumDegree) {
      const degreeLevels = ['high_school', 'associate', 'bachelor', 'master', 'doctorate'];
      const requiredLevel = degreeLevels.indexOf(condition.minimumDegree);
      
      const hasRequiredEducation = userEducation.some((edu: any) => {
        const userLevel = degreeLevels.indexOf(edu.degree?.toLowerCase());
        return userLevel >= requiredLevel;
      });

      if (!hasRequiredEducation) {
        return {
          type: 'education',
          status: 'ineligible',
          required: rule.required,
          reason: `User does not have minimum required education (${condition.minimumDegree})`,
        };
      }
    }

    if (condition.requiredFields) {
      const hasRequiredField = userEducation.some((edu: any) =>
        condition.requiredFields.some((field: string) =>
          edu.field?.toLowerCase().includes(field.toLowerCase())
        )
      );

      if (!hasRequiredField) {
        return {
          type: 'education',
          status: 'ineligible',
          required: rule.required,
          reason: 'User does not have required field of study',
          details: { required: condition.requiredFields },
        };
      }
    }

    return {
      type: 'education',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check experience eligibility
   */
  private checkExperience(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userExperience = userProfile.experience || [];

    if (condition.minimumYears) {
      const totalYears = userExperience.reduce((total: number, exp: any) => {
        if (!exp.startDate) return total;
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      }, 0);

      if (totalYears < condition.minimumYears) {
        return {
          type: 'experience',
          status: 'ineligible',
          required: rule.required,
          reason: `User has ${totalYears.toFixed(1)} years of experience, but ${condition.minimumYears} required`,
        };
      }
    }

    return {
      type: 'experience',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check skill eligibility
   */
  private checkSkill(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userSkills = (userProfile.skills || []).map((s: any) => s.name?.toLowerCase());

    if (condition.requiredSkills) {
      const missingSkills = condition.requiredSkills.filter(
        (required: string) => !userSkills.includes(required.toLowerCase())
      );

      if (missingSkills.length > 0) {
        return {
          type: 'skill',
          status: 'ineligible',
          required: rule.required,
          reason: 'User does not have required skills',
          details: { missing: missingSkills },
        };
      }
    }

    return {
      type: 'skill',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check language eligibility
   */
  private checkLanguage(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userLanguages = userProfile.languages || [];

    if (condition.requiredLanguages) {
      const hasAllLanguages = condition.requiredLanguages.every(
        (required: any) => 
          userLanguages.some((user: any) => {
            if (user.language.toLowerCase() !== required.language.toLowerCase()) {
              return false;
            }
            
            const proficiencyLevels = ['basic', 'intermediate', 'professional', 'fluent', 'native'];
            const requiredLevel = proficiencyLevels.indexOf(required.proficiency?.toLowerCase() || 'intermediate');
            const userLevel = proficiencyLevels.indexOf(user.proficiency?.toLowerCase() || 'basic');
            
            return userLevel >= requiredLevel;
          })
      );

      if (!hasAllLanguages) {
        return {
          type: 'language',
          status: 'ineligible',
          required: rule.required,
          reason: 'User does not have required language proficiency',
          details: { required: condition.requiredLanguages },
        };
      }
    }

    return {
      type: 'language',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Check security clearance eligibility
   */
  private checkClearance(
    rule: EligibilityRule,
    userProfile: any,
    job: any
  ): EligibilityCheck {
    const condition = rule.condition;
    const userClearance = userProfile.securityClearance;

    if (condition.requiredClearance) {
      const clearanceLevels = ['none', 'confidential', 'secret', 'top_secret', 'ts_sci'];
      const requiredLevel = clearanceLevels.indexOf(condition.requiredClearance.toLowerCase());
      const userLevel = clearanceLevels.indexOf(userClearance?.toLowerCase() || 'none');

      if (userLevel < requiredLevel) {
        return {
          type: 'clearance',
          status: 'ineligible',
          required: rule.required,
          reason: `User has ${userClearance || 'no'} clearance, but ${condition.requiredClearance} required`,
        };
      }
    }

    return {
      type: 'clearance',
      status: 'eligible',
      required: rule.required,
    };
  }

  /**
   * Calculate overall eligibility status
   */
  private calculateOverallStatus(checks: EligibilityCheck[]): EligibilityStatus {
    const hasIneligible = checks.some(c => c.status === 'ineligible' && c.required);
    const hasUnknown = checks.some(c => c.status === 'unknown' && c.required);

    if (hasIneligible) {
      return 'ineligible';
    }

    if (hasUnknown) {
      return 'unknown';
    }

    return 'eligible';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(checks: EligibilityCheck[]): number {
    if (checks.length === 0) {
      return 0;
    }

    const eligibleChecks = checks.filter(c => c.status === 'eligible').length;
    const unknownChecks = checks.filter(c => c.status === 'unknown').length;

    // Confidence is based on percentage of eligible checks
    // Unknown checks reduce confidence
    const baseConfidence = eligibleChecks / checks.length;
    const unknownPenalty = (unknownChecks / checks.length) * 0.5;

    return Math.max(0, baseConfidence - unknownPenalty);
  }
}

// Export singleton instance
export const eligibilityEngineService = new EligibilityEngineService();
