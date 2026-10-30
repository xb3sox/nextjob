export const CANONICAL_ORIGIN = 'https://nextjob.ai';

export interface SchemaEntity {
  '@type': string;
  '@id'?: string;
  [key: string]: unknown;
}

export interface GraphSchema {
  '@context': string;
  '@graph': SchemaEntity[];
}

export const NEXTJOB_ORGANIZATION: SchemaEntity = {
  '@type': 'Organization',
  '@id': `${CANONICAL_ORIGIN}/#organization`,
  name: 'NextJob',
  url: CANONICAL_ORIGIN,
  logo: `${CANONICAL_ORIGIN}/logo.png`,
  description:
    'The trustworthy AI career agent that converts verified career evidence into eligible, high-quality applications.',
  sameAs: ['https://github.com/nextjob'],
  knowsAbout: [
    'AI Career Agent',
    'Career Graph',
    'Automated Job Applications',
    'Submission Verification Receipts',
    'Resume Tailoring',
    'Work Eligibility Verification',
  ],
};

export const NEXTJOB_WEBSITE: SchemaEntity = {
  '@type': 'WebSite',
  '@id': `${CANONICAL_ORIGIN}/#website`,
  name: 'NextJob',
  url: CANONICAL_ORIGIN,
  publisher: {
    '@id': `${CANONICAL_ORIGIN}/#organization`,
  },
  description:
    'NextJob — Apply with Proof. AI career agent that turns verified career evidence into eligible applications.',
};

export const NEXTJOB_SOFTWARE_APPLICATION: SchemaEntity = {
  '@type': 'SoftwareApplication',
  '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  name: 'NextJob AI Career Agent',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: CANONICAL_ORIGIN,
  description:
    'AI career agent that converts verified career evidence into eligible, high-quality applications with proof for every claim.',
  featureList: [
    'Zero-hallucination resume and cover letter tailoring',
    'Pre-application eligibility checks and sponsorship verification',
    'Automated ATS submissions with immutable receipt generation',
    'Evidence-backed Career Graph management',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@id': `${CANONICAL_ORIGIN}/#organization`,
  },
};

export const NEXTJOB_DEFINED_TERMS: SchemaEntity = {
  '@type': 'DefinedTermSet',
  '@id': `${CANONICAL_ORIGIN}/#terms`,
  name: 'NextJob Platform Terminology',
  definedTerm: [
    {
      '@type': 'DefinedTerm',
      name: 'AI Career Agent',
      description:
        'An autonomous assistant that finds matching job opportunities, evaluates candidate eligibility, tailors application materials, and submits applications on behalf of the candidate.',
    },
    {
      '@type': 'DefinedTerm',
      name: 'Career Graph',
      description:
        "A structured, evidence-backed representation of a user's career profile, including verified skills, work achievements, education, and credentials.",
    },
    {
      '@type': 'DefinedTerm',
      name: 'Submission Receipt',
      description:
        'An immutable, cryptographically verifiable proof emitted for every completed application submission, providing transparency to job seekers and employers.',
    },
    {
      '@type': 'DefinedTerm',
      name: 'Eligibility Engine',
      description:
        'A deterministic pre-filtering system that verifies candidate eligibility (including work authorization, location, security clearance, and skill prerequisites) before an application is submitted.',
    },
  ],
};

export const NEXTJOB_FAQ_PAGE: SchemaEntity = {
  '@type': 'FAQPage',
  '@id': `${CANONICAL_ORIGIN}/#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is this different from other AI tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We only generate content from your verified profile — no hallucinated claims. We check eligibility before you apply, and every submission includes an immutable receipt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data safe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Encryption at rest and in transit, never sold, exportable or deletable at any time. GDPR compliant.',
      },
    },
    {
      '@type': 'Question',
      name: "What if I'm an international candidate?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We check work authorization, sponsorship requirements, and location restrictions before showing you opportunities — no wasted applications.',
      },
    },
  ],
};

/**
 * Returns the full JSON-LD schema graph for NextJob, optimized for AI search crawlers and structured parsing.
 */
export function getStructuredData(): GraphSchema {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      NEXTJOB_ORGANIZATION,
      NEXTJOB_WEBSITE,
      NEXTJOB_SOFTWARE_APPLICATION,
      NEXTJOB_DEFINED_TERMS,
      NEXTJOB_FAQ_PAGE,
    ],
  };
}

/**
 * Returns serialized JSON-LD string ready to be injected into an HTML script element.
 */
export function getStructuredDataJson(): string {
  return JSON.stringify(getStructuredData(), null, 2);
}
