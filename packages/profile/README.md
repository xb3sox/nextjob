# @nextjob/profile

Profile import and extraction package for NextJob. Handles PDF and DOCX file parsing with AI-powered data extraction.

## Features

- **PDF Extraction** - Extract text from PDF resumes
- **DOCX Extraction** - Extract text from Word documents
- **AI-Powered Extraction** - Use AI Gateway to extract structured profile data
- **Data Validation** - Zod schema validation for all extracted data
- **Confidence Scoring** - Calculate confidence scores for extracted data
- **Error Handling** - Comprehensive error handling with structured responses
- **Type Safety** - Full TypeScript support

## Installation

```bash
bun install
```

## Usage

### Basic Import

```typescript
import { importProfile } from '@nextjob/profile';
import fs from 'fs';

const fileBuffer = fs.readFileSync('resume.pdf');

const result = await importProfile({
  userId: 'user-123',
  tenantId: 'tenant-456',
  file: fileBuffer,
  fileName: 'resume.pdf',
  fileType: 'pdf',
});

if (result.success) {
  console.log('Extracted data:', result.extractedData);
  console.log('Confidence:', result.confidence);
  console.log('Warnings:', result.warnings);
} else {
  console.error('Import failed:', result.errors);
}
```

### PDF Extraction

```typescript
import { extractTextFromPDF, validatePDF } from '@nextjob/profile';

const buffer = fs.readFileSync('resume.pdf');

// Validate PDF
const validation = await validatePDF(buffer);
console.log('Valid:', validation.isValid);
console.log('Pages:', validation.pageCount);

// Extract text
const text = await extractTextFromPDF(buffer);
console.log('Extracted text:', text);
```

### DOCX Extraction

```typescript
import { extractTextFromDOCX, extractHTMLFromDOCX } from '@nextjob/profile';

const buffer = fs.readFileSync('resume.docx');

// Extract plain text
const text = await extractTextFromDOCX(buffer);

// Extract HTML (preserves formatting)
const html = await extractHTMLFromDOCX(buffer);
```

### AI Extraction

```typescript
import { extractProfileWithAI } from '@nextjob/profile';

const text = 'John Doe, Software Engineer with 5 years of experience...';

const result = await extractProfileWithAI({
  text,
  userId: 'user-123',
  tenantId: 'tenant-456',
});

console.log('Extracted data:', result.data);
console.log('Confidence:', result.confidence);
```

### File Validation

```typescript
import { validateFile, getFileTypeFromMime } from '@nextjob/profile';

const buffer = fs.readFileSync('resume.pdf');

// Validate file
const validation = await validateFile(buffer, 'pdf');
console.log('Valid:', validation.isValid);
console.log('Warnings:', validation.warnings);

// Get file type from MIME
const fileType = getFileTypeFromMime('application/pdf');
console.log('File type:', fileType); // 'pdf'
```

## API Reference

### `importProfile(request: ImportRequest): Promise<ImportResult>`

Main entry point for profile import.

**Parameters:**
- `userId` - User ID
- `tenantId` - Tenant ID
- `file` - File buffer
- `fileName` - Original file name
- `fileType` - File type ('pdf' | 'docx')

**Returns:**
```typescript
{
  success: boolean;
  extractedData?: ExtractedProfileData;
  confidence: number;
  warnings: string[];
  errors: string[];
  processingTime: number;
}
```

### `extractTextFromPDF(buffer: Buffer): Promise<string>`

Extracts text from PDF file.

### `extractTextFromDOCX(buffer: Buffer): Promise<string>`

Extracts text from DOCX file.

### `extractHTMLFromDOCX(buffer: Buffer): Promise<string>`

Extracts HTML from DOCX file (preserves formatting).

### `extractProfileWithAI(request: AIExtractionRequest): Promise<AIExtractionResult>`

Uses AI to extract structured profile data from text.

### `validateFile(buffer: Buffer, fileType: FileType): Promise<ValidationResult>`

Validates file before processing.

### `getFileTypeFromMime(mimeType: string): FileType | null`

Gets file type from MIME type.

## Data Schema

### ExtractedProfileData

```typescript
{
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills?: Array<{
    name: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    expirationDate?: string;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  achievements?: Array<{
    title: string;
    description?: string;
    date?: string;
    issuer?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency?: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
  }>;
}
```

## Error Handling

All errors extend `ProfileImportError`:

```typescript
import { ProfileImportError, FileParsingError, AIExtractionError, ValidationError } from '@nextjob/profile';

try {
  await importProfile(request);
} catch (error) {
  if (error instanceof FileParsingError) {
    console.error('File parsing failed:', error.fileType);
  } else if (error instanceof AIExtractionError) {
    console.error('AI extraction failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.validationErrors);
  }
}
```

## File Size Limits

```typescript
{
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  maxTextLength: 100000, // 100,000 characters
  minTextLength: 100, // 100 characters
}
```

## Supported File Types

- **PDF** - `application/pdf`
- **DOCX** - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Testing

```bash
bun test
```

## License

Private - Part of NextJob project
