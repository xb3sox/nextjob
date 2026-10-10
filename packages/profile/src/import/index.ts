import { extractTextFromPDF, validatePDF } from './pdf-extractor.js';
import { extractTextFromDOCX, validateDOCX } from './docx-extractor.js';
import { extractProfileWithAI, validateExtractedData } from './ai-extraction.js';
import {
  type ImportRequest,
  type ImportResult,
  type FileType,
  FILE_SIZE_LIMITS,
  FileParsingError,
  ProfileImportError,
} from '../types.js';

// ============================================================================
// Profile Import Service
// ============================================================================

/**
 * Main entry point for profile import
 * Handles file parsing, text extraction, and AI-powered data extraction
 */
export async function importProfile(request: ImportRequest): Promise<ImportResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    // Step 1: Validate file size
    validateFileSize(request.file);
    
    // Step 2: Extract text from file
    const text = await extractTextFromFile(request.file, request.fileType);
    
    // Step 3: Validate text length
    validateTextLength(text, warnings);
    
    // Step 4: Extract profile data using AI
    const extractionResult = await extractProfileWithAI({
      text,
      userId: request.userId,
      tenantId: request.tenantId,
    });
    
    // Step 5: Validate extracted data
    const validatedData = validateExtractedData(extractionResult.data);
    
    // Step 6: Calculate confidence and add warnings
    if (extractionResult.confidence < 0.6) {
      warnings.push('Low confidence score - manual review recommended');
    }
    
    if (!validatedData.personalInfo.email) {
      warnings.push('Email address not detected');
    }
    
    if (!validatedData.experience || validatedData.experience.length === 0) {
      warnings.push('No work experience detected');
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      extractedData: validatedData,
      confidence: extractionResult.confidence,
      warnings,
      errors: [],
      processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (error instanceof ProfileImportError) {
      return {
        success: false,
        confidence: 0,
        warnings,
        errors: [error.message],
        processingTime,
      };
    }
    
    return {
      success: false,
      confidence: 0,
      warnings,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      processingTime,
    };
  }
}

/**
 * Validates file size
 */
function validateFileSize(buffer: Buffer): void {
  if (buffer.length > FILE_SIZE_LIMITS.maxFileSize) {
    throw new FileParsingError(
      `File size exceeds maximum limit of ${FILE_SIZE_LIMITS.maxFileSize / 1024 / 1024} MB`,
      'pdf' // Will be overridden by actual file type
    );
  }
  
  if (buffer.length === 0) {
    throw new FileParsingError('File is empty', 'pdf');
  }
}

/**
 * Extracts text from file based on file type
 */
async function extractTextFromFile(buffer: Buffer, fileType: FileType): Promise<string> {
  switch (fileType) {
    case 'pdf':
      return await extractTextFromPDF(buffer);
    case 'docx':
      return await extractTextFromDOCX(buffer);
    default:
      throw new FileParsingError(`Unsupported file type: ${fileType}`, fileType);
  }
}

/**
 * Validates text length
 */
function validateTextLength(text: string, warnings: string[]): void {
  if (text.length < FILE_SIZE_LIMITS.minTextLength) {
    warnings.push(`Text length (${text.length}) is below minimum threshold (${FILE_SIZE_LIMITS.minTextLength})`);
  }
  
  if (text.length > FILE_SIZE_LIMITS.maxTextLength) {
    warnings.push(`Text length (${text.length}) exceeds recommended maximum (${FILE_SIZE_LIMITS.maxTextLength})`);
  }
}

/**
 * Validates file type from MIME type
 */
export function getFileTypeFromMime(mimeType: string): FileType | null {
  const mimeToType: Record<string, FileType> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  
  return mimeToType[mimeType] || null;
}

/**
 * Validates file before processing
 */
export async function validateFile(buffer: Buffer, fileType: FileType): Promise<{
  isValid: boolean;
  warnings: string[];
  metadata?: any;
}> {
  const warnings: string[] = [];
  
  try {
    // Validate file size
    validateFileSize(buffer);
    
    // Validate file structure
    let metadata: any;
    
    switch (fileType) {
      case 'pdf':
        const pdfValidation = await validatePDF(buffer);
        if (!pdfValidation.isValid) {
          return { isValid: false, warnings: ['Invalid PDF structure'] };
        }
        metadata = pdfValidation;
        break;
        
      case 'docx':
        const docxValidation = await validateDOCX(buffer);
        if (!docxValidation.isValid) {
          return { isValid: false, warnings: docxValidation.warnings };
        }
        warnings.push(...docxValidation.warnings);
        break;
    }
    
    return {
      isValid: true,
      warnings,
      metadata,
    };
  } catch (error) {
    return {
      isValid: false,
      warnings: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

// Re-export types and functions
export * from './pdf-extractor.js';
export * from './docx-extractor.js';
export * from './ai-extraction.js';
export * from '../types.js';
