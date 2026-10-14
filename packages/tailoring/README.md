# @nextjob/tailoring

Evidence-constrained tailoring engine for NextJob. Generates resumes, cover letters, application answers, professional summaries, and skills sections from verified CareerGraph evidence only.

## Features

- **Evidence-Only Generation** - All content traces to verified CareerGraph claims
- **Zero Fabrication** - No unsupported claims allowed
- **Constraint Enforcement** - Preserves exact dates, employers, qualifications
- **Multiple Tailoring Types** - Resume, cover letter, application answers, summaries, skills
- **Confidence Scoring** - Quantifies certainty of generated content
- **Full Traceability** - Every output links back to source evidence

## Installation

```bash
npm install @nextjob/tailoring
```

## Usage

### Basic Tailoring

```typescript
import { tailoringEngine } from '@nextjob/tailoring';

const result = await tailoringEngine.tailor({
  type: 'resume',
  careerGraph: {
    claims: [
      {
        id: 'claim-1',
        type: 'experience',
        title: 'Senior Software Engineer',
        content: {
          company: 'Tech Corp',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          achievements: ['Led team of 5 engineers'],
        },
        evidenceId: 'evidence-1',
        verificationStatus: 'verified',
        confidence: 0.95,
      },
    ],
  },
  jobRequirements: {
    title: 'Software Engineer',
    requiredSkills: ['JavaScript', 'React'],
  },
});

console.log(result.content);
console.log(result.evidenceTraceability);
```

### Tailoring Types

#### Resume
```typescript
const resume = await tailoringEngine.tailor({
  type: 'resume',
  careerGraph,
  jobRequirements,
});
```

#### Cover Letter
```typescript
const coverLetter = await tailoringEngine.tailor({
  type: 'cover_letter',
  careerGraph,
  jobRequirements,
});
```

#### Application Answer
```typescript
const answer = await tailoringEngine.tailor({
  type: 'application_answer',
  careerGraph,
  jobRequirements,
  question: 'Why are you qualified for this role?',
});
```

#### Professional Summary
```typescript
const summary = await tailoringEngine.tailor({
  type: 'professional_summary',
  careerGraph,
  jobRequirements,
  options: { maxLength: 200 },
});
```

#### Skills Section
```typescript
const skills = await tailoringEngine.tailor({
  type: 'skills_section',
  careerGraph,
  jobRequirements,
});
```

## Evidence Constraints

The engine enforces strict evidence constraints:

### 1. No Fabrication
All content must trace to verified CareerGraph claims. Unverified or low-confidence claims are rejected.

### 2. Preserve Exact Values
- Company names are preserved exactly
- Dates are preserved exactly
- Employer names are preserved exactly
- Qualifications are preserved exactly

### 3. No Upgrades
- Skill levels cannot be upgraded beyond evidence
- Job titles cannot be upgraded beyond evidence
- Metrics cannot be exaggerated

### 4. Confidence Threshold
Only claims with confidence ≥ 0.8 are used.

## API Reference

### `tailor(request: TailoringRequest): Promise<TailoringResult>`

Main method for generating tailored content.

**Parameters:**
- `type` - Tailoring type ('resume', 'cover_letter', 'application_answer', 'professional_summary', 'skills_section')
- `careerGraph` - Career graph with verified claims
- `jobRequirements` - Job requirements to tailor for
- `question` - Question for application_answer type
- `options` - Tailoring options (maxLength, tone, etc.)

**Returns:**
- `type` - Tailoring type
- `content` - Generated content
- `sections` - Structured sections (for resume/cover letter)
- `skills` - Skills list (for skills_section)
- `evidenceTraceability` - Evidence trace for each output
- `unsupportedClaims` - Claims that couldn't be used
- `confidence` - Overall confidence score (0-1)
- `warnings` - Any warnings generated

### Error Types

- `InvalidTailoringRequestError` - Request validation failed
- `InsufficientEvidenceError` - Not enough verified evidence
- `EvidenceConstraintViolationError` - Evidence constraints violated

## Testing

```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Evaluation Dataset

Comprehensive evaluation dataset available in `evals/tailoring/`:
- 50 test cases
- 5 tailoring types
- 3 scenarios (complete, partial, constraints)
- 100% evidence traceability validation

Run evaluations:
```bash
npm run test:eval -- tailoring
```

## License

Private - Part of NextJob project
