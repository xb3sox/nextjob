import pdfParse from 'pdf-parse';
import { FileParsingError } from '../types.js';

// ============================================================================
// PDF Extraction
// ============================================================================

/**
 * Extracts text content from a PDF file
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new FileParsingError('PDF file contains no extractable text', 'pdf');
    }

    return data.text;
  } catch (error) {
    if (error instanceof FileParsingError) {
      throw error;
    }

    throw new FileParsingError(
      `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'pdf',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Validates PDF file structure
 */
export async function validatePDF(buffer: Buffer): Promise<{
  isValid: boolean;
  pageCount: number;
  info: any;
}> {
  try {
    const data = await pdfParse(buffer);

    return {
      isValid: true,
      pageCount: data.numpages,
      info: data.info,
    };
  } catch (_error) {
    return {
      isValid: false,
      pageCount: 0,
      info: null,
    };
  }
}

/**
 * Extracts metadata from PDF
 */
export async function extractPDFMetadata(buffer: Buffer): Promise<{
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}> {
  try {
    const data = await pdfParse(buffer);

    return {
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
      creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
      modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
    };
  } catch (_error) {
    return {};
  }
}
