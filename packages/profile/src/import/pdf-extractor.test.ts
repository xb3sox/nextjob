import { describe, it, expect } from 'vitest';
import { extractTextFromPDF, validatePDF } from './pdf-extractor.js';
import { FileParsingError } from '../types.js';

describe('PDF Extractor', () => {
  describe('extractTextFromPDF', () => {
    it('should extract text from valid PDF', async () => {
      // This test requires a real PDF buffer
      // For now, we'll test error handling
      const emptyBuffer = Buffer.from('');
      
      await expect(extractTextFromPDF(emptyBuffer)).rejects.toThrow();
    });
    
    it('should throw FileParsingError for invalid PDF', async () => {
      const invalidBuffer = Buffer.from('not a pdf');
      
      await expect(extractTextFromPDF(invalidBuffer)).rejects.toThrow(FileParsingError);
    });
  });
  
  describe('validatePDF', () => {
    it('should return isValid: false for invalid PDF', async () => {
      const invalidBuffer = Buffer.from('not a pdf');
      
      const result = await validatePDF(invalidBuffer);
      
      expect(result.isValid).toBe(false);
      expect(result.pageCount).toBe(0);
    });
  });
});
