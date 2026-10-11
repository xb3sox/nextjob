// ============================================================================
// Jobs Module - Main Export
// ============================================================================

export * from './types.js';
export * from './job-normalization.js';
export * from './job-deduplication.js';
export * from './job-ingestion-service.js';

// Convenience exports
export { jobNormalizationService, JobNormalizationService } from './job-normalization.js';
export { jobDeduplicationService, JobDeduplicationService } from './job-deduplication.js';
export { jobIngestionService, JobIngestionService } from './job-ingestion-service.js';
