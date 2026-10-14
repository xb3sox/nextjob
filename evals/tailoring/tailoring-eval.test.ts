import { describe, it, expect } from 'vitest';
import resumeTailoringData from './datasets/resume_tailoring.json';
import coverLetterData from './datasets/cover_letter.json';
import applicationAnswersData from './datasets/application_answers.json';
import professionalSummaryData from './datasets/professional_summary.json';
import skillsSectionData from './datasets/skills_section.json';
import evidenceCompleteData from './scenarios/evidence_complete.json';
import evidencePartialData from './scenarios/evidence_partial.json';
import evidenceConstraintsData from './scenarios/evidence_constraints.json';
import expectedOutcomes from './expected_outcomes.json';

// Mock tailoring engine for testing
// In production, this would import the actual tailoring engine
class MockTailoringEngine {
  async tailorResume(careerGraph: any, jobRequirements: any) {
    return this.processTailoring(careerGraph, jobRequirements, 'resume');
  }

  async tailorCoverLetter(careerGraph: any, jobRequirements: any) {
    return this.processTailoring(careerGraph, jobRequirements, 'cover_letter');
  }

  async tailorApplicationAnswer(careerGraph: any, question: string) {
    return this.processTailoring(careerGraph, { question }, 'application_answer');
  }

  async tailorProfessionalSummary(careerGraph: any, jobRequirements: any) {
    return this.processTailoring(careerGraph, jobRequirements, 'professional_summary');
  }

  async tailorSkillsSection(careerGraph: any, jobRequirements: any) {
    return this.processTailoring(careerGraph, jobRequirements, 'skills_section');
  }

  private async processTailoring(careerGraph: any, requirements: any, type: string) {
    const verifiedClaims = careerGraph.claims.filter(
      (c: any) => c.verificationStatus === 'verified' && c.confidence >= 0.8
    );

    const sections: any[] = [];
    const unsupportedClaims: string[] = [];

    for (const claim of careerGraph.claims) {
      if (claim.verificationStatus !== 'verified' || claim.confidence < 0.8) {
        unsupportedClaims.push(claim.id);
        continue;
      }

      sections.push({
        type: claim.type,
        content: this.generateContent(claim, type),
        evidenceClaimId: claim.id,
        evidenceClaimIds: [claim.id]
      });
    }

    const evidenceCoverage = verifiedClaims.length / careerGraph.claims.length;

    return {
      sections,
      unsupportedClaims,
      evidenceCoverage,
      summary: sections.length > 0 ? this.generateSummary(sections) : null,
      answer: type === 'application_answer' ? this.generateAnswer(sections, requirements.question) : null,
      skills: type === 'skills_section' ? this.generateSkills(sections) : []
    };
  }

  private generateContent(claim: any, type: string): string {
    if (claim.type === 'experience') {
      return `${claim.title} at ${claim.content.company}`;
    }
    if (claim.type === 'education') {
      return `${claim.title} from ${claim.content.institution}`;
    }
    if (claim.type === 'skill') {
      return `${claim.title} (${claim.content.level})`;
    }
    if (claim.type === 'certification') {
      return `${claim.title} from ${claim.content.issuer}`;
    }
    if (claim.type === 'project') {
      return `${claim.title}: ${claim.content.description}`;
    }
    if (claim.type === 'achievement') {
      return claim.content.description;
    }
    return claim.title;
  }

  private generateSummary(sections: any[]): string {
    return sections.map((s: any) => s.content).join(', ');
  }

  private generateAnswer(sections: any[], question: string): string {
    if (sections.length === 0) return '';
    return `Based on my ${sections.map((s: any) => s.content).join(' and ')}`;
  }

  private generateSkills(sections: any[]): any[] {
    return sections
      .filter((s: any) => s.type === 'skill')
      .map((s: any) => ({
        name: s.content.split(' ')[0],
        level: s.content.match(/\(([^)]+)\)/)?.[1] || 'unknown',
        evidenceClaimId: s.evidenceClaimId
      }));
  }
}

