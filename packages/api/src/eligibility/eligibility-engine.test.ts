import { beforeEach, describe, expect, it } from 'vitest';
import { EligibilityEngineService } from './eligibility-engine.js';

describe('EligibilityEngineService', () => {
  let service: EligibilityEngineService;

  beforeEach(() => {
    service = new EligibilityEngineService();
  });

  describe('createRule', () => {
    it('should create a location rule', async () => {
      const rule = await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Location Required',
        description: 'Job must be in United States',
        checkType: 'location',
        required: true,
        condition: {
          countries: ['US'],
        },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      expect(rule.id).toBeDefined();
      expect(rule.name).toBe('US Location Required');
      expect(rule.checkType).toBe('location');
      expect(rule.required).toBe(true);
      expect(rule.condition.countries).toEqual(['US']);
    });

    it('should create a work authorization rule', async () => {
      const rule = await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Work Authorization',
        checkType: 'work_authorization',
        required: true,
        condition: {
          requiredAuthorizations: ['US Citizen', 'Green Card'],
        },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      expect(rule.checkType).toBe('work_authorization');
      expect(rule.condition.requiredAuthorizations).toEqual(['US Citizen', 'Green Card']);
    });

    it('should create a skills rule', async () => {
      const rule = await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Required Skills',
        checkType: 'skill',
        required: true,
        condition: {
          requiredSkills: ['JavaScript', 'TypeScript', 'React'],
        },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      expect(rule.checkType).toBe('skill');
      expect(rule.condition.requiredSkills).toEqual(['JavaScript', 'TypeScript', 'React']);
    });
  });

  describe('checkEligibility', () => {
    it('should return eligible when all checks pass', async () => {
      // Create rules
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Location',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Required Skills',
        checkType: 'skill',
        required: true,
        condition: { requiredSkills: ['JavaScript'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      // Check eligibility
      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        {
          location: { country: 'US', city: 'San Francisco' },
          skills: [{ name: 'JavaScript' }, { name: 'React' }],
        },
        {
          location: { country: 'US', remote: false },
          requiredSkills: ['JavaScript'],
        }
      );

      expect(result.eligible).toBe(true);
      expect(result.unknown).toBe(false);
      expect(result.summary.passed).toBe(2);
      expect(result.summary.failed).toBe(0);
    });

    it('should return ineligible when required check fails', async () => {
      // Create rules
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Location',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      // Check eligibility
      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        {
          location: { country: 'UK', city: 'London' },
        },
        {
          location: { country: 'US', remote: false },
        }
      );

      expect(result.eligible).toBe(false);
      expect(result.unknown).toBe(false);
      expect(result.summary.failed).toBe(1);
      expect(result.assessment.missingRequirements).toBeDefined();
    });

    it('should return unknown when required check cannot be verified', async () => {
      // Create rules
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Work Authorization',
        checkType: 'work_authorization',
        required: true,
        condition: { requiredAuthorizations: ['US Citizen'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      // Check eligibility (user has no work authorization info)
      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        {},
        {}
      );

      expect(result.eligible).toBe(false);
      expect(result.unknown).toBe(true);
      expect(result.summary.unknown).toBe(1);
    });

    it('should check location eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Only',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { location: { country: 'US' } },
        { location: { country: 'US', remote: false } }
      );

      expect(result.eligible).toBe(true);
      expect(result.assessment.checks[0].status).toBe('eligible');
    });

    it('should check work authorization eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Work Auth',
        checkType: 'work_authorization',
        required: true,
        condition: { requiredAuthorizations: ['US Citizen', 'Green Card'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { workAuthorization: { authorizations: ['US Citizen'] } },
        {}
      );

      expect(result.eligible).toBe(true);
    });

    it('should check sponsorship eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'No Sponsorship Required',
        checkType: 'sponsorship',
        required: true,
        condition: { requireNoSponsorship: true },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { needsSponsorship: true },
        { visaSponsorship: false }
      );

      expect(result.eligible).toBe(false);
    });

    it('should check education eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Bachelor Required',
        checkType: 'education',
        required: true,
        condition: { minimumDegree: 'bachelor' },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { education: [{ degree: 'Master', field: 'Computer Science' }] },
        {}
      );

      expect(result.eligible).toBe(true);
    });

    it('should check experience eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: '5 Years Experience',
        checkType: 'experience',
        required: true,
        condition: { minimumYears: 5 },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        {
          experience: [
            { startDate: '2018-01-01', endDate: '2023-01-01' }, // 5 years
          ],
        },
        {}
      );

      expect(result.eligible).toBe(true);
    });

    it('should check skills eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Required Skills',
        checkType: 'skill',
        required: true,
        condition: { requiredSkills: ['JavaScript', 'React'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }] },
        {}
      );

      expect(result.eligible).toBe(true);
    });

    it('should check language eligibility', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'English Required',
        checkType: 'language',
        required: true,
        condition: {
          requiredLanguages: [{ language: 'English', proficiency: 'professional' }],
        },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { languages: [{ language: 'English', proficiency: 'fluent' }] },
        {}
      );

      expect(result.eligible).toBe(true);
    });

    it('should handle multiple rules', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Location',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'JavaScript Required',
        checkType: 'skill',
        required: true,
        condition: { requiredSkills: ['JavaScript'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Bachelor Required',
        checkType: 'education',
        required: true,
        condition: { minimumDegree: 'bachelor' },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        {
          location: { country: 'US' },
          skills: [{ name: 'JavaScript' }],
          education: [{ degree: 'Bachelor' }],
        },
        { location: { country: 'US', remote: false } }
      );

      expect(result.eligible).toBe(true);
      expect(result.summary.total).toBe(3);
      expect(result.summary.passed).toBe(3);
    });

    it('should calculate confidence score', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'US Location',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { location: { country: 'US' } },
        { location: { country: 'US', remote: false } }
      );

      expect(result.assessment.confidence).toBeGreaterThan(0);
      expect(result.assessment.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('listRules', () => {
    it('should list all rules for tenant', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Rule 1',
        checkType: 'location',
        condition: {},
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Rule 2',
        checkType: 'skill',
        condition: {},
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.listRules({ tenantId: '00000000-0000-4000-8000-0000000000a1' });

      expect(result.rules).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by check type', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Location Rule',
        checkType: 'location',
        condition: {},
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Skill Rule',
        checkType: 'skill',
        condition: {},
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.listRules({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        checkType: 'location',
      });

      expect(result.rules).toHaveLength(1);
      expect(result.rules[0].checkType).toBe('location');
    });

    it('should sort by priority', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Low Priority',
        checkType: 'location',
        condition: {},
        priority: 0,
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'High Priority',
        checkType: 'skill',
        condition: {},
        priority: 10,
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.listRules({ tenantId: '00000000-0000-4000-8000-0000000000a1' });

      expect(result.rules[0].name).toBe('High Priority');
      expect(result.rules[1].name).toBe('Low Priority');
    });
  });

  describe('updateRule', () => {
    it('should update rule', async () => {
      const created = await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Original Name',
        checkType: 'location',
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const updated = await service.updateRule(
        created.id,
        '00000000-0000-4000-8000-0000000000a1',
        { name: 'Updated Name', condition: { countries: ['US', 'CA'] } },
        '00000000-0000-4000-8000-0000000000b1'
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated.condition.countries).toEqual(['US', 'CA']);
      expect(updated.version).toBe(2);
    });
  });

  describe('deleteRule', () => {
    it('should soft delete rule', async () => {
      const created = await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Test Rule',
        checkType: 'location',
        condition: {},
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.deleteRule(
        created.id,
        '00000000-0000-4000-8000-0000000000a1',
        '00000000-0000-4000-8000-0000000000b1'
      );

      await expect(
        service.getRule(created.id, '00000000-0000-4000-8000-0000000000a1')
      ).rejects.toThrow();
    });
  });

  describe('getAssessment', () => {
    it('should retrieve assessment by ID', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Test Rule',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      const result = await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { location: { country: 'US' } },
        { location: { country: 'US', remote: false } }
      );

      const assessment = await service.getAssessment(
        result.assessment.id,
        '00000000-0000-4000-8000-0000000000a1'
      );

      expect(assessment.id).toBe(result.assessment.id);
      expect(assessment.status).toBe('eligible');
    });
  });

  describe('listAssessments', () => {
    it('should list assessments for user', async () => {
      await service.createRule({
        tenantId: '00000000-0000-4000-8000-0000000000a1',
        name: 'Test Rule',
        checkType: 'location',
        required: true,
        condition: { countries: ['US'] },
        userId: '00000000-0000-4000-8000-0000000000b1',
      });

      await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c1',
        },
        { location: { country: 'US' } },
        { location: { country: 'US', remote: false } }
      );

      await service.checkEligibility(
        {
          userId: '00000000-0000-4000-8000-0000000000b1',
          tenantId: '00000000-0000-4000-8000-0000000000a1',
          jobId: '00000000-0000-4000-8000-0000000000c2',
        },
        { location: { country: 'US' } },
        { location: { country: 'US', remote: false } }
      );

      const result = await service.listAssessments(
        '00000000-0000-4000-8000-0000000000b1',
        '00000000-0000-4000-8000-0000000000a1'
      );

      expect(result.assessments).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
