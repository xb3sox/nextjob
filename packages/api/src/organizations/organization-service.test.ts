import { beforeEach, describe, expect, it } from 'vitest';
import { OrganizationService } from './organization-service';
import { OrganizationStore } from './organization-store';
import {
  CohortTooSmallError,
  LicenseQuotaExceededError,
  MINIMUM_COHORT_SIZE_FOR_REPORTING,
} from './types';

describe('Organization & Cohort Management (T-30, FR-09, G-10)', () => {
  let store: OrganizationStore;
  let service: OrganizationService;

  const TENANT_A = 'tenant_enterprise_01';
  const TENANT_B = 'tenant_enterprise_02';

  beforeEach(() => {
    store = new OrganizationStore();
    service = new OrganizationService(store);
  });

  describe('Organization Lifecycle', () => {
    it('creates an organization with allocated seat licenses', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Tech University Career Center',
        slug: 'tech-uni-careers',
        licenseCount: 50,
      });

      expect(org.id).toMatch(/^org_/);
      expect(org.tenantId).toBe(TENANT_A);
      expect(org.name).toBe('Tech University Career Center');
      expect(org.slug).toBe('tech-uni-careers');
      expect(org.licenseCount).toBe(50);
      expect(org.usedLicenses).toBe(0);

      const fetched = await service.getOrganization(TENANT_A, org.id);
      expect(fetched).toEqual(org);
    });

    it('enforces tenant isolation: cannot fetch organization from another tenant', async () => {
      const orgA = await service.createOrganization(TENANT_A, {
        name: 'Alpha Org',
        slug: 'alpha-org',
        licenseCount: 10,
      });

      const attempt = await service.getOrganization(TENANT_B, orgA.id);
      expect(attempt).toBeNull();
    });
  });

  describe('Cohort Management', () => {
    it('creates and lists cohorts within an organization', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Bootcamp Inc',
        slug: 'bootcamp-inc',
        licenseCount: 20,
      });

      const cohort1 = await service.createCohort(TENANT_A, org.id, {
        name: 'Spring 2026 Software Engineering',
        description: 'Frontend and Fullstack track',
      });

      const cohort2 = await service.createCohort(TENANT_A, org.id, {
        name: 'Fall 2026 Data Science',
        description: 'AI & Data track',
      });

      expect(cohort1.id).toMatch(/^cohort_/);
      expect(cohort2.id).toMatch(/^cohort_/);
      expect(cohort1.organizationId).toBe(org.id);

      const cohorts = await service.listCohorts(TENANT_A, org.id);
      expect(cohorts).toHaveLength(2);
      expect(cohorts.map((c) => c.name)).toContain('Spring 2026 Software Engineering');
      expect(cohorts.map((c) => c.name)).toContain('Fall 2026 Data Science');
    });

    it('rejects cohort creation if organization does not exist in tenant', async () => {
      await expect(
        service.createCohort(TENANT_A, 'non_existent_org', {
          name: 'Invalid Cohort',
        })
      ).rejects.toThrow(/not found in tenant/i);
    });
  });

  describe('License Quota & Participant Invitation', () => {
    it('enforces license quota when inviting participants', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Limited Academy',
        slug: 'limited-academy',
        licenseCount: 2, // only 2 seats
      });

      const cohort = await service.createCohort(TENANT_A, org.id, {
        name: 'Pilot Cohort',
      });

      // 1st invitation
      const p1 = await service.inviteParticipant(TENANT_A, org.id, cohort.id, {
        email: 'alice@example.com',
      });
      expect(p1.status).toBe('invited');
      expect(p1.inviteToken).toBeDefined();

      // 2nd invitation
      const p2 = await service.inviteParticipant(TENANT_A, org.id, cohort.id, {
        email: 'bob@example.com',
      });
      expect(p2.status).toBe('invited');

      // 3rd invitation exceeds allocated licenseCount of 2
      await expect(
        service.inviteParticipant(TENANT_A, org.id, cohort.id, {
          email: 'charlie@example.com',
        })
      ).rejects.toThrow(LicenseQuotaExceededError);

      const updatedOrg = await service.getOrganization(TENANT_A, org.id);
      expect(updatedOrg?.usedLicenses).toBe(2);
    });

    it('processes participant invitation acceptance and activates user', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Open Org',
        slug: 'open-org',
        licenseCount: 10,
      });

      const cohort = await service.createCohort(TENANT_A, org.id, {
        name: 'Cohort Alpha',
      });

      const participant = await service.inviteParticipant(TENANT_A, org.id, cohort.id, {
        email: 'student@example.com',
      });

      const token = participant.inviteToken!;
      const activated = await service.acceptInvitation(token, 'user_student_123');

      expect(activated.status).toBe('active');
      expect(activated.userId).toBe('user_student_123');
      expect(activated.joinedAt).toBeInstanceOf(Date);
      expect(activated.inviteToken).toBeUndefined();

      // Accepting again throws an error
      await expect(service.acceptInvitation(token, 'user_student_123')).rejects.toThrow(
        /invalid or expired/i
      );
    });
  });

  describe('Privacy Safeguards & G-10 Minimum Cohort Size Threshold', () => {
    it('blocks aggregate reporting when cohort has fewer than 5 active participants (G-10)', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Small Academy',
        slug: 'small-academy',
        licenseCount: 10,
      });

      const cohort = await service.createCohort(TENANT_A, org.id, {
        name: 'Undersized Cohort',
      });

      // Add only 4 active participants
      for (let i = 1; i <= 4; i++) {
        const p = await service.inviteParticipant(TENANT_A, org.id, cohort.id, {
          email: `candidate${i}@example.com`,
        });
        await service.acceptInvitation(p.inviteToken!, `user_${i}`);
      }

      const participants = await service.listParticipants(TENANT_A, cohort.id);
      expect(participants).toHaveLength(4);

      // Attempting to generate aggregate report must throw CohortTooSmallError per G-10
      await expect(service.getCohortAggregateReport(TENANT_A, org.id, cohort.id)).rejects.toThrow(
        CohortTooSmallError
      );

      try {
        await service.getCohortAggregateReport(TENANT_A, org.id, cohort.id);
      } catch (err: unknown) {
        const error = err as CohortTooSmallError;
        expect(error.code).toBe('COHORT_TOO_SMALL');
        expect(error.actualCount).toBe(4);
        expect(error.message).toContain('at least 5 participants (G-10)');
      }
    });

    it('permits aggregate reporting when cohort reaches minimum threshold of 5 participants (G-10)', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Standard Institute',
        slug: 'standard-institute',
        licenseCount: 20,
      });

      const cohort = await service.createCohort(TENANT_A, org.id, {
        name: 'Compliant Cohort',
      });

      // Add 5 active participants (exactly G-10 threshold)
      for (let i = 1; i <= MINIMUM_COHORT_SIZE_FOR_REPORTING; i++) {
        const p = await service.inviteParticipant(TENANT_A, org.id, cohort.id, {
          email: `participant${i}@example.com`,
        });
        await service.acceptInvitation(p.inviteToken!, `user_${i}`);
      }

      const report = await service.getCohortAggregateReport(TENANT_A, org.id, cohort.id, {
        totalApplicationsSubmitted: 40,
        interviewCount: 12,
        offerCount: 4,
      });

      expect(report.cohortId).toBe(cohort.id);
      expect(report.cohortName).toBe('Compliant Cohort');
      expect(report.participantCount).toBe(5);
      expect(report.activeSeekersCount).toBe(5);
      expect(report.totalApplicationsSubmitted).toBe(40);
      expect(report.interviewRatePercentage).toBe(30); // 12/40 = 30%
      expect(report.offerRatePercentage).toBe(33); // 4/12 = 33.3% -> 33%
      expect(report.averageApplicationsPerSeeker).toBe(8); // 40/5 = 8
      expect(report.generatedAt).toBeInstanceOf(Date);

      // Verify report is aggregate-only: no individual candidate records exist on report
      expect((report as Record<string, unknown>).users).toBeUndefined();
      expect((report as Record<string, unknown>).candidates).toBeUndefined();
      expect((report as Record<string, unknown>).participants).toBeUndefined();
    });

    it('calculates aggregate metrics safely for larger cohorts', async () => {
      const org = await service.createOrganization(TENANT_A, {
        name: 'Large Tech University',
        slug: 'large-tech-uni',
        licenseCount: 30,
      });

      const cohort = await service.createCohort(TENANT_A, org.id, {
        name: 'Fall 2026 Mega Cohort',
      });

      // Add 10 active participants
      for (let i = 1; i <= 10; i++) {
        const p = await service.inviteParticipant(TENANT_A, org.id, cohort.id, {
          email: `student${i}@example.com`,
        });
        await service.acceptInvitation(p.inviteToken!, `student_user_${i}`);
      }

      const report = await service.getCohortAggregateReport(TENANT_A, org.id, cohort.id, {
        totalApplicationsSubmitted: 100,
        interviewCount: 25,
        offerCount: 10,
      });

      expect(report.participantCount).toBe(10);
      expect(report.totalApplicationsSubmitted).toBe(100);
      expect(report.interviewRatePercentage).toBe(25);
      expect(report.offerRatePercentage).toBe(40);
      expect(report.averageApplicationsPerSeeker).toBe(10);
    });
  });
});
