import { describe, it, expect } from 'vitest';
import { extractProfileWithAI, validateExtractedData } from './ai-extraction.js';

describe('AI Extraction', () => {
  describe('extractProfileWithAI', () => {
    it('should extract email from text', async () => {
      const text = 'Contact me at john.doe@example.com for more information.';
      
      const result = await extractProfileWithAI({
        text,
        userId: 'user-123',
        tenantId: 'tenant-456',
      });
      
      expect(result.data.personalInfo.email).toBe('john.doe@example.com');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
    });
    
    it('should extract phone number from text', async () => {
      const text = 'Call me at (555) 123-4567 or email me.';
      
      const result = await extractProfileWithAI({
        text,
        userId: 'user-123',
        tenantId: 'tenant-456',
      });
      
      expect(result.data.personalInfo.phone).toBeDefined();
    });
    
    it('should extract LinkedIn URL from text', async () => {
      const text = 'Find me on LinkedIn at linkedin.com/in/johndoe';
      
      const result = await extractProfileWithAI({
        text,
        userId: 'user-123',
        tenantId: 'tenant-456',
      });
      
      expect(result.data.personalInfo.linkedin).toBe('https://linkedin.com/in/johndoe');
    });
    
    it('should extract skills from text', async () => {
      const text = 'I have experience with JavaScript, TypeScript, React, and Node.js.';
      
      const result = await extractProfileWithAI({
        text,
        userId: 'user-123',
        tenantId: 'tenant-456',
      });
      
      expect(result.data.skills).toBeDefined();
      expect(result.data.skills.length).toBeGreaterThan(0);
      
      const skillNames = result.data.skills.map(s => s.name);
      expect(skillNames).toContain('JavaScript');
      expect(skillNames).toContain('TypeScript');
      expect(skillNames).toContain('React');
      expect(skillNames).toContain('Node.js');
    });
    
    it('should calculate confidence score', async () => {
      const text = 'John Doe, john@example.com, Software Engineer with 5 years of experience in JavaScript and React.';
      
      const result = await extractProfileWithAI({
        text,
        userId: 'user-123',
        tenantId: 'tenant-456',
      });
      
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
  
  describe('validateExtractedData', () => {
    it('should validate correct data structure', () => {
      const data = {
        personalInfo: {
          email: 'test@example.com',
        },
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        achievements: [],
        languages: [],
      };
      
      const result = validateExtractedData(data);
      
      expect(result).toBeDefined();
      expect(result.personalInfo.email).toBe('test@example.com');
    });
    
    it('should throw error for invalid email', () => {
      const data = {
        personalInfo: {
          email: 'not-an-email',
        },
      };
      
      expect(() => validateExtractedData(data)).toThrow();
    });
    
    it('should handle missing optional fields', () => {
      const data = {
        personalInfo: {},
      };
      
      const result = validateExtractedData(data);
      
      expect(result).toBeDefined();
      expect(result.personalInfo).toBeDefined();
    });
  });
});
