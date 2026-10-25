import { PDFParse } from 'pdf-parse';
import { FileParsingError } from '../types.js';

// ============================================================================
// PDF Extraction
// ============================================================================

/**
 * Runs a parse callback against a `PDFParse` instance for the supplied buffer.
 * The underlying PDF.js document is always released, including on failure.
 */
async function withPDFParser<T>(
  buffer: Buffer,
  parse: (parser: PDFParse) => Promise<T>
): Promise<T> {
  const parser = new PDFParse({ data: buffer });

  try {
    return await parse(parser);
  } finally {
    // Cleanup can fail on a malformed document; that must not mask the parse
    // result or the original error.
    await parser.destroy().catch(() => undefined);
  }
}

/**
 * Extracts text content from a PDF file
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await withPDFParser(buffer, (parser) => parser.getText());

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
    const { textResult, infoResult } = await withPDFParser(buffer, async (parser) => {
      const textResult = await parser.getText();
      const infoResult = await parser.getInfo();

      return { textResult, infoResult };
    });

    return {
      isValid: true,
      pageCount: textResult.total,
      info: infoResult.info,
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
    const infoResult = await withPDFParser(buffer, (parser) => parser.getInfo());
    const info = infoResult.info ?? {};

    return {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
      modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
    };
  } catch (_error) {
    return {};
  }
}
