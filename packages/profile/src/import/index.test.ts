import { describe, it, expect } from 'vitest';
import { importProfile, validateFile, getFileTypeFromMime } from './index.js';
import type { ImportRequest } from '../types.js';

describe('Profile Import', () => {
  describe('getFileTypeFromMime', () => {
    it('should return pdf for PDF MIME type', () => {
      const result = getFileTypeFromMime('application/pdf');
      expect(result).toBe('pdf');
    });
    
    it('should return docx for DOCX MIME type', () => {
      const result = getFileTypeFromMime('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(result).toBe('docx');
    });
    
    it('should return null for unsupported MIME type', () => {
      const result = getFileTypeFromMime('text/plain');
      expect(result).toBeNull();
    });
  });
  
  describe('validateFile', () => {
    it('should return isValid: false for empty file', async () => {
      const emptyBuffer = Buffer.from('');
      
      const result = await validateFile(emptyBuffer, 'pdf');
      
      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
    
    it('should return isValid: false for invalid PDF', async () => {
      const invalidBuffer = Buffer.from('not a pdf');
      
      const result = await validateFile(invalidBuffer, 'pdf');
      
      expect(result.isValid).toBe(false);
    });
  });
  
  describe('importProfile', () => {
    it('should handle invalid file gracefully', async () => {
      const request: ImportRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('invalid content'),
        fileName: 'test.pdf',
        fileType: 'pdf',
      };
      
      const result = await importProfile(request);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should return processing time', async () => {
      const request: ImportRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('invalid content'),
        fileName: 'test.pdf',
        fileType: 'pdf',
      };
      
      const result = await importProfile(request);
      
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });
  });
});
