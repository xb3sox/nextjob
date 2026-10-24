// ============================================================================
// Jobs Module - Main Export
// ============================================================================

export * from './job-deduplication.js';
export { JobDeduplicationService, jobDeduplicationService } from './job-deduplication.js';
export * from './job-ingestion-service.js';
export { JobIngestionService, jobIngestionService } from './job-ingestion-service.js';
export * from './job-normalization.js';
// Convenience exports
export { JobNormalizationService, jobNormalizationService } from './job-normalization.js';
export * from './types.js';
