export const CANONICAL_ORIGIN = 'https://nextjob.ai';

export interface SchemaEntity {
  '@type': string | string[];
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
  slogan: 'Apply with Proof',
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
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@nextjob.ai',
    url: `${CANONICAL_ORIGIN}/#faq`,
  },
  knowsLanguage: ['en'],
  publishingPrinciples: `${CANONICAL_ORIGIN}/privacy`,
  hasOfferCatalog: {
    '@id': `${CANONICAL_ORIGIN}/#offercatalog`,
  },
};

export const NEXTJOB_OFFER_FREE: SchemaEntity = {
  '@type': 'Offer',
  '@id': `${CANONICAL_ORIGIN}/#offer-free`,
  name: 'Free Tier',
  description:
    'Build your verified profile, discover eligible jobs, and track applications at no cost.',
  price: '0',
  priceCurrency: 'USD',
  category: 'Free',
  itemOffered: {
    '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  },
};

export const NEXTJOB_OFFER_SEARCH: SchemaEntity = {
  '@type': 'Offer',
  '@id': `${CANONICAL_ORIGIN}/#offer-search`,
  name: 'Search Pass',
  description:
    'Full job matching, evidence-backed application tailoring, submission receipt generation, and interview preparation.',
  price: '39.00',
  priceCurrency: 'USD',
  category: 'Subscription',
  priceSpecification: {
    '@type': 'UnitPriceSpecification',
    price: '39.00',
    priceCurrency: 'USD',
    referenceQuantity: {
      '@type': 'QuantitativeValue',
      value: '30',
      unitCode: 'DAY',
    },
  },
  itemOffered: {
    '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  },
};

export const NEXTJOB_OFFER_CATALOG: SchemaEntity = {
  '@type': 'OfferCatalog',
  '@id': `${CANONICAL_ORIGIN}/#offercatalog`,
  name: 'NextJob Subscriptions & Services',
  itemListElement: [
    { '@id': `${CANONICAL_ORIGIN}/#offer-free` },
    { '@id': `${CANONICAL_ORIGIN}/#offer-search` },
  ],
};

export const NEXTJOB_SOFTWARE_APPLICATION: SchemaEntity = {
  '@type': ['SoftwareApplication', 'WebApplication'],
  '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  name: 'NextJob AI Career Agent',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Career Automation & Job Search',
  operatingSystem: 'Web Browser',
  url: CANONICAL_ORIGIN,
  softwareVersion: '1.0.0-beta',
  description:
    'AI career agent that converts verified career evidence into eligible, high-quality applications with proof for every claim.',
  featureList: [
    'Zero-hallucination resume and cover letter tailoring',
    'Pre-application eligibility checks and sponsorship verification',
    'Automated ATS submissions with immutable receipt generation',
    'Evidence-backed Career Graph management',
  ],
  provider: {
    '@id': `${CANONICAL_ORIGIN}/#organization`,
  },
  author: {
    '@id': `${CANONICAL_ORIGIN}/#organization`,
  },
  offers: [
    { '@id': `${CANONICAL_ORIGIN}/#offer-free` },
    { '@id': `${CANONICAL_ORIGIN}/#offer-search` },
  ],
  hasPart: [{ '@id': `${CANONICAL_ORIGIN}/#terms` }, { '@id': `${CANONICAL_ORIGIN}/#workflow` }],
};

export const NEXTJOB_SERVICE: SchemaEntity = {
  '@type': 'Service',
  '@id': `${CANONICAL_ORIGIN}/#service`,
  name: 'NextJob Job Application Verification & Automation',
  serviceType: 'Automated Career Agent',
  description:
    'End-to-end evidence verification, pre-application eligibility pre-filtering, and cryptographic receipt emission for ATS submissions.',
  provider: {
    '@id': `${CANONICAL_ORIGIN}/#organization`,
  },
  areaServed: 'Worldwide',
  termsOfService: `${CANONICAL_ORIGIN}/terms`,
  hasOfferCatalog: {
    '@id': `${CANONICAL_ORIGIN}/#offercatalog`,
  },
};

export const NEXTJOB_HOW_TO: SchemaEntity = {
  '@type': 'HowTo',
  '@id': `${CANONICAL_ORIGIN}/#workflow`,
  name: 'How NextJob Submits Verified Job Applications',
  description:
    'Step-by-step workflow of how the NextJob AI Career Agent extracts profile evidence, verifies job eligibility, drafts tailored applications, and emits submission receipts.',
  tool: {
    '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Build & Verify Career Profile',
      text: 'Import resume or CV. NextJob extracts claims and grounds them against verified evidence in your Career Graph.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Discover & Filter Eligible Jobs',
      text: 'The Eligibility Engine verifies work authorization, location, sponsorship, and mandatory qualifications before matching.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Tailor Evidence-Constrained Application',
      text: 'AI drafts tailored resume variants and cover letters strictly using verified claims with zero hallucinated experience.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Submit & Emit Immutable Receipt',
      text: 'Application is submitted to ATS and an immutable, cryptographically verifiable submission receipt with field hashes is generated.',
    },
  ],
};

export const NEXTJOB_DEFINED_TERMS: SchemaEntity = {
  '@type': 'DefinedTermSet',
  '@id': `${CANONICAL_ORIGIN}/#terms`,
  name: 'NextJob Platform Terminology',
  description:
    'Core entity definitions and domain concepts powering the NextJob AI career agent platform.',
  definedTerm: [
    {
      '@type': 'DefinedTerm',
      '@id': `${CANONICAL_ORIGIN}/#term-agent`,
      name: 'AI Career Agent',
      termCode: 'AI-AGENT',
      description:
        'An autonomous assistant that finds matching job opportunities, evaluates candidate eligibility, tailors application materials, and submits applications on behalf of the candidate.',
      inDefinedTermSet: {
        '@id': `${CANONICAL_ORIGIN}/#terms`,
      },
    },
    {
      '@type': 'DefinedTerm',
      '@id': `${CANONICAL_ORIGIN}/#term-career-graph`,
      name: 'Career Graph',
      termCode: 'CAREER-GRAPH',
      description:
        "A structured, evidence-backed representation of a user's career profile, including verified skills, work achievements, education, and credentials.",
      inDefinedTermSet: {
        '@id': `${CANONICAL_ORIGIN}/#terms`,
      },
    },
    {
      '@type': 'DefinedTerm',
      '@id': `${CANONICAL_ORIGIN}/#term-receipt`,
      name: 'Submission Receipt',
      termCode: 'SUBMISSION-RECEIPT',
      description:
        'An immutable, cryptographically verifiable proof emitted for every completed application submission, providing transparency to job seekers and employers.',
      inDefinedTermSet: {
        '@id': `${CANONICAL_ORIGIN}/#terms`,
      },
    },
    {
      '@type': 'DefinedTerm',
      '@id': `${CANONICAL_ORIGIN}/#term-eligibility`,
      name: 'Eligibility Engine',
      termCode: 'ELIGIBILITY-ENGINE',
      description:
        'A deterministic pre-filtering system that verifies candidate eligibility (including work authorization, location, security clearance, and skill prerequisites) before an application is submitted.',
      inDefinedTermSet: {
        '@id': `${CANONICAL_ORIGIN}/#terms`,
      },
    },
  ],
};

export const NEXTJOB_FAQ_PAGE: SchemaEntity = {
  '@type': 'FAQPage',
  '@id': `${CANONICAL_ORIGIN}/#faq`,
  about: {
    '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  },
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

export const NEXTJOB_WEBSITE: SchemaEntity = {
  '@type': 'WebSite',
  '@id': `${CANONICAL_ORIGIN}/#website`,
  name: 'NextJob',
  url: CANONICAL_ORIGIN,
  publisher: {
    '@id': `${CANONICAL_ORIGIN}/#organization`,
  },
  about: [
    { '@id': `${CANONICAL_ORIGIN}/#softwareapplication` },
    { '@id': `${CANONICAL_ORIGIN}/#service` },
    { '@id': `${CANONICAL_ORIGIN}/#terms` },
  ],
  mainEntity: {
    '@id': `${CANONICAL_ORIGIN}/#softwareapplication`,
  },
  description:
    'NextJob — Apply with Proof. AI career agent that turns verified career evidence into eligible applications.',
};

/**
 * Returns the full JSON-LD schema graph for NextJob, optimized for AI search crawlers and structured parsing.
 */
export function getStructuredData(): GraphSchema {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      NEXTJOB_ORGANIZATION,
      NEXTJOB_OFFER_FREE,
      NEXTJOB_OFFER_SEARCH,
      NEXTJOB_OFFER_CATALOG,
      NEXTJOB_SOFTWARE_APPLICATION,
      NEXTJOB_SERVICE,
      NEXTJOB_HOW_TO,
      NEXTJOB_DEFINED_TERMS,
      NEXTJOB_FAQ_PAGE,
      NEXTJOB_WEBSITE,
    ],
  };
}

/**
 * Returns serialized JSON-LD string ready to be injected into an HTML script element.
 */
export function getStructuredDataJson(): string {
  return JSON.stringify(getStructuredData(), null, 2);
}
