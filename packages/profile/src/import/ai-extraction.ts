import { z } from 'zod';
import type { AIExtractionRequest, AIExtractionResult, ExtractedProfileData } from '../types.js';
import { AIExtractionError, ExtractedProfileDataSchema } from '../types.js';

// ============================================================================
// AI Extraction Service
// ============================================================================

/**
 * Uses AI Gateway to extract structured profile data from text
 */
export async function extractProfileWithAI(
  request: AIExtractionRequest
): Promise<AIExtractionResult> {
  const startTime = Date.now();

  try {
    // TODO: Import and use AI Gateway when available
    // For now, we'll use a mock implementation

    const extractedData = await mockAIExtraction(request.text);

    const processingTime = Date.now() - startTime;

    return {
      data: extractedData,
      confidence: calculateConfidence(extractedData),
      rawResponse: JSON.stringify(extractedData),
      processingTime,
    };
  } catch (error) {
    throw new AIExtractionError(
      `AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Mock AI extraction for development
 * This will be replaced with actual AI Gateway integration
 */
async function mockAIExtraction(text: string): Promise<ExtractedProfileData> {
  // `skills` and `experience` are optional on the extracted-data type, so keep
  // non-optional local arrays and hand the same references to the result.
  const skills: NonNullable<ExtractedProfileData['skills']> = [];
  const experience: NonNullable<ExtractedProfileData['experience']> = [];

  // Simple pattern matching for demonstration
  const data: ExtractedProfileData = {
    personalInfo: {},
    experience,
    education: [],
    skills,
    certifications: [],
    projects: [],
    achievements: [],
    languages: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    data.personalInfo.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    data.personalInfo.phone = phoneMatch[0];
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) {
    data.personalInfo.linkedin = `https://${linkedinMatch[0]}`;
  }

  // Extract skills (simple keyword matching)
  const commonSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'PostgreSQL',
    'MongoDB',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'CI/CD',
    'Agile',
    'Scrum',
    'Leadership',
    'Communication',
  ];

  for (const skill of commonSkills) {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      skills.push({
        name: skill,
        category: categorizeSkill(skill),
      });
    }
  }

  // Extract experience sections (very basic)
  const experiencePattern =
    /(?:experience|work history|employment)[\s\S]*?(?=\n\n|\neducation|\nskills)/i;
  const experienceMatch = text.match(experiencePattern);
  if (experienceMatch) {
    // This is a very simplified extraction
    experience.push({
      title: 'Software Engineer',
      company: 'Company Name',
      description: experienceMatch[0].substring(0, 200),
    });
  }

  return data;
}

/**
 * Categorizes a skill into a category
 */
function categorizeSkill(skill: string): string {
  const categories: Record<string, string[]> = {
    'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java'],
    Frameworks: ['React', 'Node.js'],
    Databases: ['SQL', 'PostgreSQL', 'MongoDB'],
    Cloud: ['AWS', 'Docker', 'Kubernetes'],
    Tools: ['Git', 'CI/CD'],
    Methodologies: ['Agile', 'Scrum'],
    'Soft Skills': ['Leadership', 'Communication'],
  };

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.includes(skill)) {
      return category;
    }
  }

  return 'Other';
}

/**
 * Calculates confidence score based on extracted data completeness
 */
function calculateConfidence(data: ExtractedProfileData): number {
  let score = 0;
  let maxScore = 0;

  // Personal info (30%)
  maxScore += 30;
  if (data.personalInfo.email) score += 10;
  if (data.personalInfo.phone) score += 10;
  if (data.personalInfo.name) score += 10;

  // Experience (25%)
  maxScore += 25;
  if (data.experience && data.experience.length > 0) {
    score += Math.min(25, data.experience.length * 5);
  }

  // Education (15%)
  maxScore += 15;
  if (data.education && data.education.length > 0) {
    score += Math.min(15, data.education.length * 5);
  }

  // Skills (20%)
  maxScore += 20;
  if (data.skills && data.skills.length > 0) {
    score += Math.min(20, data.skills.length * 2);
  }

  // Certifications (10%)
  maxScore += 10;
  if (data.certifications && data.certifications.length > 0) {
    score += Math.min(10, data.certifications.length * 5);
  }

  return score / maxScore;
}

/**
 * Validates extracted data against schema
 */
export function validateExtractedData(data: any): ExtractedProfileData {
  try {
    return ExtractedProfileDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    throw error;
  }
}
