export type OutputTabId = 'receipts' | 'resume' | 'cover-letter';

export interface OutputCategoryMeta {
  id: OutputTabId;
  label: string;
  badge: string;
  description: string;
}

export const OUTPUT_CATEGORIES: OutputCategoryMeta[] = [
  {
    id: 'receipts',
    label: 'Submission Receipts',
    badge: 'Immutable Hash',
    description:
      'Cryptographic SHA-256 receipts confirming ATS submission parameters and frozen answers.',
  },
  {
    id: 'resume',
    label: 'Tailored Resume Snippets',
    badge: 'Evidence Provenance',
    description:
      'Original vs. evidence-constrained tailored bullet comparisons with claim provenance.',
  },
  {
    id: 'cover-letter',
    label: 'Cover Letter Examples',
    badge: 'Zero Hallucinations',
    description:
      'Grounded cover letter excerpts generated exclusively from confirmed profile claims.',
  },
];

export interface SampleReceipt {
  id: string;
  jobTitle: string;
  companyName: string;
  atsName: string;
  submittedAt: string;
  sha256Hash: string;
  candidateName: string;
  candidateEmail: string;
  verifiedFieldsCount: number;
  unsupportedClaimsCount: number;
  fieldHashes: { fieldName: string; hashSnippet: string; status: 'redacted_verified' }[];
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'rec_9f82d1c0a87e44b3',
    jobTitle: 'Senior Frontend Engineer',
    companyName: '[REDACTED_COMPANY_A]',
    atsName: 'Greenhouse ATS',
    submittedAt: '2026-10-28T14:32:00Z',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    candidateName: '[REDACTED_CANDIDATE_NAME]',
    candidateEmail: '[REDACTED_CANDIDATE_EMAIL]',
    verifiedFieldsCount: 18,
    unsupportedClaimsCount: 0,
    fieldHashes: [
      { fieldName: 'full_name', hashSnippet: '8f9b2c...a1e4', status: 'redacted_verified' },
      {
        fieldName: 'work_authorization',
        hashSnippet: '3c7d9a...e2f5',
        status: 'redacted_verified',
      },
      { fieldName: 'years_experience', hashSnippet: '1b4e8f...9c3d', status: 'redacted_verified' },
      { fieldName: 'tailored_summary', hashSnippet: '7a2b5c...4f1e', status: 'redacted_verified' },
    ],
  },
  {
    id: 'rec_4a18e3d902b711e5',
    jobTitle: 'Staff Infrastructure Architect',
    companyName: '[REDACTED_COMPANY_B]',
    atsName: 'Lever ATS',
    submittedAt: '2026-10-29T09:15:22Z',
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    candidateName: '[REDACTED_CANDIDATE_NAME]',
    candidateEmail: '[REDACTED_CANDIDATE_EMAIL]',
    verifiedFieldsCount: 24,
    unsupportedClaimsCount: 0,
    fieldHashes: [
      { fieldName: 'contact_phone', hashSnippet: '9e1d4f...2b8a', status: 'redacted_verified' },
      {
        fieldName: 'relocation_preference',
        hashSnippet: '6c3b0a...8d9e',
        status: 'redacted_verified',
      },
      {
        fieldName: 'salary_expectation',
        hashSnippet: '2f5e8d...1a4c',
        status: 'redacted_verified',
      },
    ],
  },
];

export interface SampleResumeSnippet {
  id: string;
  roleTarget: string;
  claimId: string;
  evidenceSource: string;
  rawBullet: string;
  tailoredBullet: string;
  candidateInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
}

export const SAMPLE_RESUME_SNIPPETS: SampleResumeSnippet[] = [
  {
    id: 'snip_01',
    roleTarget: 'Staff Systems Engineer',
    claimId: 'claim_perf_902 (Verified)',
    evidenceSource: 'lighthouse-audit-report-2025.pdf',
    candidateInfo: {
      name: '[REDACTED_NAME]',
      email: '[REDACTED_EMAIL]',
      phone: '[REDACTED_PHONE]',
      location: '[REDACTED_CITY, REDACTED_COUNTRY]',
    },
    rawBullet: 'Improved frontend speed and reduced page load times for web application users.',
    tailoredBullet:
      'Architected Core Web Vitals performance pipeline across React SPA for [REDACTED_PREVIOUS_EMPLOYER], reducing LCP by 44% (2.8s → 1.55s) and eliminating INP latency for 1.2M monthly active users.',
  },
  {
    id: 'snip_02',
    roleTarget: 'Lead AI Application Engineer',
    claimId: 'claim_ai_gateway_114 (Verified)',
    evidenceSource: 'langfuse-evaluation-suite.json',
    candidateInfo: {
      name: '[REDACTED_NAME]',
      email: '[REDACTED_EMAIL]',
      phone: '[REDACTED_PHONE]',
      location: '[REDACTED_CITY, REDACTED_COUNTRY]',
    },
    rawBullet: 'Built multi-provider LLM integrations with schema validation and safety rules.',
    tailoredBullet:
      'Engineered multi-provider AI gateway routing across OpenAI and Anthropic models with Zod schema validation, achieving <0.01% schema mismatch rate across 500k monthly completions with 100% PII redaction.',
  },
];

export interface SampleCoverLetter {
  id: string;
  targetRole: string;
  targetIndustry: string;
  salutation: string;
  bodyParagraphs: string[];
  groundedClaimIds: string[];
  candidateContact: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
}

export const SAMPLE_COVER_LETTERS: SampleCoverLetter[] = [
  {
    id: 'cl_01',
    targetRole: 'Principal Distributed Systems Engineer',
    targetIndustry: 'Financial Technology / High-Scale Infrastructure',
    salutation: 'Dear Hiring Team,',
    candidateContact: {
      fullName: '[REDACTED_CANDIDATE_NAME]',
      email: '[REDACTED_EMAIL_ADDRESS]',
      phone: '[REDACTED_PHONE_NUMBER]',
      address: '[REDACTED_ADDRESS, REDACTED_CITY]',
    },
    groundedClaimIds: ['claim_dist_sys_301', 'claim_postgres_optim_402', 'claim_temporal_wf_109'],
    bodyParagraphs: [
      'I am writing to express my strong interest in the Principal Distributed Systems Engineer position. Throughout my 8+ years building mission-critical platform software at [REDACTED_PREVIOUS_COMPANY], I have consistently delivered fault-tolerant services grounded in strict data integrity.',
      'In my previous role, I architected event-driven Temporal workflow orchestrations processing over 2.5 million daily state transitions with 99.999% reliability (Claim Ref: claim_temporal_wf_109). Additionally, I led PostgreSQL database migration and index partitioning strategies that reduced p99 query latency from 340ms to 18ms under peak load (Claim Ref: claim_postgres_optim_402).',
      'I look forward to discussing how my experience in evidence-backed platform engineering can support your team’s scale and operational objectives.',
    ],
  },
];
