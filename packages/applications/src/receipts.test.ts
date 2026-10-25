import { describe, expect, it } from 'vitest';
import {
  computeContentHash,
  createSubmissionReceipt,
  hashValue,
  receiptForSnapshot,
  submitApplication,
  verifyReceipt,
} from './receipts';
import { ApplicationStateMachine } from './state-machine';

const fixedNow = new Date('2026-10-25T00:00:00.000Z');

const input = {
  applicationId: 'app-1',
  jobVersion: 'job-v7',
  submittedFields: {
    fullName: 'Ada Lovelace',
    email: 'ada@example.test',
    coverLetter: 'I built the first program.',
  },
  answers: ['Yes, I am authorised to work.', 'No sponsorship needed.'],
  submittedAt: fixedNow,
};

describe('createSubmissionReceipt', () => {
  it('carries every FR-04 field', () => {
    const receipt = createSubmissionReceipt(input);

    expect(receipt.applicationId).toBe('app-1');
    expect(receipt.jobVersion).toBe('job-v7');
    expect(receipt.submittedAt).toBe('2026-10-25T00:00:00.000Z');
    expect(Object.keys(receipt.fieldHashes).sort()).toEqual(['coverLetter', 'email', 'fullName']);
    expect(receipt.answerHashes).toHaveLength(2);
    expect(receipt.verificationStatus).toBe('unverified');
    expect(receipt.state).toBe('SUBMITTED_UNVERIFIED');
    expect(receipt.confirmationEvidenceId).toBeNull();
    expect(receipt.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.receiptId).toBe(`rcpt_${receipt.contentHash.slice(0, 32)}`);
  });

  it('hashes values instead of storing them', () => {
    const receipt = createSubmissionReceipt(input);
    const serialized = JSON.stringify(receipt);

    expect(serialized).not.toContain('Ada Lovelace');
    expect(serialized).not.toContain('ada@example.test');
    expect(serialized).not.toContain('first program');
    expect(receipt.fieldHashes.email).toBe(hashValue('ada@example.test'));
  });

  it('marks the receipt verified when confirmation evidence exists', () => {
    const receipt = createSubmissionReceipt({
      ...input,
      confirmationEvidenceId: 'evidence-42',
    });

    expect(receipt.verificationStatus).toBe('verified');
    expect(receipt.state).toBe('SUBMITTED_VERIFIED');
    expect(receipt.confirmationEvidenceId).toBe('evidence-42');
  });

  it('is immutable', () => {
    const receipt = createSubmissionReceipt(input);

    expect(Object.isFrozen(receipt)).toBe(true);
    expect(Object.isFrozen(receipt.fieldHashes)).toBe(true);
    expect(Object.isFrozen(receipt.answerHashes)).toBe(true);
    expect(() => {
      (receipt as { jobVersion: string }).jobVersion = 'job-v8';
    }).toThrow();
  });

  it('is deterministic for identical submissions', () => {
    const first = createSubmissionReceipt(input);
    const second = createSubmissionReceipt({ ...input, submittedAt: fixedNow });

    expect(second.contentHash).toBe(first.contentHash);
    expect(second.receiptId).toBe(first.receiptId);
  });

  it('changes the hash when a submitted field changes', () => {
    const original = createSubmissionReceipt(input);
    const edited = createSubmissionReceipt({
      ...input,
      submittedFields: { ...input.submittedFields, email: 'eve@example.test' },
    });

    expect(edited.contentHash).not.toBe(original.contentHash);
  });

  it('is not sensitive to field insertion order', () => {
    const reordered = createSubmissionReceipt({
      ...input,
      submittedFields: {
        coverLetter: input.submittedFields.coverLetter,
        email: input.submittedFields.email,
        fullName: input.submittedFields.fullName,
      },
    });

    expect(reordered.contentHash).toBe(createSubmissionReceipt(input).contentHash);
  });
});

describe('verifyReceipt', () => {
  it('accepts an untouched receipt', () => {
    expect(verifyReceipt(createSubmissionReceipt(input))).toBe(true);
  });

  it('rejects a tampered copy', () => {
    const receipt = createSubmissionReceipt(input);
    const copy = structuredClone(receipt);
    copy.jobVersion = 'job-v8';

    expect(verifyReceipt(copy)).toBe(false);
  });

  it('rejects a forged verification status', () => {
    const receipt = createSubmissionReceipt(input);
    const copy = structuredClone(receipt);
    copy.verificationStatus = 'verified';

    expect(verifyReceipt(copy)).toBe(false);
  });

  it('matches the documented content hash', () => {
    const receipt = createSubmissionReceipt(input);
    const { contentHash, receiptId, ...body } = receipt;

    expect(computeContentHash(body)).toBe(contentHash);
    expect(receiptId).toBe(`rcpt_${contentHash.slice(0, 32)}`);
  });
});

describe('receiptForSnapshot', () => {
  it('refuses to issue a receipt before submission', () => {
    const machine = new ApplicationStateMachine('app-1', { initialState: 'EXECUTING' });

    expect(() => receiptForSnapshot(machine.snapshot(), input)).toThrow(
      /needs a submitted application/
    );
  });

  it('rejects a receipt for a different application', () => {
    const machine = new ApplicationStateMachine('app-1', { initialState: 'EXECUTING' });
    const { snapshot } = submitApplication(machine, input);

    expect(snapshot.state).toBe('SUBMITTED_UNVERIFIED');
    expect(() => submitApplication(machine, { ...input, applicationId: 'app-2' })).toThrow(
      /tracks app-1/
    );
  });
});

describe('submitApplication', () => {
  it('moves an executed application to SUBMITTED_UNVERIFIED and returns the receipt', () => {
    const machine = new ApplicationStateMachine('app-1', { initialState: 'EXECUTING' });

    const { snapshot, receipt } = submitApplication(machine, input);

    expect(snapshot.state).toBe('SUBMITTED_UNVERIFIED');
    expect(snapshot.audit.at(-1)).toMatchObject({
      from: 'EXECUTING',
      to: 'SUBMITTED_UNVERIFIED',
      actor: 'connector',
    });
    expect(receipt.state).toBe('SUBMITTED_UNVERIFIED');
    expect(verifyReceipt(receipt)).toBe(true);
  });

  it('verifies the application when the connector supplies confirmation evidence', () => {
    const machine = new ApplicationStateMachine('app-1', { initialState: 'EXECUTING' });

    const { snapshot, receipt } = submitApplication(machine, {
      ...input,
      confirmationEvidenceId: 'evidence-42',
    });

    expect(snapshot.state).toBe('SUBMITTED_VERIFIED');
    expect(snapshot.audit.map((entry) => entry.to)).toEqual([
      'SUBMITTED_UNVERIFIED',
      'SUBMITTED_VERIFIED',
    ]);
    expect(receipt.verificationStatus).toBe('verified');
  });

  it('does not touch the application when the transition is impossible', () => {
    const machine = new ApplicationStateMachine('app-1');

    expect(() => submitApplication(machine, input)).toThrow(/Cannot move an application/);
    expect(machine.current).toBe('DISCOVERED');
  });
});
