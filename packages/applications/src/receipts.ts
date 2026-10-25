/**
 * Submission receipts (T-26).
 *
 * Implements FR-04 / AC-04: every submission produces a receipt carrying the job
 * version, per-field hashes, answer hashes and the confirmation evidence, plus
 * the verification status. Raw field values and raw answers are never stored —
 * only their hashes — so a receipt can be shown to a user without leaking the
 * content of the application.
 */

import { createHash } from 'node:crypto';
import type {
  ApplicationSnapshot,
  ApplicationState,
  ApplicationStateMachine,
} from './state-machine';

export type VerificationStatus = 'unverified' | 'verified';

/** States that may own a receipt: a submission happened, or it was reconciled. */
export const RECEIPT_STATES: readonly ApplicationState[] = [
  'SUBMITTED_UNVERIFIED',
  'SUBMITTED_VERIFIED',
];

export interface SubmissionReceipt {
  /** Stable id derived from the content hash, so identical submissions collapse. */
  receiptId: string;
  applicationId: string;
  jobVersion: string;
  submittedAt: string;
  /** Field name -> sha256 of its submitted value. */
  fieldHashes: Readonly<Record<string, string>>;
  /** sha256 per submitted answer, in the order asked. */
  answerHashes: readonly string[];
  confirmationEvidenceId: string | null;
  verificationStatus: VerificationStatus;
  /** Application state at the moment the receipt was generated. */
  state: ApplicationState;
  /** sha256 over every field above, so any later edit is detectable. */
  contentHash: string;
}

export interface SubmissionInput {
  applicationId: string;
  /** Version of the job posting as submitted; FR-04 requires it because the posting changes. */
  jobVersion: string;
  submittedFields: Record<string, string>;
  answers: readonly string[];
  confirmationEvidenceId?: string;
  submittedAt?: Date;
}

export function hashValue(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hashFields(fields: Record<string, string>): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const name of Object.keys(fields).sort()) {
    hashes[name] = hashValue(fields[name]);
  }
  return hashes;
}

/** Canonical JSON: object keys sorted at every depth, so hashes are order-independent. */
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}

/** sha256 over the receipt body, excluding the hash itself. */
export function computeContentHash(
  receipt: Omit<SubmissionReceipt, 'contentHash' | 'receiptId'>
): string {
  return hashValue(canonicalJson(receipt));
}

/**
 * Builds a frozen receipt. Immutability is enforced twice: the object is deep
 * frozen, and `contentHash` makes any copy-then-edit detectable via
 * `verifyReceipt`.
 */
export function createSubmissionReceipt(input: SubmissionInput): SubmissionReceipt {
  const confirmationEvidenceId = input.confirmationEvidenceId ?? null;
  const body: Omit<SubmissionReceipt, 'contentHash' | 'receiptId'> = {
    applicationId: input.applicationId,
    jobVersion: input.jobVersion,
    submittedAt: (input.submittedAt ?? new Date()).toISOString(),
    fieldHashes: hashFields(input.submittedFields),
    answerHashes: input.answers.map(hashValue),
    confirmationEvidenceId,
    verificationStatus: confirmationEvidenceId ? 'verified' : 'unverified',
    state: confirmationEvidenceId ? 'SUBMITTED_VERIFIED' : 'SUBMITTED_UNVERIFIED',
  };

  const contentHash = computeContentHash(body);

  return deepFreeze({
    ...body,
    receiptId: `rcpt_${contentHash.slice(0, 32)}`,
    contentHash,
  });
}

/** Recomputes the content hash and reports whether the receipt is intact. */
export function verifyReceipt(receipt: SubmissionReceipt): boolean {
  const { contentHash, receiptId, ...body } = receipt;
  const expected = computeContentHash(body);
  return contentHash === expected && receiptId === `rcpt_${expected.slice(0, 32)}`;
}

function assertSubmitted(snapshot: ApplicationSnapshot): void {
  if (!RECEIPT_STATES.includes(snapshot.state)) {
    throw new Error(
      `A receipt needs a submitted application; ${snapshot.id} is in ${snapshot.state}`
    );
  }
}

/**
 * Generates the receipt for an application that has already been submitted.
 *
 * The receipt is derived from the state machine snapshot, so it cannot be
 * issued for an application that never left EXECUTING.
 */
export function receiptForSnapshot(
  snapshot: ApplicationSnapshot,
  input: Omit<SubmissionInput, 'applicationId'>
): SubmissionReceipt {
  assertSubmitted(snapshot);
  return createSubmissionReceipt({ ...input, applicationId: snapshot.id });
}

export interface SubmissionOutcome {
  snapshot: ApplicationSnapshot;
  receipt: SubmissionReceipt;
}

/**
 * The submission seam a connector calls once the ATS has answered: it performs
 * the state transitions and returns the receipt for that exact submission.
 *
 * A connector that got no confirmation passes no `confirmationEvidenceId`; the
 * application then stays SUBMITTED_UNVERIFIED and the receipt says so.
 */
export function submitApplication(
  machine: ApplicationStateMachine,
  input: SubmissionInput & { reason?: string; actor?: string }
): SubmissionOutcome {
  if (input.applicationId !== machine.id) {
    throw new Error(
      `Receipt is for application ${input.applicationId}, but the machine tracks ${machine.id}`
    );
  }

  const reason = input.reason ?? 'ATS returned a submission result';
  const actor = input.actor ?? 'connector';

  machine.transition('SUBMITTED_UNVERIFIED', { reason, actor });

  if (input.confirmationEvidenceId) {
    machine.transition('SUBMITTED_VERIFIED', {
      reason,
      actor,
      verificationEvidenceId: input.confirmationEvidenceId,
    });
  }

  const snapshot = machine.snapshot();
  return { snapshot, receipt: receiptForSnapshot(snapshot, input) };
}
