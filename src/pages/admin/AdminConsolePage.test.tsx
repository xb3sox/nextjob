/**
 * @vitest-environment happy-dom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminConsolePage from './AdminConsolePage';

describe('AdminConsolePage (T-33, Admin & Operations Console)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin console header, status badge, and default overview metrics', () => {
    render(<AdminConsolePage />);

    expect(screen.getByText('Admin & Operations Console')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('admin@nextjob.ai')).toBeInTheDocument();
    expect(screen.getByText('System Status & Key Reliability Metrics')).toBeInTheDocument();
    expect(screen.getByText('Active Connectors')).toBeInTheDocument();
    expect(screen.getByText('Workflow Success Rate')).toBeInTheDocument();
  });

  it('navigates to Connectors tab and toggles emergency kill switch with audit logging', () => {
    render(<AdminConsolePage />);

    // Click Connectors tab
    const connectorsTab = screen.getByRole('button', { name: /Connectors & Kill Switches/i });
    fireEvent.click(connectorsTab);

    expect(screen.getByText('ATS Connectors & Emergency Kill Switches')).toBeInTheDocument();
    expect(screen.getByText('Greenhouse ATS')).toBeInTheDocument();
    expect(screen.getByText('Workday Enterprise')).toBeInTheDocument();

    // Find Greenhouse engage button
    const engageButtons = screen.getAllByRole('button', { name: /Engage Kill Switch/i });
    expect(engageButtons.length).toBeGreaterThan(0);

    // Toggle kill switch on first connector (Greenhouse)
    fireEvent.click(engageButtons[0]);

    // Verify status update and notice
    expect(screen.getByText(/Greenhouse ATS kill switch ENGAGED/i)).toBeInTheDocument();
    expect(screen.getByText('KILL SWITCH ENGAGED')).toBeInTheDocument();

    // Verify Disengage button is now visible
    expect(screen.getByRole('button', { name: /Disengage Kill Switch/i })).toBeInTheDocument();

    // Navigate to Audit tab and verify the action was recorded in audit log
    const auditTab = screen.getByRole('button', { name: /Audit Search & Logs/i });
    fireEvent.click(auditTab);

    expect(screen.getByText('CONNECTOR_KILL_SWITCH_ENGAGED')).toBeInTheDocument();
  });

  it('navigates to Workflows tab and reconciles failed activity execution', () => {
    render(<AdminConsolePage />);

    // Click Workflows tab
    const workflowsTab = screen.getByRole('button', { name: /Workflows & Reconciliation/i });
    fireEvent.click(workflowsTab);

    expect(screen.getByText('Workflow Failures & Manual Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('NETWORK_TIMEOUT')).toBeInTheDocument();

    // Click reconcile button
    const reconcileBtn = screen.getAllByRole('button', { name: /Reconcile/i })[0];
    fireEvent.click(reconcileBtn);

    expect(screen.getByText(/marked as reconciled/i)).toBeInTheDocument();
  });

  it('navigates to Users tab and filters candidate list by search query', () => {
    render(<AdminConsolePage />);

    // Click Users tab
    const usersTab = screen.getByRole('button', { name: /Users & Organizations/i });
    fireEvent.click(usersTab);

    expect(screen.getByText('User Support & Account Lookup')).toBeInTheDocument();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('Marcus Chen')).toBeInTheDocument();

    // Search for Elena
    const searchInput = screen.getByPlaceholderText(/Search candidate name or email/i);
    fireEvent.change(searchInput, { target: { value: 'Elena' } });

    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.queryByText('Marcus Chen')).not.toBeInTheDocument();

    // Click Issue Recovery button
    const recoveryBtn = screen.getByRole('button', { name: /Issue Recovery/i });
    fireEvent.click(recoveryBtn);

    expect(
      screen.getByText(/Account recovery token dispatched for elena.rostova@example.com/i)
    ).toBeInTheDocument();
  });

  it('displays AI Quality metrics and policy precedence hierarchy', () => {
    render(<AdminConsolePage />);

    // Click AI Quality tab
    const aiTab = screen.getByRole('button', { name: /AI Quality Monitoring/i });
    fireEvent.click(aiTab);

    expect(screen.getByText('AI Quality & Gateway Telemetry')).toBeInTheDocument();
    expect(screen.getByText('94.2%')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText(/Claude 3.5 Sonnet/i)).toBeInTheDocument();

    // Click Policy Precedence tab
    const policyTab = screen.getByRole('button', { name: /Policy Precedence/i });
    fireEvent.click(policyTab);

    expect(screen.getByText('Policy Precedence & Risk Hierarchy')).toBeInTheDocument();
    expect(screen.getByText(/Level 1: Legal & Safety Authority/i)).toBeInTheDocument();
    expect(screen.getByText(/Level 5: User Explicit Preferences/i)).toBeInTheDocument();
  });

  it('filters audit records using the search filter input', () => {
    render(<AdminConsolePage />);

    // Click Audit tab
    const auditTab = screen.getByRole('button', { name: /Audit Search & Logs/i });
    fireEvent.click(auditTab);

    expect(screen.getByText('Audit Search & Incident Ledger')).toBeInTheDocument();
    expect(screen.getByText('POLICY_DEPLOY')).toBeInTheDocument();
    expect(screen.getByText('AI_GATEWAY_ROUTING_UPDATE')).toBeInTheDocument();

    // Search filter for POLICY
    const filterInput = screen.getByPlaceholderText(/Filter audit records by action or actor/i);
    fireEvent.change(filterInput, { target: { value: 'POLICY_DEPLOY' } });

    expect(screen.getByText('POLICY_DEPLOY')).toBeInTheDocument();
    expect(screen.queryByText('AI_GATEWAY_ROUTING_UPDATE')).not.toBeInTheDocument();
  });
});
