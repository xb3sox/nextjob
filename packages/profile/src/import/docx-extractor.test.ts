import { describe, expect, it } from 'vitest';
import { FileParsingError } from '../types.js';
import { extractTextFromDOCX, validateDOCX } from './docx-extractor.js';

describe('DOCX Extractor', () => {
  describe('extractTextFromDOCX', () => {
    it('should throw FileParsingError for invalid DOCX', async () => {
      const invalidBuffer = Buffer.from('not a docx');

      await expect(extractTextFromDOCX(invalidBuffer)).rejects.toThrow(FileParsingError);
    });
  });

  describe('validateDOCX', () => {
    it('should return isValid: false for invalid DOCX', async () => {
      const invalidBuffer = Buffer.from('not a docx');

      const result = await validateDOCX(invalidBuffer);

      expect(result.isValid).toBe(false);
    });
  });
});
