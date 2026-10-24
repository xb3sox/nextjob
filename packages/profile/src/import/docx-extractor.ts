import mammoth from 'mammoth';
import { FileParsingError } from '../types.js';

// ============================================================================
// DOCX Extraction
// ============================================================================

/**
 * Extracts text content from a DOCX file
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new FileParsingError('DOCX file contains no extractable text', 'docx');
    }

    return result.value;
  } catch (error) {
    if (error instanceof FileParsingError) {
      throw error;
    }

    throw new FileParsingError(
      `Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'docx',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Extracts HTML content from a DOCX file (preserves formatting)
 */
export async function extractHTMLFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new FileParsingError('DOCX file contains no extractable content', 'docx');
    }

    return result.value;
  } catch (error) {
    if (error instanceof FileParsingError) {
      throw error;
    }

    throw new FileParsingError(
      `Failed to extract HTML from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'docx',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Validates DOCX file structure
 */
export async function validateDOCX(buffer: Buffer): Promise<{
  isValid: boolean;
  warnings: string[];
}> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      isValid: result.value && result.value.trim().length > 0,
      warnings: result.messages.map((msg) => msg.message),
    };
  } catch (error) {
    return {
      isValid: false,
      warnings: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
