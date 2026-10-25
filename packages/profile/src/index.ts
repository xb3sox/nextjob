// ============================================================================
// Profile Package - Main Export
// ============================================================================

// Convenience exports - Automation
export {
  AutomationPolicyService,
  automationPolicyService,
} from './automation/automation-policy-service.js';
// Automation policy
export * from './automation/index.js';
// Convenience exports - Claims
export { ClaimsService, claimsService } from './claims/claims-service.js';
export { EvidenceService, evidenceService } from './claims/evidence-service.js';
// Claims and evidence management
export * from './claims/index.js';
export { extractProfileWithAI, validateExtractedData } from './import/ai-extraction.js';
export { extractHTMLFromDOCX, extractTextFromDOCX, validateDOCX } from './import/docx-extractor.js';
// Import functionality
export * from './import/index.js';
// Convenience exports - Import
export { getFileTypeFromMime, importProfile, validateFile } from './import/index.js';
export { extractPDFMetadata, extractTextFromPDF, validatePDF } from './import/pdf-extractor.js';
// Preferences management
export * from './preferences/index.js';
// Convenience exports - Preferences
export { PreferencesService, preferencesService } from './preferences/preferences-service.js';
// Convenience exports - Storage
export {
  EvidenceStorageService,
  evidenceStorageService,
} from './storage/evidence-storage-service.js';
// Storage management
export * from './storage/index.js';
export * from './types.js';
// Verification workflow
export * from './verification/index.js';
// Convenience exports - Verification
export { VerificationService, verificationService } from './verification/verification-service.js';

// ============================================================================
// Shared error names
// ============================================================================

// Several domains declare their own error classes with the same name
// (`VersionConflictError`, `ClaimNotFoundError`, `EvidenceNotFoundError`), so a
// bare `export *` of those barrels is ambiguous. Re-export the canonical class
// explicitly; the domain-specific variants stay importable from their own
// module path.
export { VersionConflictError } from './automation/types.js';
export { ClaimNotFoundError, EvidenceNotFoundError } from './claims/types.js';
