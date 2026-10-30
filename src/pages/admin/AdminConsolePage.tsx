import { Activity, Cpu, Database, Power, RefreshCw, Search, Shield, Users } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type {
  AdminTab,
  AuditLogEntry,
  ConnectorInfo,
  OrganizationRecord,
  UserSupportRecord,
  WorkflowFailure,
} from './types';

const INITIAL_CONNECTORS: ConnectorInfo[] = [
  {
    id: 'conn_greenhouse',
    name: 'Greenhouse ATS',
    status: 'healthy',
    killSwitchActive: false,
    successRate: 99.4,
    lastSyncAt: 'Just now',
  },
  {
    id: 'conn_lever',
    name: 'Lever ATS',
    status: 'healthy',
    killSwitchActive: false,
    successRate: 98.8,
    lastSyncAt: '2 mins ago',
  },
  {
    id: 'conn_workday',
    name: 'Workday Enterprise',
    status: 'degraded',
    killSwitchActive: false,
    successRate: 91.2,
    lastSyncAt: '5 mins ago',
  },
  {
    id: 'conn_ashby',
    name: 'Ashby HQ',
    status: 'healthy',
    killSwitchActive: false,
    successRate: 99.9,
    lastSyncAt: 'Just now',
  },
];

const INITIAL_FAILURES: WorkflowFailure[] = [
  {
    id: 'wf_fail_101',
    jobId: 'job_senior_infra_google',
    userId: 'usr_candidate_882',
    connector: 'Workday Enterprise',
    errorCode: 'NETWORK_TIMEOUT',
    errorMessage: 'ATS session handshake timed out after 15000ms',
    failedAt: '12 mins ago',
    status: 'failed',
  },
  {
    id: 'wf_fail_102',
    jobId: 'job_lead_fe_stripe',
    userId: 'usr_candidate_309',
    connector: 'Greenhouse ATS',
    errorCode: 'CAPTCHA_CHALLENGE',
    errorMessage: 'Bot protection triggered; required user copilot handoff',
    failedAt: '34 mins ago',
    status: 'failed',
  },
  {
    id: 'wf_fail_103',
    jobId: 'job_staff_ml_anthropic',
    userId: 'usr_candidate_741',
    connector: 'Lever ATS',
    errorCode: 'SCHEMA_MISMATCH',
    errorMessage: 'Field custom_visa_sponsorship not found in application schema',
    failedAt: '1 hour ago',
    status: 'reconciled',
  },
];

const INITIAL_USERS: UserSupportRecord[] = [
  {
    id: 'usr_candidate_882',
    email: 'elena.rostova@example.com',
    name: 'Elena Rostova',
    tenantId: 'tenant_consumer_default',
    status: 'active',
    profileClaimsCount: 14,
    privacyConsentVersion: 2,
  },
  {
    id: 'usr_candidate_309',
    email: 'marcus.chen@example.com',
    name: 'Marcus Chen',
    tenantId: 'tenant_techstars_accelerator',
    status: 'active',
    profileClaimsCount: 19,
    privacyConsentVersion: 2,
  },
  {
    id: 'usr_candidate_741',
    email: 'aisha.patel@example.com',
    name: 'Aisha Patel',
    tenantId: 'tenant_consumer_default',
    status: 'pending_verification',
    profileClaimsCount: 8,
    privacyConsentVersion: 1,
  },
];

const INITIAL_ORGS: OrganizationRecord[] = [
  {
    id: 'tenant_techstars_accelerator',
    name: 'Techstars Cohort 2026',
    seatQuota: 50,
    activeMembers: 38,
    cohortSize: 38,
    tier: 'growth',
  },
  {
    id: 'tenant_ycombinator_w26',
    name: 'Y Combinator W26 Batch',
    seatQuota: 200,
    activeMembers: 174,
    cohortSize: 174,
    tier: 'enterprise',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_001',
    timestamp: '2026-10-31 09:15:00 UTC',
    actor: 'admin@nextjob.ai',
    action: 'POLICY_DEPLOY',
    targetId: 'policy_v2_strict_sensitive',
    details: 'Activated Legal > Platform > NextJob risk precedence model',
    severity: 'info',
  },
  {
    id: 'audit_002',
    timestamp: '2026-10-31 09:30:12 UTC',
    actor: 'admin@nextjob.ai',
    action: 'AI_GATEWAY_ROUTING_UPDATE',
    targetId: 'gateway_claude_35_sonnet',
    details: 'Primary tier routing locked to Claude 3.5 Sonnet with PII redaction',
    severity: 'info',
  },
];

