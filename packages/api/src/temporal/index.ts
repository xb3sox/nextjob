// ============================================================================
// Temporal Module - Main Export
// ============================================================================

export * from './client.js';
export * from './worker.js';

// Re-export workflow and activity types for convenience
export type {
  ConnectorExecutionParams,
  ConnectorExecutionResult,
} from '../workflows/connector-execution.js';

export type {
  ExecuteATSConnectorParams,
  ExecuteATSConnectorResult,
  VerifySubmissionParams,
  VerifySubmissionResult,
  CheckDuplicateParams,
  CheckDuplicateResult,
} from '../activities/ats-connector.js';
