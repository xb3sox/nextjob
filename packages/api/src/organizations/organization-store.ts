import crypto from 'node:crypto';
import type { Cohort, CohortParticipant, Organization } from './types';

export class OrganizationStore {
  private organizations: Map<string, Organization> = new Map();
  private cohorts: Map<string, Cohort> = new Map();
  private participants: Map<string, CohortParticipant> = new Map();

  // Organizations
  async createOrganization(
    data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'usedLicenses'>
  ): Promise<Organization> {
    const id = `org_${crypto.randomUUID()}`;
    const org: Organization = {
      ...data,
      id,
      usedLicenses: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(id, org);
    return org;
  }

  async findOrganizationById(tenantId: string, id: string): Promise<Organization | null> {
    const org = this.organizations.get(id);
    if (!org || org.tenantId !== tenantId) return null;
    return org;
  }

  async updateOrganization(org: Organization): Promise<void> {
    org.updatedAt = new Date();
    this.organizations.set(org.id, org);
  }

  // Cohorts
  async createCohort(data: Omit<Cohort, 'id' | 'createdAt'>): Promise<Cohort> {
    const id = `cohort_${crypto.randomUUID()}`;
    const cohort: Cohort = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.cohorts.set(id, cohort);
    return cohort;
  }

  async findCohortById(tenantId: string, cohortId: string): Promise<Cohort | null> {
    const cohort = this.cohorts.get(cohortId);
    if (!cohort || cohort.tenantId !== tenantId) return null;
    return cohort;
  }

  async listCohortsByOrganization(tenantId: string, organizationId: string): Promise<Cohort[]> {
    return Array.from(this.cohorts.values()).filter(
      (c) => c.tenantId === tenantId && c.organizationId === organizationId
    );
  }

  // Participants
  async createParticipant(
    data: Omit<CohortParticipant, 'id' | 'createdAt' | 'joinedAt'>
  ): Promise<CohortParticipant> {
    const id = `part_${crypto.randomUUID()}`;
    const participant: CohortParticipant = {
      ...data,
      id,
      joinedAt: null,
      createdAt: new Date(),
    };
    this.participants.set(id, participant);
    return participant;
  }

  async findParticipantByToken(token: string): Promise<CohortParticipant | null> {
    for (const p of this.participants.values()) {
      if (p.inviteToken === token) {
        return p;
      }
    }
    return null;
  }

  async updateParticipant(participant: CohortParticipant): Promise<void> {
    this.participants.set(participant.id, participant);
  }

  async listParticipantsByCohort(tenantId: string, cohortId: string): Promise<CohortParticipant[]> {
    return Array.from(this.participants.values()).filter(
      (p) => p.tenantId === tenantId && p.cohortId === cohortId
    );
  }

  clear(): void {
    this.organizations.clear();
    this.cohorts.clear();
    this.participants.clear();
  }
}