export default function AdminConsolePage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [connectors, setConnectors] = useState<ConnectorInfo[]>(INITIAL_CONNECTORS);
  const [workflowFailures, setWorkflowFailures] = useState<WorkflowFailure[]>(INITIAL_FAILURES);
  const [users, _setUsers] = useState<UserSupportRecord[]>(INITIAL_USERS);
  const [orgs] = useState<OrganizationRecord[]>(INITIAL_ORGS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const logPrivilegedAction = (
    action: string,
    targetId: string,
    details: string,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ) => {
    const newEntry: AuditLogEntry = {
      id: `audit_${Date.now()}`,
      timestamp: `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
      actor: 'admin@nextjob.ai',
      action,
      targetId,
      details,
      severity,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handleToggleKillSwitch = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === connectorId) {
          const nextState = !c.killSwitchActive;
          logPrivilegedAction(
            nextState ? 'CONNECTOR_KILL_SWITCH_ENGAGED' : 'CONNECTOR_KILL_SWITCH_DISENGAGED',
            c.id,
            `${c.name} kill switch ${nextState ? 'ACTIVATED: All inbound submissions blocked' : 'DEACTIVATED: Submissions resumed'}`,
            nextState ? 'critical' : 'warning'
          );
          setActionNotice(
            `${c.name} kill switch ${nextState ? 'ENGAGED — Submissions halted' : 'DISENGAGED — Submissions resumed'}`
          );
          return {
            ...c,
            killSwitchActive: nextState,
            status: nextState ? 'halted_by_kill_switch' : 'healthy',
          };
        }
        return c;
      })
    );
  };

  const handleReconcileFailure = (
    failureId: string,
    action: 'reconciled' | 'retrying' | 'aborted'
  ) => {
    setWorkflowFailures((prev) =>
      prev.map((f) => {
        if (f.id === failureId) {
          logPrivilegedAction(
            `WORKFLOW_${action.toUpperCase()}`,
            f.id,
            `Failure ${f.id} on ${f.connector} manually marked as ${action}`,
            'warning'
          );
          setActionNotice(`Workflow run ${f.id} marked as ${action}.`);
          return { ...f, status: action };
        }
        return f;
      })
    );
  };

  const handleAccountRecovery = (userId: string, email: string) => {
    logPrivilegedAction(
      'USER_ACCOUNT_RECOVERY_ISSUED',
      userId,
      `Issued password recovery token and audit clearance for ${email}`,
      'warning'
    );
    setActionNotice(`Account recovery token dispatched for ${email}.`);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuditLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.details.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.targetId.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.actor.toLowerCase().includes(auditFilter.toLowerCase())
  );

  const haltedConnectorsCount = connectors.filter((c) => c.killSwitchActive).length;

  return (
    <div className="min-h-screen bg-ink text-paper antialiased">
      {/* Top Banner */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-emerald-400" aria-hidden="true" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-paper">
                Admin & Operations Console
              </h1>
              <p className="text-xs text-fog">NextJob Internal Reliability & Support Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Production
            </span>
            <span className="text-xs text-fog">admin@nextjob.ai</span>
          </div>
        </div>
      </header>

      {/* Action Notification */}
      {actionNotice && (
        <div
          role="status"
          className="border-b border-amber-900/60 bg-amber-950/40 px-6 py-2.5 text-center text-xs font-medium text-amber-300"
        >
          {actionNotice}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav
        aria-label="Admin console navigation"
        className="border-b border-zinc-800 bg-zinc-900/40 px-6"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-2">
          {(
            [
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'connectors', label: 'Connectors & Kill Switches', icon: Power },
              { key: 'workflows', label: 'Workflows & Reconciliation', icon: RefreshCw },
              { key: 'users', label: 'Users & Organizations', icon: Users },
              { key: 'ai-quality', label: 'AI Quality Monitoring', icon: Cpu },
              { key: 'policy', label: 'Policy Precedence', icon: Shield },
              { key: 'audit', label: 'Audit Search & Logs', icon: Database },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === key
                  ? 'bg-zinc-800 text-paper'
                  : 'text-fog hover:bg-zinc-800/50 hover:text-paper'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section aria-labelledby="status-metrics-heading">
              <h2 id="status-metrics-heading" className="text-sm font-semibold text-paper mb-4">
                System Status & Key Reliability Metrics
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-xs text-fog">Active Connectors</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-paper">
                      {connectors.length - haltedConnectorsCount}/{connectors.length}
                    </span>
                    <span
                      className={`text-xs font-medium ${haltedConnectorsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}
                    >
                      {haltedConnectorsCount > 0
                        ? `${haltedConnectorsCount} Halted`
                        : 'All Operational'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-xs text-fog">Workflow Success Rate</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-paper">99.1%</span>
                    <span className="text-xs text-emerald-400">Target &gt; 98%</span>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-xs text-fog">AI Factuality Score</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-paper">99.8%</span>
                    <span className="text-xs text-emerald-400">0% Hallucinations</span>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-xs text-fog">Pending Workflow Failures</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-paper">
                      {workflowFailures.filter((f) => f.status === 'failed').length}
                    </span>
                    <span className="text-xs text-amber-400">Needs Attention</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fog">
                Operational Highlights
              </h3>
              <p className="mt-2 text-xs text-paper/80 leading-relaxed">
                Connectors are monitored continuously with automatic rate-limit throttling and
                failover. In the event of platform changes on Greenhouse, Lever, or Workday,
                immediate kill switches prevent unverified candidate submissions.
              </p>
            </section>
          </div>
        )}

        {/* CONNECTORS TAB */}
        {activeTab === 'connectors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-paper">
                  ATS Connectors & Emergency Kill Switches
                </h2>
                <p className="text-xs text-fog">
                  Control external submission pipelines. Engaging a kill switch halts all automated
                  and copilot submissions for that platform.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {connectors.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-lg border p-5 ${
                    c.killSwitchActive
                      ? 'border-red-800/80 bg-red-950/20'
                      : c.status === 'degraded'
                        ? 'border-amber-800/60 bg-amber-950/10'
                        : 'border-zinc-800 bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-paper">{c.name}</h3>
                      <p className="mt-1 text-xs text-fog">Last sync: {c.lastSyncAt}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.killSwitchActive
                          ? 'border border-red-700 bg-red-950 text-red-400'
                          : c.status === 'degraded'
                            ? 'border border-amber-700 bg-amber-950 text-amber-400'
                            : 'border border-emerald-700 bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {c.killSwitchActive ? 'KILL SWITCH ENGAGED' : c.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-fog">Historical Success Rate</span>
                    <span className="font-semibold text-paper">{c.successRate}%</span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs text-fog">Emergency Interruption</span>
                    <button
                      type="button"
                      onClick={() => handleToggleKillSwitch(c.id)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                        c.killSwitchActive
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400'
                          : 'bg-red-900 text-red-200 hover:bg-red-800 focus-visible:ring-red-400'
                      }`}
                    >
                      {c.killSwitchActive ? 'Disengage Kill Switch' : 'Engage Kill Switch'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-paper">
                Workflow Failures & Manual Reconciliation
              </h2>
              <p className="text-xs text-fog">
                Review failed Temporal activity executions and reconcile state machine records.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-fog">
                  <tr>
                    <th className="p-3">Run ID</th>
                    <th className="p-3">Connector</th>
                    <th className="p-3">Error Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                  {workflowFailures.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-mono text-fog">{f.id}</td>
                      <td className="p-3 font-medium text-paper">{f.connector}</td>
                      <td className="p-3">
                        <span className="inline-block rounded bg-red-950/80 px-2 py-0.5 font-mono text-red-400 border border-red-800/60">
                          {f.errorCode}
                        </span>
                      </td>
                      <td className="p-3 text-fog max-w-xs truncate">{f.errorMessage}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 font-medium ${
                            f.status === 'reconciled'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : f.status === 'retrying'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {f.status === 'failed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReconcileFailure(f.id, 'reconciled')}
                              className="rounded border border-emerald-700/80 bg-emerald-950/60 px-2 py-1 text-emerald-300 hover:bg-emerald-900"
                            >
                              Reconcile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReconcileFailure(f.id, 'retrying')}
                              className="rounded border border-amber-700/80 bg-amber-950/60 px-2 py-1 text-amber-300 hover:bg-amber-900"
                            >
                              Retry
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReconcileFailure(f.id, 'aborted')}
                              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-400 hover:bg-zinc-800"
                            >
                              Abort
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS & ORGS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* User Support */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-paper">
                    User Support & Account Lookup
                  </h2>
                  <p className="text-xs text-fog">
                    Search candidate accounts and verify claims provenance.
                  </p>
                </div>
                <div className="relative">
                  <Search
                    className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-fog"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="Search candidate name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 rounded-md border border-zinc-800 bg-zinc-900/60 pl-8 pr-3 py-1.5 text-xs text-paper placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-900/80 text-fog">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Tenant ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Claims</th>
                      <th className="p-3">Consent Ver</th>
                      <th className="p-3 text-right">Support Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/40">
                        <td className="p-3">
                          <div className="font-medium text-paper">{u.name}</div>
                          <div className="text-fog font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="p-3 font-mono text-fog">{u.tenantId}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 font-medium ${
                              u.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-paper">{u.profileClaimsCount} verified</td>
                        <td className="p-3 text-fog">v{u.privacyConsentVersion}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleAccountRecovery(u.id, u.email)}
                            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                          >
                            Issue Recovery
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Organizations */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-paper">
                  Organization Tenants & Seat Quotas
                </h2>
                <p className="text-xs text-fog">Institutional cohorts and privacy boundaries.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {orgs.map((org) => (
                  <div
                    key={org.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-paper">{org.name}</h3>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
                        {org.tier}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-fog">Active Seats</span>
                        <p className="font-semibold text-paper mt-0.5">
                          {org.activeMembers} / {org.seatQuota}
                        </p>
                      </div>
                      <div>
                        <span className="text-fog">Cohort Size</span>
                        <p className="font-semibold text-paper mt-0.5">{org.cohortSize}</p>
                      </div>
                      <div>
                        <span className="text-fog">Tenant ID</span>
                        <p className="font-mono text-fog mt-0.5 truncate">{org.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI QUALITY TAB */}
        {activeTab === 'ai-quality' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-paper">AI Quality & Gateway Telemetry</h2>
              <p className="text-xs text-fog">
                Real-time evaluation metrics for tailoring factuality and evidence provenance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <span className="text-xs text-fog">Evidence Provenance Coverage</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">94.2%</p>
                <p className="text-xs text-fog mt-1">Threshold requirement: &ge; 80%</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <span className="text-xs text-fog">Hallucination Rate (Evals)</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">0.0%</p>
                <p className="text-xs text-fog mt-1">Strict zero-tolerance policy</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                <span className="text-xs text-fog">Gateway Median Latency</span>
                <p className="text-2xl font-bold text-paper mt-1">412ms</p>
                <p className="text-xs text-fog mt-1">P99: 1,180ms across providers</p>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fog">
                Gateway Model Routing Architecture
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-paper">Primary Synthesis Tier</span>
                  <span className="font-mono text-fog">Claude 3.5 Sonnet (Anthropic)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-paper">Secondary Fallback Tier</span>
                  <span className="font-mono text-fog">GPT-4o (OpenAI)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-paper">Extraction & Normalization Tier</span>
                  <span className="font-mono text-fog">Gemini 1.5 Flash (Google AI)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POLICY PRECEDENCE TAB */}
        {activeTab === 'policy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-paper">
                Policy Precedence & Risk Hierarchy
              </h2>
              <p className="text-xs text-fog">
                Deterministic policy evaluation order implemented in @nextjob/policy.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  level: 'Level 1: Legal & Safety Authority',
                  rule: 'Highest precedence. Absolutely prohibits auto-filling sensitive demographics (race, gender, sexual orientation, disability). Cannot be overridden.',
                  color: 'border-red-800/80 bg-red-950/20 text-red-300',
                },
                {
                  level: 'Level 2: Platform Integrity Authority',
                  rule: 'Enforces rate limits, anti-bot policies, and submission idempotency.',
                  color: 'border-amber-800/80 bg-amber-950/20 text-amber-300',
                },
                {
                  level: 'Level 3: NextJob Safety Rules',
                  rule: 'Mandates human-in-the-loop approval on high-impact commitments (salary, start date).',
                  color: 'border-blue-800/80 bg-blue-950/20 text-blue-300',
                },
                {
                  level: 'Level 4: Organization Policies',
                  rule: 'Institution-specific constraints set by cohort managers.',
                  color: 'border-purple-800/80 bg-purple-950/20 text-purple-300',
                },
                {
                  level: 'Level 5: User Explicit Preferences',
                  rule: 'Candidate custom preferences and per-field approval settings.',
                  color: 'border-emerald-800/80 bg-emerald-950/20 text-emerald-300',
                },
              ].map(({ level, rule, color }) => (
                <div key={level} className={`rounded-lg border p-4 ${color}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider">{level}</h3>
                  <p className="mt-1 text-xs text-paper/90">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT SEARCH & INCIDENTS TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-paper">
                  Audit Search & Incident Ledger
                </h2>
                <p className="text-xs text-fog">
                  Immutable audit log of all privileged admin actions.
                </p>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-fog"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Filter audit records by action or actor..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="w-full sm:w-64 rounded-md border border-zinc-800 bg-zinc-900/60 pl-8 pr-3 py-1.5 text-xs text-paper placeholder-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-fog">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target ID</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-mono text-fog whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-mono text-fog">{log.actor}</td>
                      <td className="p-3 font-semibold text-paper">{log.action}</td>
                      <td className="p-3 font-mono text-fog">{log.targetId}</td>
                      <td className="p-3 text-paper/90">{log.details}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 font-medium ${
                            log.severity === 'critical'
                              ? 'bg-red-950 text-red-400 border border-red-800/60'
                              : log.severity === 'warning'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                : 'bg-zinc-900 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
