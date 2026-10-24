import {
  type CareerClaim,
  type ConstraintViolation,
  EvidenceConstraintViolationError,
  type EvidenceTrace,
  InsufficientEvidenceError,
  InvalidTailoringRequestError,
  type JobRequirements,
  type TailoredSection,
  type TailoredSkill,
  type TailoringOptions,
  type TailoringRequest,
  TailoringRequestSchema,
  type TailoringResult,
} from './types.js';

// ============================================================================
// Constants
// ============================================================================

const MIN_CONFIDENCE_THRESHOLD = 0.8;
const DEFAULT_MAX_LENGTH = 500;

// ============================================================================
// Tailoring Engine Service
// ============================================================================

/**
 * Evidence-constrained tailoring engine
 * Generates content only from verified CareerGraph evidence
 */
export class TailoringEngine {
  /**
   * Tailor content based on career graph and job requirements
   *
   * @param request - Tailoring request with career graph and job requirements
   * @returns Tailored content with full evidence traceability
   * @throws {InvalidTailoringRequestError} If request is invalid
   * @throws {EvidenceConstraintViolationError} If evidence constraints are violated
   * @throws {InsufficientEvidenceError} If insufficient evidence for tailoring type
   */
  async tailor(request: TailoringRequest): Promise<TailoringResult> {
    // Validate request
    const validatedRequest = this.validateRequest(request);

    // Filter verified claims with sufficient confidence
    const verifiedClaims = this.filterVerifiedClaims(validatedRequest.careerGraph.claims);

    // Check if we have sufficient evidence
    this.checkSufficientEvidence(verifiedClaims, validatedRequest.type);

    // Generate content based on type
    let result: TailoringResult;
    switch (validatedRequest.type) {
      case 'resume':
        result = await this.tailorResume(
          verifiedClaims,
          validatedRequest.jobRequirements,
          validatedRequest.options
        );
        break;
      case 'cover_letter':
        result = await this.tailorCoverLetter(
          verifiedClaims,
          validatedRequest.jobRequirements,
          validatedRequest.options
        );
        break;
      case 'application_answer':
        if (!validatedRequest.question) {
          throw new InvalidTailoringRequestError({
            question: 'Question is required for application_answer type',
          });
        }
        result = await this.tailorApplicationAnswer(
          verifiedClaims,
          validatedRequest.jobRequirements,
          validatedRequest.question,
          validatedRequest.options
        );
        break;
      case 'professional_summary':
        result = await this.tailorProfessionalSummary(
          verifiedClaims,
          validatedRequest.jobRequirements,
          validatedRequest.options
        );
        break;
      case 'skills_section':
        result = await this.tailorSkillsSection(
          verifiedClaims,
          validatedRequest.jobRequirements,
          validatedRequest.options
        );
        break;
      default:
        throw new InvalidTailoringRequestError({
          type: `Unsupported tailoring type: ${validatedRequest.type}`,
        });
    }

    // Collect all unsupported claims from original career graph
    const usedClaimIds = new Set(result.evidenceTraceability.map((t) => t.claimId));
    result.unsupportedClaims = validatedRequest.careerGraph.claims
      .map((c) => c.id)
      .filter((id) => !usedClaimIds.has(id));

    // Validate evidence constraints
    this.validateEvidenceConstraints(result, verifiedClaims);

    return result;
  }

  // ============================================================================
  // Validation Methods
  // ============================================================================

