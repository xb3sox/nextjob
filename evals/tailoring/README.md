# Tailoring Evaluation Dataset

This directory contains comprehensive test datasets for evaluating the tailoring engine's accuracy and evidence constraint compliance.

## Purpose

The evaluation dataset ensures that the tailoring engine:
- Generates content only from verified CareerGraph evidence
- Maintains 100% evidence traceability
- Produces zero unsupported claims
- Preserves factual accuracy (dates, employers, qualifications)
- Generates high-quality, job-specific content

## Dataset Structure

```
evals/tailoring/
├── datasets/
│   ├── resume_tailoring.json      # Resume variant generation tests
│   ├── cover_letter.json          # Cover letter generation tests
│   ├── application_answers.json   # Application Q&A tests
│   ├── professional_summary.json  # Summary generation tests
│   └── skills_section.json        # Skills section tests
├── scenarios/
│   ├── evidence_complete.json     # Complete evidence scenarios
│   ├── evidence_partial.json      # Partial evidence scenarios
│   └── evidence_constraints.json  # Edge cases and constraints
├── expected_outcomes.json         # Expected results summary
└── README.md                      # This file
```

## Test Case Format

Each test case follows this structure:

```json
{
  "id": "test-001",
  "description": "Tailor resume for software engineer position",
  "careerGraph": {
    "claims": [
      {
        "type": "experience",
        "title": "Senior Software Engineer",
        "content": {
          "company": "Tech Corp",
          "startDate": "2020-01-01",
          "endDate": "2023-12-31",
          "achievements": ["Led team of 5 engineers"]
        },
        "evidenceId": "evidence-123",
        "verificationStatus": "verified"
      }
    ]
  },
  "jobRequirements": {
    "title": "Software Engineer",
    "requiredSkills": ["JavaScript", "React"],
    "experience": "3+ years"
  },
  "tailoringType": "resume",
  "expectedOutput": {
    "sections": [
      {
        "type": "experience",
        "content": "Senior Software Engineer at Tech Corp (2020-2023)",
        "evidenceClaimId": "evidence-123"
      }
    ],
    "unsupportedClaims": []
  }
}
```

## Coverage Requirements

- **Minimum 50 test cases** across all tailoring types
- **100% evidence traceability** - every output must link to a claim
- **Zero unsupported claims** - no fabricated information
- **Coverage of all tailoring types:**
  - Resume variants
  - Cover letters
  - Application answers
  - Professional summaries
  - Skills sections

## Running Evaluations

```bash
# Run all tailoring evaluations
npm run test:eval -- tailoring

# Run specific dataset
npm run test:eval -- tailoring --dataset resume_tailoring

# Generate coverage report
npm run test:eval -- tailoring --coverage
```

## Success Criteria

- ✅ 0 unsupported claims in all test cases
- ✅ 100% evidence coverage (all outputs traceable)
- ✅ All dates preserved accurately
- ✅ All employers preserved accurately
- ✅ All qualifications preserved accurately
- ✅ No skill level upgrades without evidence
- ✅ No fabricated achievements

## Maintenance

- Add new test cases when tailoring logic changes
- Update expected outputs when generation improves
- Review evidence traceability quarterly
- Monitor unsupported claim rate in production

## Related Documentation

- [Tailoring Engine](../../packages/tailoring/src/tailoring-engine.ts)
- [PRD - Tailoring Requirements](../../docs/PRD.md#tailoring)
- [TASKS.md - T-16](../../TASKS.md#t-16)
