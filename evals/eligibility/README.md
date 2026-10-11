# Eligibility Evaluation Dataset

This directory contains comprehensive test datasets for evaluating the eligibility engine's accuracy and reliability.

## Purpose

The evaluation dataset ensures that the eligibility engine:
- Correctly identifies eligible candidates (true positives)
- Correctly identifies ineligible candidates (true negatives)
- Returns "unknown" when information is insufficient (not false positives)
- Maintains a false-positive rate ≤ 2% (per PRD G-04)

## Dataset Structure

```
evals/eligibility/
├── datasets/
│   ├── location.json           # Location-based eligibility tests
│   ├── work_authorization.json # Work authorization tests
│   ├── sponsorship.json        # Sponsorship requirement tests
│   ├── license.json            # Professional license tests
│   ├── certification.json      # Certification tests
│   ├── education.json          # Education requirement tests
│   ├── experience.json         # Experience requirement tests
│   ├── skill.json              # Skill requirement tests
│   ├── language.json           # Language proficiency tests
│   └── clearance.json          # Security clearance tests
├── scenarios/
│   ├── complete_profiles.json  # Fully specified profiles
│   ├── partial_profiles.json   # Partially specified profiles
│   └── edge_cases.json         # Edge cases and boundary conditions
├── expected_outcomes.json      # Expected results for all test cases
└── README.md                   # This file
```

## Test Case Format

Each test case follows this structure:

```json
{
  "id": "test-001",
  "description": "US citizen applying for US-based remote job",
  "userProfile": {
    "location": { "country": "US", "city": "San Francisco" },
    "workAuthorization": { "authorizations": ["US Citizen"] },
    "skills": [{ "name": "JavaScript" }, { "name": "React" }]
  },
  "job": {
    "location": { "country": "US", "remote": true },
    "requiredSkills": ["JavaScript"]
  },
  "rules": [
    {
      "checkType": "location",
      "condition": { "countries": ["US"] }
    },
    {
      "checkType": "skill",
      "condition": { "requiredSkills": ["JavaScript"] }
    }
  ],
  "expectedOutcome": {
    "status": "eligible",
    "confidence": 1.0,
    "checks": [
      { "type": "location", "status": "eligible" },
      { "type": "skill", "status": "eligible" }
    ]
  }
}
```

## Coverage Requirements

- **Minimum 100 test cases** across all eligibility dimensions
- **At least 10 test cases per check type**
- **Include positive, negative, and unknown scenarios**
- **Cover edge cases and boundary conditions**

## Running Evaluations

```bash
# Run all eligibility evaluations
npm run test:eval -- eligibility

# Run specific dataset
npm run test:eval -- eligibility --dataset location

# Generate coverage report
npm run test:eval -- eligibility --coverage
```

## Success Criteria

- ✅ False-positive rate ≤ 2%
- ✅ True-positive rate ≥ 95%
- ✅ Unknown rate ≤ 10% (when data is insufficient)
- ✅ All test cases pass with expected outcomes

## Maintenance

- Add new test cases when new eligibility rules are introduced
- Update expected outcomes when business logic changes
- Review and expand edge cases quarterly
- Monitor false-positive rate in production

## Related Documentation

- [Eligibility Engine](../../packages/api/src/eligibility/eligibility-engine.ts)
- [PRD - Eligibility Requirements](../../docs/PRD.md#eligibility)
- [TASKS.md - T-13](../../TASKS.md#t-13)
