/**
 * @vitest-environment happy-dom
 *
 * End-to-End Tests for Critical Journeys (T-35, Phase 13)
 * Covers: Onboarding, Tailoring, Approval Dialog, Application State Machine,
 * Submission Receipts, Tracker UI, and Privacy Controls (FR-01..FR-10, WCAG 2.2 AA).
 */

import { ApplicationStateMachine, createSubmissionReceipt } from '@nextjob/applications';
import { ApprovalService, PolicyEngine } from '@nextjob/policy';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivacyService } from '../../../packages/api/src/privacy/privacy-service';
import { ApprovalDialog } from '../../components/approval-dialog';
import ApplicationsPage from '../../pages/applications/ApplicationsPage';
import type { TrackedApplication } from '../../pages/applications/types';
import { APPLICATIONS_STORAGE_KEY } from '../../pages/applications/useApplications';
import TailorPage from '../../pages/TailorPage';

// Mock AuthContext
const mockUser = {
  email: 'candidate.e2e@example.com',
  user_metadata: { full_name: 'Elena Rostova' },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: vi.fn(),
  }),
}));

describe('Critical User Journeys E2E (T-35)', () => {
  const TENANT_ID = 'tenant_e2e';
  const USER_ID = 'usr_elena_001';

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Journey 1: Evidence-Constrained Tailoring (FR-01)', () => {
    it('walks user through reviewing proposed statements with evidence provenance', async () => {
      render(
        <MemoryRouter>
          <TailorPage />
        </MemoryRouter>
      );

      // Verify header and guidance
      expect(await screen.findByRole('heading', { name: 'Review your draft' })).toBeInTheDocument();
      expect(
        screen.getByText(/Every line below traces to a verified claim in your profile/i)
      ).toBeInTheDocument();

      // Original claim & evidence verification
      expect(screen.getByText(/company: Tech Corp/i)).toBeInTheDocument();
      expect(screen.getByText(/Senior Software Engineer at Tech Corp/i)).toBeInTheDocument();

      // Accept first statement
      const acceptButtons = screen.getAllByRole('button', { name: /Accept experience statement/i });
      fireEvent.click(acceptButtons[0]);
      expect(acceptButtons[0]).toHaveAttribute('aria-pressed', 'true');

      // Edit first statement
      const editButtons = screen.getAllByRole('button', { name: /Edit experience statement/i });
      fireEvent.click(editButtons[0]);
      const textarea = screen.getByLabelText('Edit proposed experience statement');
      fireEvent.change(textarea, { target: { value: 'Optimized PostgreSQL queries by 45%.' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save edit' }));

      expect(screen.getByText('Optimized PostgreSQL queries by 45%.')).toBeInTheDocument();
    });
  });

  describe('Journey 2: Risk Evaluation & Human-in-the-Loop Approval (FR-03, FR-07)', () => {
    it('classifies sensitive/high-risk fields and routes through interactive approval dialog', async () => {
      const engine = new PolicyEngine();

      // 1. Classify sensitive field (ethnicity/health)
      const sensitiveEval = engine.evaluateField({
        key: 'demographic_ethnicity',
        label: 'What is your race / ethnic background?',
        category: 'demographics',
      });

      expect(sensitiveEval.effectiveClassification.riskLevel).toBe('sensitive');
      expect(sensitiveEval.effectiveClassification.requiresUserApproval).toBe(true);
      expect(sensitiveEval.effectiveClassification.canAutoFill).toBe(false);

      // 2. Classify high-risk field (salary requirement)
      const salaryEval = engine.evaluateField({
        key: 'expected_salary',
        label: 'What is your target annual salary?',
      });
      expect(salaryEval.effectiveClassification.riskLevel).toBe('high');
      expect(salaryEval.effectiveClassification.requiresUserApproval).toBe(true);

      // 3. Render ApprovalDialog
      const approvalService = new ApprovalService();
      const approvalReq = approvalService.createRequest({
        tenantId: TENANT_ID,
        userId: USER_ID,
        jobId: 'job_senior_backend',
        fieldKey: 'expected_salary',
        question: 'What is your target annual salary?',
        proposedAnswer: '$165,000 USD',
        riskLevel: salaryEval.effectiveClassification.riskLevel,
        impactDescription: 'Binding compensation expectation submitted to hiring team',
      });

      const onDecision = vi.fn();
      const onClose = vi.fn();

      render(
        <ApprovalDialog
          isOpen={true}
          request={approvalReq}
          onDecision={onDecision}
          onClose={onClose}
        />
      );

      // Verify accessible dialog presentation
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('HIGH Risk')).toBeInTheDocument();
      expect(screen.getByText('$165,000 USD')).toBeInTheDocument();
      expect(screen.getByText(/Binding compensation expectation/i)).toBeInTheDocument();

      // Click Approve Once
      const approveOnceBtn = screen.getByRole('button', { name: /Approve Once/i });
      fireEvent.click(approveOnceBtn);
      expect(onDecision).toHaveBeenCalledWith('approve_once');
    });
  });

  describe('Journey 3: Application State Transitions & Submission Receipt (FR-04, FR-05)', () => {
    it('progresses application through states and generates immutable receipt with field hashes', () => {
      const sm = new ApplicationStateMachine('app_e2e_999');

      // 1. Initial State
      expect(sm.current).toBe('DISCOVERED');

      // 2. Progression with required guards
      sm.transition('NORMALIZED', { actor: 'system' });
      sm.transition('ELIGIBILITY_CHECKED', { actor: 'system', eligibility: 'eligible' });
      sm.transition('MATCHED', { actor: 'system' });
      sm.transition('PLANNED', { actor: 'user' });
      sm.transition('TAILORED', { actor: 'system' });
      sm.transition('POLICY_CHECKED', { actor: 'system' });
      sm.transition('READY', { actor: 'user', eligibility: 'eligible', approvalsSatisfied: true });
      sm.transition('EXECUTING', { actor: 'temporal_worker' });
      sm.transition('SUBMITTED_UNVERIFIED', { actor: 'greenhouse_connector' });
      sm.transition('SUBMITTED_VERIFIED', {
        actor: 'greenhouse_connector',
        verificationEvidenceId: 'conf_gh_receipt_999',
      });

      expect(sm.current).toBe('SUBMITTED_VERIFIED');

      // 3. Receipt Generation (FR-04)
      const receipt = createSubmissionReceipt({
        applicationId: 'app_e2e_999',
        jobVersion: 'v2.4.0',
        submittedFields: {
          fullName: 'Elena Rostova',
          email: 'candidate.e2e@example.com',
          salary: '$165,000 USD',
        },
        answers: ['5+ years distributed systems', 'Authorized to work in US'],
        confirmationEvidenceId: 'conf_gh_receipt_999',
      });

      expect(receipt.applicationId).toBe('app_e2e_999');
      expect(receipt.answerHashes.length).toBe(2);
      expect(receipt.fieldHashes.fullName).toMatch(/^[a-f0-9]{64}$/);
      expect(receipt.fieldHashes.salary).toMatch(/^[a-f0-9]{64}$/);
      expect(receipt.contentHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('Journey 4: Application Tracker UI Inspection (T-27)', () => {
    it('displays tracked applications by status and shows submission receipt details', async () => {
      const sampleReceipt = createSubmissionReceipt({
        applicationId: 'app_tracked_1',
        jobVersion: 'v1.0.0',
        submittedFields: { email: 'elena@example.com' },
        answers: ['React + TypeScript'],
        confirmationEvidenceId: 'conf_123',
      });

      const seedApplications: TrackedApplication[] = [
        {
          id: 'app_tracked_1',
          state: 'SUBMITTED_VERIFIED',
          retryCount: 0,
          jobTitle: 'Senior Full Stack Engineer',
          companyName: 'Linear Labs',
          receipt: sampleReceipt,
          audit: [
            {
              at: new Date().toISOString(),
              from: 'EXECUTING',
              to: 'SUBMITTED_VERIFIED',
              actor: 'connector',
              reason: 'Submission verified by ATS',
            },
          ],
        },
      ];

      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(seedApplications));

      render(
        <MemoryRouter initialEntries={['/applications']}>
          <Routes>
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Verify page and section
      expect(await screen.findByText('Linear Labs')).toBeInTheDocument();
      expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument();
      expect(screen.getByText('Receipt:')).toBeInTheDocument();
      expect(screen.getByText(/Hash:/i)).toBeInTheDocument();
    });
  });

  describe('Journey 5: Complete Privacy Lifecycle (FR-10, T-36)', () => {
    it('supports candidate view, correct, export (SHA-256), and cascading hard deletion', async () => {
      const privacy = new PrivacyService();

      // Seed candidate data
      privacy.store.seedUserData(TENANT_ID, USER_ID, {
        profile: { fullName: 'Elena Rostova', email: 'elena@example.com' },
        claims: [{ id: 'clm_1', role: 'Staff Engineer' }],
        evidence: [{ id: 'ev_1', file: 'resume.pdf' }],
        applications: [{ id: 'app_1', job: 'Tech Lead' }],
        receipts: [{ id: 'rcpt_1', hash: 'abc123' }],
      });

      // 1. View Data
      const candidateData = await privacy.viewData(TENANT_ID, USER_ID);
      expect(candidateData.profile.fullName).toBe('Elena Rostova');
      expect(candidateData.claims).toHaveLength(1);

      // 2. Correct Data
      const correction = await privacy.correctData(
        TENANT_ID,
        USER_ID,
        'profile.fullName',
        'Elena Rostova, Ph.D.',
        'Elena Rostova',
        'Added credentials'
      );
      expect(correction.newValue).toBe('Elena Rostova, Ph.D.');

      // 3. Export Data (with SHA-256 checksum)
      const exportArchive = await privacy.exportData(TENANT_ID, USER_ID);
      expect(exportArchive.formatVersion).toBe('1.0.0');
      expect(exportArchive.sha256Checksum).toMatch(/^[a-f0-9]{64}$/);

      // 4. Disable Model Learning (Opt-out)
      await privacy.updatePreferences(TENANT_ID, USER_ID, { disableModelLearning: true });
      const processCheck = await privacy.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'model_training'
      );
      expect(processCheck.allowed).toBe(false);

      // 5. Hard Cascading Deletion
      const deletionReceipt = await privacy.deleteData(TENANT_ID, USER_ID);
      expect(deletionReceipt.status).toBe('completed');
      expect(deletionReceipt.recordsDeleted.claims).toBe(1);
      expect(deletionReceipt.recordsDeleted.evidence).toBe(1);
      expect(deletionReceipt.verificationHash).toMatch(/^[a-f0-9]{64}$/);

      // Verify zero records remain
      const postDeleteData = await privacy.viewData(TENANT_ID, USER_ID);
      expect(postDeleteData.claims).toHaveLength(0);
      expect(postDeleteData.evidence).toHaveLength(0);
      expect(postDeleteData.applications).toHaveLength(0);
    });
  });
});
