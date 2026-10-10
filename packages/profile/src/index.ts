// ============================================================================
// Profile Package - Main Export
// ============================================================================

// Import functionality
export * from './import/index.js';
export * from './types.js';

// Claims and evidence management
export * from './claims/index.js';

// Verification workflow
export * from './verification/index.js';

// Preferences management
export * from './preferences/index.js';

// Convenience exports - Import
export { importProfile, validateFile, getFileTypeFromMime } from './import/index.js';
export { extractTextFromPDF, validatePDF, extractPDFMetadata } from './import/pdf-extractor.js';
export { extractTextFromDOCX, extractHTMLFromDOCX, validateDOCX } from './import/docx-extractor.js';
export { extractProfileWithAI, validateExtractedData } from './import/ai-extraction.js';

// Convenience exports - Claims
export { claimsService, ClaimsService } from './claims/claims-service.js';
export { evidenceService, EvidenceService } from './claims/evidence-service.js';

// Convenience exports - Verification
export { verificationService, VerificationService } from './verification/verification-service.js';

// Convenience exports - Preferences
export { preferencesService, PreferencesService } from './preferences/preferences-service.js';
