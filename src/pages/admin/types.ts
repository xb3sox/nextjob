export type AdminTab =
  | 'overview'
  | 'funnel'
  | 'connectors'
  | 'workflows'
  | 'users'
  | 'ai-quality'
  | 'policy'
  | 'audit';

export interface ConnectorInfo {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'halted_by_kill_switch';
  killSwitchActive: boolean;
  successRate: number;
  lastSyncAt: string;
}

export interface WorkflowFailure {
  id: string;
  jobId: string;
  userId: string;
  connector: string;
  errorCode: string;
  errorMessage: string;
  failedAt: string;
  status: 'failed' | 'reconciled' | 'retrying' | 'aborted';
}

export interface UserSupportRecord {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  status: 'active' | 'suspended' | 'pending_verification';
  profileClaimsCount: number;
  privacyConsentVersion: number;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  seatQuota: number;
  activeMembers: number;
  cohortSize: number;
  tier: 'enterprise' | 'growth' | 'startup';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetId: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}
