import { db } from './index';
import { users, organizations, cohorts, cohortMembers, careerProfiles, careerClaims, companies, jobs } from './schema';

async function seed() {
  console.log('Seeding database...');

  // Create test tenant
  const tenantId = '00000000-0000-0000-0000-000000000001';

  // Create test users
  const [user1] = await db.insert(users).values([
    {
      tenantId,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'candidate',
      status: 'active',
      emailVerified: new Date(),
    },
    {
      tenantId,
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'candidate',
      status: 'active',
      emailVerified: new Date(),
    },
    {
      tenantId,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      emailVerified: new Date(),
    },
  ]).returning();

  console.log('Created users:', user1.id);

  // Create test organization
  const [org] = await db.insert(organizations).values({
    tenantId,
    name: 'Test Organization',
    slug: 'test-org',
    plan: 'pro',
    status: 'active',
  }).returning();

  console.log('Created organization:', org.id);

  // Create test cohort
  const [cohort] = await db.insert(cohorts).values({
    tenantId,
    organizationId: org.id,
    name: 'Q1 2026 Cohort',
    description: 'First quarter cohort',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-03-31'),
    status: 'active',
  }).returning();

  console.log('Created cohort:', cohort.id);

  // Add users to cohort
  await db.insert(cohortMembers).values([
    {
      tenantId,
      cohortId: cohort.id,
      userId: user1.id,
      role: 'participant',
    },
  ]);

  console.log('Added users to cohort');

  // Create career profile
  const [profile] = await db.insert(careerProfiles).values({
    tenantId,
    userId: user1.id,
    headline: 'Senior Software Engineer',
    summary: 'Experienced software engineer with 5+ years in full-stack development',
    location: { city: 'San Francisco', state: 'CA', country: 'US' },
    preferences: {
      targetRoles: ['Software Engineer', 'Senior Engineer'],
      locations: ['Remote', 'San Francisco', 'New York'],
      salaryMin: 150000,
    },
  }).returning();

  console.log('Created career profile:', profile.id);

  // Create career claims
  await db.insert(careerClaims).values([
    {
      tenantId,
      userId: user1.id,
      type: 'experience',
      title: 'Senior Software Engineer at Tech Corp',
      content: {
        company: 'Tech Corp',
        role: 'Senior Software Engineer',
        description: 'Led development of microservices architecture',
        achievements: ['Reduced deployment time by 70%', 'Mentored 3 junior engineers'],
      },
      verificationStatus: 'verified',
      confidence: 95,
      startDate: new Date('2021-01-01'),
      endDate: new Date(),
    },
    {
      tenantId,
      userId: user1.id,
      type: 'skill',
      title: 'TypeScript',
      content: { level: 'expert', years: 5 },
      verificationStatus: 'verified',
      confidence: 90,
    },
    {
      tenantId,
      userId: user1.id,
      type: 'education',
      title: 'B.S. Computer Science',
      content: {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        gpa: 3.8,
      },
      verificationStatus: 'verified',
      confidence: 100,
      startDate: new Date('2015-09-01'),
      endDate: new Date('2019-06-01'),
    },
  ]);

  console.log('Created career claims');

  // Create test companies
  const [company1, company2] = await db.insert(companies).values([
    {
      tenantId,
      name: 'Stripe',
      slug: 'stripe',
      website: 'https://stripe.com',
      industry: 'Fintech',
      size: '5000+',
    },
    {
      tenantId,
      name: 'Vercel',
      slug: 'vercel',
      website: 'https://vercel.com',
      industry: 'Developer Tools',
      size: '500-1000',
    },
  ]).returning();

  console.log('Created companies:', company1.id, company2.id);

  // Create test jobs
  await db.insert(jobs).values([
    {
      tenantId,
      companyId: company1.id,
      externalId: 'stripe-123',
      source: 'linkedin',
      title: 'Senior Software Engineer',
      description: 'Join our payments infrastructure team',
      location: { city: 'San Francisco', state: 'CA', country: 'US' },
      remote: true,
      salary: { min: 180000, max: 250000, currency: 'USD' },
      requirements: {
        skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
        experience: '5+ years',
        education: 'BS in CS or equivalent',
      },
      status: 'active',
      postedAt: new Date(),
    },
    {
      tenantId,
      companyId: company2.id,
      externalId: 'vercel-456',
      source: 'indeed',
      title: 'Full Stack Engineer',
      description: 'Build the future of web deployment',
      location: { city: 'Remote', country: 'US' },
      remote: true,
      salary: { min: 150000, max: 220000, currency: 'USD' },
      requirements: {
        skills: ['React', 'Next.js', 'TypeScript'],
        experience: '3+ years',
      },
      status: 'active',
      postedAt: new Date(),
    },
  ]);

  console.log('Created jobs');

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