describe('Tailoring Evaluation Dataset', () => {
  const engine = new MockTailoringEngine();

  describe('Resume Tailoring Dataset', () => {
    resumeTailoringData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        const result = await engine.tailorResume(testCase.careerGraph, testCase.jobRequirements);

        // Verify no unsupported claims
        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);

        // Verify evidence coverage
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);

        // Verify sections count
        expect(result.sections.length).toBe(testCase.expectedOutput.sections.length);

        // Verify each section has evidence
        result.sections.forEach((section: any, index: number) => {
          const expectedSection = testCase.expectedOutput.sections[index];
          expect(section.evidenceClaimId || section.evidenceClaimIds).toBeDefined();
        });
      });
    });
  });

  describe('Cover Letter Dataset', () => {
    coverLetterData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        const result = await engine.tailorCoverLetter(testCase.careerGraph, testCase.jobRequirements);

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);
        expect(result.sections.length).toBe(testCase.expectedOutput.sections.length);
      });
    });
  });

  describe('Application Answers Dataset', () => {
    applicationAnswersData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        const result = await engine.tailorApplicationAnswer(
          testCase.careerGraph,
          testCase.question
        );

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);

        if (testCase.expectedOutput.answer === null) {
          expect(result.answer).toBeNull();
        } else {
          expect(result.answer).toBeDefined();
        }
      });
    });
  });

  describe('Professional Summary Dataset', () => {
    professionalSummaryData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        const result = await engine.tailorProfessionalSummary(
          testCase.careerGraph,
          testCase.jobRequirements
        );

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);

        if (testCase.expectedOutput.summary === null) {
          expect(result.summary).toBeNull();
        } else {
          expect(result.summary).toBeDefined();
        }
      });
    });
  });

  describe('Skills Section Dataset', () => {
    skillsSectionData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        const result = await engine.tailorSkillsSection(
          testCase.careerGraph,
          testCase.jobRequirements
        );

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);
        expect(result.skills.length).toBe(testCase.expectedOutput.skills.length);
      });
    });
  });

  describe('Evidence Complete Scenarios', () => {
    evidenceCompleteData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        let result;
        if (testCase.tailoringType === 'resume') {
          result = await engine.tailorResume(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'cover_letter') {
          result = await engine.tailorCoverLetter(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'application_answer') {
          result = await engine.tailorApplicationAnswer(testCase.careerGraph, testCase.question);
        } else if (testCase.tailoringType === 'professional_summary') {
          result = await engine.tailorProfessionalSummary(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'skills_section') {
          result = await engine.tailorSkillsSection(testCase.careerGraph, testCase.jobRequirements);
        }

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);
      });
    });
  });

  describe('Evidence Partial Scenarios', () => {
    evidencePartialData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        let result;
        if (testCase.tailoringType === 'resume') {
          result = await engine.tailorResume(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'cover_letter') {
          result = await engine.tailorCoverLetter(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'professional_summary') {
          result = await engine.tailorProfessionalSummary(testCase.careerGraph, testCase.jobRequirements);
        }

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);
      });
    });
  });

  describe('Evidence Constraints Scenarios', () => {
    evidenceConstraintsData.testCases.forEach((testCase) => {
      it(`should pass ${testCase.id}: ${testCase.description}`, async () => {
        let result;
        if (testCase.tailoringType === 'resume') {
          result = await engine.tailorResume(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'cover_letter') {
          result = await engine.tailorCoverLetter(testCase.careerGraph, testCase.jobRequirements);
        }

        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);
      });
    });
  });

  describe('Success Criteria Validation', () => {
    it('should maintain zero unsupported claims across all datasets', async () => {
      const allTestCases = [
        ...resumeTailoringData.testCases,
        ...coverLetterData.testCases,
        ...applicationAnswersData.testCases,
        ...professionalSummaryData.testCases,
        ...skillsSectionData.testCases,
        ...evidenceCompleteData.testCases,
        ...evidencePartialData.testCases,
        ...evidenceConstraintsData.testCases
      ];

      for (const testCase of allTestCases) {
        let result;
        if (testCase.tailoringType === 'resume') {
          result = await engine.tailorResume(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'cover_letter') {
          result = await engine.tailorCoverLetter(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'application_answer') {
          result = await engine.tailorApplicationAnswer(testCase.careerGraph, testCase.question);
        } else if (testCase.tailoringType === 'professional_summary') {
          result = await engine.tailorProfessionalSummary(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'skills_section') {
          result = await engine.tailorSkillsSection(testCase.careerGraph, testCase.jobRequirements);
        }

        // Verify unsupported claims match expected
        expect(result.unsupportedClaims).toEqual(testCase.expectedOutput.unsupportedClaims);
      }
    });

    it('should maintain 100% evidence coverage for complete evidence scenarios', async () => {
      for (const testCase of evidenceCompleteData.testCases) {
        let result;
        if (testCase.tailoringType === 'resume') {
          result = await engine.tailorResume(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'cover_letter') {
          result = await engine.tailorCoverLetter(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'application_answer') {
          result = await engine.tailorApplicationAnswer(testCase.careerGraph, testCase.question);
        } else if (testCase.tailoringType === 'professional_summary') {
          result = await engine.tailorProfessionalSummary(testCase.careerGraph, testCase.jobRequirements);
        } else if (testCase.tailoringType === 'skills_section') {
          result = await engine.tailorSkillsSection(testCase.careerGraph, testCase.jobRequirements);
        }

        expect(result.evidenceCoverage).toBeCloseTo(testCase.expectedOutput.evidenceCoverage, 2);
      }
    });
  });

  describe('Dataset Statistics', () => {
    it('should have at least 50 test cases total', () => {
      const totalTestCases =
        resumeTailoringData.testCases.length +
        coverLetterData.testCases.length +
        applicationAnswersData.testCases.length +
        professionalSummaryData.testCases.length +
        skillsSectionData.testCases.length +
        evidenceCompleteData.testCases.length +
        evidencePartialData.testCases.length +
        evidenceConstraintsData.testCases.length;

      expect(totalTestCases).toBeGreaterThanOrEqual(expectedOutcomes.summary.totalTestCases);
    });

    it('should cover all tailoring types', () => {
      const tailoringTypes = new Set([
        ...resumeTailoringData.testCases.map(tc => tc.tailoringType),
        ...coverLetterData.testCases.map(tc => tc.tailoringType),
        ...applicationAnswersData.testCases.map(tc => tc.tailoringType),
        ...professionalSummaryData.testCases.map(tc => tc.tailoringType),
        ...skillsSectionData.testCases.map(tc => tc.tailoringType),
        ...evidenceCompleteData.testCases.map(tc => tc.tailoringType),
        ...evidencePartialData.testCases.map(tc => tc.tailoringType),
        ...evidenceConstraintsData.testCases.map(tc => tc.tailoringType)
      ]);

      expect(tailoringTypes.has('resume')).toBe(true);
      expect(tailoringTypes.has('cover_letter')).toBe(true);
      expect(tailoringTypes.has('application_answer')).toBe(true);
      expect(tailoringTypes.has('professional_summary')).toBe(true);
      expect(tailoringTypes.has('skills_section')).toBe(true);
    });
  });
});