  /**
   * Validate tailoring request
   */
  private validateRequest(request: TailoringRequest): TailoringRequest {
    try {
      // Zod treats `z.any()` keys as optional, so the parsed type widens
      // `content` to `content?`. The runtime shape is what CareerClaim
      // requires; the cast keeps the validated request typed as the contract.
      return TailoringRequestSchema.parse(request) as TailoringRequest;
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidTailoringRequestError(error.message);
      }
      throw new InvalidTailoringRequestError('Unknown validation error');
    }
  }

  /**
   * Filter claims to only verified ones with sufficient confidence
   */
  private filterVerifiedClaims(claims: CareerClaim[]): CareerClaim[] {
    return claims.filter(
      (claim) =>
        claim.verificationStatus === 'verified' && claim.confidence >= MIN_CONFIDENCE_THRESHOLD
    );
  }

  /**
   * Check if we have sufficient evidence for the tailoring type
   */
  private checkSufficientEvidence(claims: CareerClaim[], type: string): void {
    if (claims.length === 0) {
      throw new InsufficientEvidenceError(type);
    }

    // Check for specific evidence based on type
    switch (type) {
      case 'resume':
      case 'cover_letter':
      case 'professional_summary': {
        // Need at least one experience or education claim
        const hasExperienceOrEducation = claims.some(
          (c) => c.type === 'experience' || c.type === 'education'
        );
        if (!hasExperienceOrEducation) {
          throw new InsufficientEvidenceError(`${type} requires experience or education evidence`);
        }
        break;
      }
      case 'skills_section': {
        // Need at least one skill claim
        const hasSkill = claims.some((c) => c.type === 'skill');
        if (!hasSkill) {
          throw new InsufficientEvidenceError('skills_section requires skill evidence');
        }
        break;
      }
      case 'application_answer':
        // Already checked that claims.length > 0 above
        // No additional specific evidence required for application answers
        break;
    }
  }

  // ============================================================================
  // Tailoring Methods
  // ============================================================================

  /**
   * Tailor resume
   */
  private async tailorResume(
    claims: CareerClaim[],
    jobRequirements: JobRequirements,
    _options?: TailoringOptions
  ): Promise<TailoringResult> {
    const sections: TailoredSection[] = [];
    const evidenceTrace: EvidenceTrace[] = [];
    const unsupportedClaims: string[] = [];
    const warnings: string[] = [];

    // Process experience claims
    const experienceClaims = claims.filter((c) => c.type === 'experience');
    for (const claim of experienceClaims) {
      const section = this.generateExperienceSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['resume'],
        });
      }
    }

    // Process education claims
    const educationClaims = claims.filter((c) => c.type === 'education');
    for (const claim of educationClaims) {
      const section = this.generateEducationSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['resume'],
        });
      }
    }

    // Process skill claims
    const skillClaims = claims.filter((c) => c.type === 'skill');
    for (const claim of skillClaims) {
      const section = this.generateSkillSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['resume'],
        });
      }
    }

    // Process certification claims
    const certificationClaims = claims.filter((c) => c.type === 'certification');
    for (const claim of certificationClaims) {
      const section = this.generateCertificationSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['resume'],
        });
      }
    }

    // Process project claims
    const projectClaims = claims.filter((c) => c.type === 'project');
    for (const claim of projectClaims) {
      const section = this.generateProjectSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['resume'],
        });
      }
    }

    // Track unsupported claims
    const allClaims = claims;
    for (const claim of allClaims) {
      if (!evidenceTrace.find((t) => t.claimId === claim.id)) {
        unsupportedClaims.push(claim.id);
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(claims, evidenceTrace);

    // Generate content
    const content = sections.map((s) => s.content).join('\n\n');

    return {
      type: 'resume',
      content,
      sections,
      evidenceTraceability: evidenceTrace,
      unsupportedClaims,
      confidence,
      warnings,
    };
  }

  /**
   * Tailor cover letter
   */
  private async tailorCoverLetter(
    claims: CareerClaim[],
    jobRequirements: JobRequirements,
    _options?: TailoringOptions
  ): Promise<TailoringResult> {
    const sections: TailoredSection[] = [];
    const evidenceTrace: EvidenceTrace[] = [];
    const unsupportedClaims: string[] = [];
    const warnings: string[] = [];

    // Generate introduction
    const intro = this.generateCoverLetterIntro(jobRequirements);
    sections.push({
      type: 'introduction',
      content: intro,
      evidenceClaimIds: [],
      preserved: [],
    });

    // Process experience claims
    const experienceClaims = claims.filter((c) => c.type === 'experience');
    for (const claim of experienceClaims) {
      const section = this.generateCoverLetterExperienceSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['cover_letter'],
        });
      }
    }

    // Process skill claims
    const skillClaims = claims.filter((c) => c.type === 'skill');
    for (const claim of skillClaims) {
      const section = this.generateCoverLetterSkillSection(claim, jobRequirements);
      if (section) {
        sections.push(section);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: section.content,
          usedIn: ['cover_letter'],
        });
      }
    }

    // Generate conclusion
    const conclusion = this.generateCoverLetterConclusion(jobRequirements);
    sections.push({
      type: 'conclusion',
      content: conclusion,
      evidenceClaimIds: [],
      preserved: [],
    });

    // Track unsupported claims
    for (const claim of claims) {
      if (!evidenceTrace.find((t) => t.claimId === claim.id)) {
        unsupportedClaims.push(claim.id);
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(claims, evidenceTrace);

    // Generate content
    const content = sections.map((s) => s.content).join('\n\n');

    return {
      type: 'cover_letter',
      content,
      sections,
      evidenceTraceability: evidenceTrace,
      unsupportedClaims,
      confidence,
      warnings,
    };
  }

  /**
   * Tailor application answer
   */
  private async tailorApplicationAnswer(
    claims: CareerClaim[],
    jobRequirements: JobRequirements,
    question: string,
    _options?: TailoringOptions
  ): Promise<TailoringResult> {
    const sections: TailoredSection[] = [];
    const evidenceTrace: EvidenceTrace[] = [];
    const unsupportedClaims: string[] = [];
    const warnings: string[] = [];

    // Generate answer based on question and available evidence
    const answer = this.generateAnswer(claims, jobRequirements, question);

    if (answer) {
      sections.push({
        type: 'answer',
        content: answer.content,
        evidenceClaimIds: answer.claimIds,
        preserved: answer.preserved,
      });

      // Track evidence
      for (const claimId of answer.claimIds) {
        const claim = claims.find((c) => c.id === claimId);
        if (claim) {
          evidenceTrace.push({
            claimId: claim.id,
            claimType: claim.type,
            content: answer.content,
            usedIn: ['application_answer'],
          });
        }
      }
    }

    // Track unsupported claims
    for (const claim of claims) {
      if (!evidenceTrace.find((t) => t.claimId === claim.id)) {
        unsupportedClaims.push(claim.id);
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(claims, evidenceTrace);

    // Generate content
    const content = answer ? answer.content : '';

    return {
      type: 'application_answer',
      content,
      sections,
      evidenceTraceability: evidenceTrace,
      unsupportedClaims,
      confidence,
      warnings,
    };
  }

  /**
   * Tailor professional summary
   */
  private async tailorProfessionalSummary(
    claims: CareerClaim[],
    jobRequirements: JobRequirements,
    options?: TailoringOptions
  ): Promise<TailoringResult> {
    const sections: TailoredSection[] = [];
    const evidenceTrace: EvidenceTrace[] = [];
    const unsupportedClaims: string[] = [];
    const warnings: string[] = [];

    // Generate summary
    const summary = this.generateProfessionalSummary(claims, jobRequirements, options);

    if (summary) {
      sections.push({
        type: 'summary',
        content: summary.content,
        evidenceClaimIds: summary.claimIds,
        preserved: summary.preserved,
      });

      // Track evidence
      for (const claimId of summary.claimIds) {
        const claim = claims.find((c) => c.id === claimId);
        if (claim) {
          evidenceTrace.push({
            claimId: claim.id,
            claimType: claim.type,
            content: summary.content,
            usedIn: ['professional_summary'],
          });
        }
      }
    }

    // Track unsupported claims
    for (const claim of claims) {
      if (!evidenceTrace.find((t) => t.claimId === claim.id)) {
        unsupportedClaims.push(claim.id);
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(claims, evidenceTrace);

    // Generate content
    const content = summary ? summary.content : '';

    return {
      type: 'professional_summary',
      content,
      sections,
      evidenceTraceability: evidenceTrace,
      unsupportedClaims,
      confidence,
      warnings,
    };
  }

  /**
   * Tailor skills section
   */
  private async tailorSkillsSection(
    claims: CareerClaim[],
    jobRequirements: JobRequirements,
    _options?: TailoringOptions
  ): Promise<TailoringResult> {
    const skills: TailoredSkill[] = [];
    const evidenceTrace: EvidenceTrace[] = [];
    const unsupportedClaims: string[] = [];
    const warnings: string[] = [];

    // Process skill claims
    const skillClaims = claims.filter((c) => c.type === 'skill');
    for (const claim of skillClaims) {
      const skill = this.generateSkillEntry(claim, jobRequirements);
      if (skill) {
        skills.push(skill);
        evidenceTrace.push({
          claimId: claim.id,
          claimType: claim.type,
          content: `${skill.name} (${skill.level})`,
          usedIn: ['skills_section'],
        });
      }
    }

    // Sort skills by priority
    skills.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority ?? 'low'] ?? 2) - (priorityOrder[b.priority ?? 'low'] ?? 2);
    });

    // Track unsupported claims
    for (const claim of claims) {
      if (!evidenceTrace.find((t) => t.claimId === claim.id)) {
        unsupportedClaims.push(claim.id);
      }
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(claims, evidenceTrace);

    // Generate content
    const content = skills.map((s) => `${s.name} (${s.level})`).join(', ');

    return {
      type: 'skills_section',
      content,
      skills,
      evidenceTraceability: evidenceTrace,
      unsupportedClaims,
      confidence,
      warnings,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Generate experience section for resume
   */
  private generateExperienceSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};

    // Preserve exact company name
    const company = content.company || 'Unknown Company';
    const title = claim.title;

    // Preserve exact dates
    const startDate = content.startDate;
    const endDate = content.endDate;

    let sectionContent = `${title} at ${company}`;

    if (startDate && endDate) {
      sectionContent += ` (${startDate} to ${endDate})`;
    } else if (startDate) {
      sectionContent += ` (${startDate} - Present)`;
    }

    if (
      content.achievements &&
      Array.isArray(content.achievements) &&
      content.achievements.length > 0
    ) {
      sectionContent += `\n${content.achievements.map((a: string) => `• ${a}`).join('\n')}`;
    }

    return {
      type: 'experience',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['company', 'startDate', 'endDate', 'achievements'],
    };
  }

  /**
   * Generate education section for resume
   */
  private generateEducationSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};

    // Preserve exact institution name
    const institution = content.institution || 'Unknown Institution';
    const degree = claim.title;

    let sectionContent = `${degree} from ${institution}`;

    if (content.graduationDate) {
      sectionContent += ` (${content.graduationDate})`;
    }

    if (content.field) {
      sectionContent += ` in ${content.field}`;
    }

    return {
      type: 'education',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['institution', 'degree', 'graduationDate', 'field'],
    };
  }

  /**
   * Generate skill section for resume
   */
  private generateSkillSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};
    const skillName = claim.title;
    const level = content.level || 'unknown';

    let sectionContent = skillName;
    if (content.yearsOfExperience) {
      sectionContent += ` (${content.yearsOfExperience} years, ${level})`;
    } else {
      sectionContent += ` (${level})`;
    }

    return {
      type: 'skill',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['skillName', 'level', 'yearsOfExperience'],
    };
  }

  /**
   * Generate certification section for resume
   */
  private generateCertificationSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};

    // Check if certification is expired
    if (content.expirationDate) {
      const expirationDate = new Date(content.expirationDate);
      if (expirationDate < new Date()) {
        return null; // Skip expired certifications
      }
    }

    const certName = claim.title;
    const issuer = content.issuer || 'Unknown Issuer';

    let sectionContent = `${certName} from ${issuer}`;

    if (content.issueDate) {
      sectionContent += ` (${content.issueDate})`;
    }

    return {
      type: 'certification',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['certName', 'issuer', 'issueDate', 'expirationDate'],
    };
  }

  /**
   * Generate project section for resume
   */
  private generateProjectSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};
    const projectName = claim.title;

    let sectionContent = projectName;

    if (content.description) {
      sectionContent += `: ${content.description}`;
    }

    if (
      content.technologies &&
      Array.isArray(content.technologies) &&
      content.technologies.length > 0
    ) {
      sectionContent += ` using ${content.technologies.join(', ')}`;
    }

    return {
      type: 'project',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['projectName', 'description', 'technologies'],
    };
  }

  /**
   * Generate cover letter introduction
   */
  private generateCoverLetterIntro(jobRequirements: JobRequirements): string {
    const company = jobRequirements.company || 'your company';
    const title = jobRequirements.title;

    return `I am writing to express my strong interest in the ${title} position at ${company}.`;
  }

  /**
   * Generate cover letter experience section
   */
  private generateCoverLetterExperienceSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};
    const company = content.company || 'Unknown Company';
    const title = claim.title;

    let sectionContent = `In my role as ${title} at ${company}`;

    if (
      content.achievements &&
      Array.isArray(content.achievements) &&
      content.achievements.length > 0
    ) {
      sectionContent += `, I ${content.achievements[0].toLowerCase()}`;
    }

    return {
      type: 'experience',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['company', 'title', 'achievements'],
    };
  }

  /**
   * Generate cover letter skill section
   */
  private generateCoverLetterSkillSection(
    claim: CareerClaim,
    _jobRequirements: JobRequirements
  ): TailoredSection | null {
    const content = claim.content || {};
    const skillName = claim.title;
    const level = content.level || 'proficient';

    const sectionContent = `My ${level} skills in ${skillName} align well with your requirements.`;

    return {
      type: 'skill',
      content: sectionContent,
      evidenceClaimIds: [claim.id],
      preserved: ['skillName', 'level'],
    };
  }

  /**
   * Generate cover letter conclusion
   */
  private generateCoverLetterConclusion(_jobRequirements: JobRequirements): string {
    return `I look forward to the opportunity to discuss how my experience and skills can contribute to your team.`;
  }

  /**
   * Generate answer for application question
   */
  private generateAnswer(
    claims: CareerClaim[],
    _jobRequirements: JobRequirements,
    question: string
  ): { content: string; claimIds: string[]; preserved: string[] } | null {
    if (claims.length === 0) {
      return null;
    }

    const questionLower = question.toLowerCase();
    const claimIds: string[] = [];
    const preserved: string[] = [];

    // Determine which claims are relevant to the question
    const relevantClaims = claims.filter((claim) => {
      const contentStr = JSON.stringify(claim.content || {}).toLowerCase();
      const titleStr = claim.title.toLowerCase();
      return contentStr.includes(questionLower) || titleStr.includes(questionLower);
    });

    if (relevantClaims.length === 0) {
      // Use all claims if no specific match
      relevantClaims.push(...claims.slice(0, 3));
    }

    // Generate answer
    const parts: string[] = [];

    for (const claim of relevantClaims) {
      claimIds.push(claim.id);

      try {
        if (claim.type === 'experience') {
          const company = claim.content?.company || 'Unknown Company';
          const years = claim.content?.years ? ` (${claim.content.years} years)` : '';
          parts.push(`${claim.title} at ${company}${years}`);
          preserved.push('company', 'title');
        } else if (claim.type === 'skill') {
          const level = claim.content?.level || 'proficient';
          parts.push(`${claim.title} (${level})`);
          preserved.push('skillName', 'level');
        } else if (claim.type === 'education') {
          const institution = claim.content?.institution || 'Unknown Institution';
          parts.push(`${claim.title} from ${institution}`);
          preserved.push('institution', 'degree');
        } else {
          parts.push(claim.title);
        }
      } catch (_error) {
        // If there's an error accessing claim content, just use the title
        parts.push(claim.title);
      }
    }

    if (parts.length === 0) {
      return null;
    }

    const content = `Based on my ${parts.join(' and ')}, I am well-qualified for this position.`;

    return { content, claimIds, preserved };
  }

  /**
   * Generate professional summary
   */
  private generateProfessionalSummary(
    claims: CareerClaim[],
    _jobRequirements: JobRequirements,
    options?: TailoringOptions
  ): { content: string; claimIds: string[]; preserved: string[] } | null {
    const claimIds: string[] = [];
    const preserved: string[] = [];
    const parts: string[] = [];

    // Get experience
    const experienceClaim = claims.find((c) => c.type === 'experience');
    if (experienceClaim) {
      claimIds.push(experienceClaim.id);
      const content = experienceClaim.content || {};
      const years = content.years || content.yearsOfExperience;
      if (years) {
        parts.push(`${years} years of experience as ${experienceClaim.title}`);
      } else {
        parts.push(`experienced ${experienceClaim.title}`);
      }
      preserved.push('title', 'years');
    }

    // Get skills
    const skillClaims = claims.filter((c) => c.type === 'skill').slice(0, 3);
    if (skillClaims.length > 0) {
      const skills = skillClaims.map((c) => {
        claimIds.push(c.id);
        preserved.push('skillName');
        return c.title;
      });
      parts.push(`with expertise in ${skills.join(', ')}`);
    }

    // Get education
    const educationClaim = claims.find((c) => c.type === 'education');
    if (educationClaim) {
      claimIds.push(educationClaim.id);
      parts.push(`holding ${educationClaim.title}`);
      preserved.push('degree');
    }

    // Get certifications
    const certClaim = claims.find((c) => c.type === 'certification');
    if (certClaim) {
      claimIds.push(certClaim.id);
      parts.push(`and ${certClaim.title} certification`);
      preserved.push('certification');
    }

    const content = parts.join(' ');

    // Apply max length if specified
    const maxLength = options?.maxLength || DEFAULT_MAX_LENGTH;
    if (content.length > maxLength) {
      return { content: `${content.substring(0, maxLength - 3)}...`, claimIds, preserved };
    }

    return { content, claimIds, preserved };
  }

  /**
   * Generate skill entry for skills section
   */
  private generateSkillEntry(
    claim: CareerClaim,
    jobRequirements: JobRequirements
  ): TailoredSkill | null {
    const skillName = claim.title;
    const level = claim.content?.level || 'unknown';

    // Determine priority based on job requirements (case-insensitive comparison)
    let priority: 'high' | 'medium' | 'low' = 'low';

    const skillNameLower = skillName.toLowerCase();

    if (jobRequirements.requiredSkills?.some((s) => s.toLowerCase() === skillNameLower)) {
      priority = 'high';
    } else if (jobRequirements.preferredSkills?.some((s) => s.toLowerCase() === skillNameLower)) {
      priority = 'medium';
    }

    return {
      name: skillName,
      level,
      evidenceClaimId: claim.id,
      priority,
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(claims: CareerClaim[], evidenceTrace: EvidenceTrace[]): number {
    if (claims.length === 0) return 0;

    const coveredClaims = evidenceTrace.length;
    const totalClaims = claims.length;

    return coveredClaims / totalClaims;
  }

  // ============================================================================
  // Evidence Constraint Validation
  // ============================================================================

  /**
   * Validate evidence constraints
   *
   * Note: Unsupported claims are tracked for transparency but do not cause violations.
   * Only actual constraint violations (fabrication, upgrades, etc.) throw errors.
   */
  private validateEvidenceConstraints(result: TailoringResult, claims: CareerClaim[]): void {
    const violations: ConstraintViolation[] = [];

    // Check for fabricated company names
    const experienceSections = result.sections?.filter((s) => s.type === 'experience') || [];
    for (const section of experienceSections) {
      // Safety check: ensure evidenceClaimIds is not empty
      if (!section.evidenceClaimIds || section.evidenceClaimIds.length === 0) {
        continue;
      }

      const claim = claims.find((c) => c.id === section.evidenceClaimIds[0]);
      if (claim?.content?.company) {
        if (!section.content.includes(claim.content.company)) {
          violations.push({
            constraint: {
              type: 'preserve_exact',
              field: 'company',
              message: 'Company name must be preserved exactly',
            },
            claimId: claim.id,
            details: `Company name "${claim.content.company}" not found in output`,
          });
        }
      }
    }

    // Check for skill level upgrades
    const skills = result.skills || [];
    for (const skill of skills) {
      const claim = claims.find((c) => c.id === skill.evidenceClaimId);
      if (claim?.content?.level) {
        if (skill.level !== claim.content.level) {
          violations.push({
            constraint: {
              type: 'no_upgrade',
              field: 'skill_level',
              message: 'Skill level must not be upgraded',
            },
            claimId: claim.id,
            details: `Skill level changed from "${claim.content.level}" to "${skill.level}"`,
          });
        }
      }
    }

    // Note: We do NOT throw errors for unsupported claims.
    // Unsupported claims are tracked for transparency and reporting purposes.
    // They represent evidence that couldn't be used (e.g., low confidence, missing data).
    // This is expected behavior, not a constraint violation.

    if (violations.length > 0) {
      throw new EvidenceConstraintViolationError(violations);
    }
  }
}

// Export singleton instance
export const tailoringEngine = new TailoringEngine();
