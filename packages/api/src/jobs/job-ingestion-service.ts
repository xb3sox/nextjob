import { v4 as uuidv4 } from 'uuid';
import {
  Job,
  JobSchema,
  Company,
  CompanySchema,
  IngestJobRequest,
  IngestJobResponse,
  ListJobsRequest,
  ListJobsResponse,
  JobNotFoundError,
  DuplicateJobError,
  InvalidJobDataError,
  CompanyNotFoundError,
} from './types.js';
import { jobNormalizationService } from './job-normalization.js';
import { jobDeduplicationService } from './job-deduplication.js';

// ============================================================================
// Job Ingestion Service
// ============================================================================

/**
 * Service for ingesting, normalizing, and deduplicating jobs
 */
export class JobIngestionService {
  // In-memory storage (replace with database in production)
  private jobsStore: Map<string, Job> = new Map();
  private companiesStore: Map<string, Company> = new Map();
  private fingerprintIndex: Map<string, string> = new Map(); // fingerprint -> jobId

  /**
   * Ingest a new job
   */
  async ingestJob(request: IngestJobRequest): Promise<IngestJobResponse> {
    const now = new Date().toISOString();
    
    // Step 1: Normalize job data
    const normalizedData = jobNormalizationService.normalizeJob(request);
    
    // Step 2: Check for duplicates
    const existingJobs = Array.from(this.jobsStore.values()).filter(
      job => job.tenantId === request.tenantId && !job.deleted
    );
    
    const potentialDuplicates = jobDeduplicationService.findPotentialDuplicates(
      normalizedData.normalized,
      existingJobs,
      0.9 // High threshold for duplicate detection
    );
    
    if (potentialDuplicates.length > 0) {
      // Job is a duplicate
      const canonicalJob = jobDeduplicationService.selectCanonicalJob(potentialDuplicates);
      
      // Update canonical job with new data
      const mergedJob = jobDeduplicationService.mergeDuplicateJobs(canonicalJob, [normalizedData.normalized as Job]);
      mergedJob.updatedAt = now;
      mergedJob.lastSeenAt = now;
      
      // Store updated canonical job
      this.jobsStore.set(canonicalJob.id, mergedJob);
      
      // Update fingerprint index
      const fingerprint = jobDeduplicationService.generateJobFingerprint(mergedJob);
      this.fingerprintIndex.set(fingerprint, canonicalJob.id);
      
      return {
        job: mergedJob,
        isDuplicate: true,
        canonicalJobId: canonicalJob.id,
      };
    }
    
    // Step 3: Create or find company
    const company = await this.findOrCreateCompany(
      request.tenantId,
      request.companyName,
      request.companyWebsite,
      request.companySize,
      request.companyIndustry,
      request.userId
    );
    
    // Step 4: Create new job
    const jobId = uuidv4();
    const job: Job = {
      id: jobId,
      tenantId: request.tenantId,
      source: request.source,
      externalId: request.externalId,
      sourceUrl: request.sourceUrl,
      companyId: company.id,
      companyName: request.companyName,
      companyWebsite: request.companyWebsite,
      companySize: request.companySize,
      companyIndustry: request.companyIndustry,
      title: request.title,
      description: request.description,
      requirements: request.requirements,
      responsibilities: request.responsibilities,
      benefits: request.benefits,
      location: request.location,
      workMode: request.workMode || 'any',
      salary: request.salary,
      seniorityLevel: normalizedData.normalized.seniorityLevel,
      roleFamily: normalizedData.normalized.roleFamily,
      requiredSkills: request.requiredSkills,
      preferredSkills: request.preferredSkills,
      requiredExperience: request.requiredExperience,
      requiredEducation: request.requiredEducation,
      requiresSponsorship: request.requiresSponsorship,
      visaSponsorship: request.visaSponsorship,
      applicationUrl: request.applicationUrl,
      applicationEmail: request.applicationEmail,
      applicationInstructions: request.applicationInstructions,
      status: 'active',
      postedAt: request.postedAt || now,
      expiresAt: request.expiresAt,
      lastSeenAt: now,
      freshnessScore: normalizedData.normalized.freshnessScore || 1,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: request.userId,
      updatedBy: request.userId,
      deleted: false,
    };
    
    // Validate job
    const validatedJob = JobSchema.parse(job);
    
    // Store job
    this.jobsStore.set(jobId, validatedJob);
    
    // Update fingerprint index
    const fingerprint = jobDeduplicationService.generateJobFingerprint(validatedJob);
    this.fingerprintIndex.set(fingerprint, jobId);
    
    return {
      job: validatedJob,
      isDuplicate: false,
      company,
    };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string, tenantId: string): Promise<Job> {
    const job = this.jobsStore.get(jobId);
    
    if (!job || job.deleted || job.tenantId !== tenantId) {
      throw new JobNotFoundError(jobId);
    }
    
    // If job is a duplicate, return canonical job
    if (job.duplicateOf) {
      return this.getJob(job.duplicateOf, tenantId);
    }
    
    return job;
  }

  /**
   * Update job
   */
  async updateJob(
    jobId: string,
    tenantId: string,
    updates: Partial<Job>,
    userId: string
  ): Promise<Job> {
    const job = await this.getJob(jobId, tenantId);
    
    const now = new Date().toISOString();
    const updatedJob: Job = {
      ...job,
      ...updates,
      version: job.version + 1,
      previousVersionId: job.id,
      updatedAt: now,
      updatedBy: userId,
    };
    
    // Validate updated job
    const validatedJob = JobSchema.parse(updatedJob);
    
    // Store updated job
    this.jobsStore.set(jobId, validatedJob);
    
    // Update fingerprint index
    const fingerprint = jobDeduplicationService.generateJobFingerprint(validatedJob);
    this.fingerprintIndex.set(fingerprint, jobId);
    
    return validatedJob;
  }

  /**
   * Delete job (soft delete)
   */
  async deleteJob(jobId: string, tenantId: string, userId: string): Promise<void> {
    const job = await this.getJob(jobId, tenantId);
    
    const now = new Date().toISOString();
    const deletedJob: Job = {
      ...job,
      deleted: true,
      deletedAt: now,
      updatedAt: now,
      updatedBy: userId,
    };
    
    this.jobsStore.set(jobId, deletedJob);
    
    // Remove from fingerprint index
    const fingerprint = jobDeduplicationService.generateJobFingerprint(job);
    this.fingerprintIndex.delete(fingerprint);
  }

  /**
   * List jobs with filters
   */
  async listJobs(request: ListJobsRequest): Promise<ListJobsResponse> {
    const { tenantId, status, source, location, workMode, seniorityLevel, requiredSkills, page = 1, pageSize = 20 } = request;
    
    let jobs = Array.from(this.jobsStore.values()).filter(
      job => job.tenantId === tenantId && !job.deleted
    );
    
    // Apply filters
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    if (source) {
      jobs = jobs.filter(job => job.source === source);
    }
    
    if (location) {
      jobs = jobs.filter(job => 
        job.location.country.toLowerCase().includes(location.toLowerCase()) ||
        job.location.city?.toLowerCase().includes(location.toLowerCase()) ||
        job.location.state?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (workMode) {
      jobs = jobs.filter(job => job.workMode === workMode);
    }
    
    if (seniorityLevel) {
      jobs = jobs.filter(job => job.seniorityLevel === seniorityLevel);
    }
    
    if (requiredSkills && requiredSkills.length > 0) {
      jobs = jobs.filter(job => 
        requiredSkills.every(skill => 
          job.requiredSkills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }
    
    // Sort by postedAt (newest first)
    jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    
    // Paginate
    const total = jobs.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    
    return {
      jobs: paginatedJobs,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  /**
   * Update freshness scores for all jobs
   */
  async updateFreshnessScores(tenantId: string): Promise<void> {
    const jobs = Array.from(this.jobsStore.values()).filter(
      job => job.tenantId === tenantId && !job.deleted
    );
    
    for (const job of jobs) {
      const freshnessScore = jobNormalizationService.normalizeJob(job).normalized.freshnessScore;
      
      if (freshnessScore !== job.freshnessScore) {
        job.freshnessScore = freshnessScore!;
        job.updatedAt = new Date().toISOString();
        this.jobsStore.set(job.id, job);
      }
    }
  }

  /**
   * Mark stale jobs as expired
   */
  async markStaleJobsAsExpired(tenantId: string, maxAgeDays: number = 90): Promise<number> {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);
    
    let expiredCount = 0;
    
    const jobs = Array.from(this.jobsStore.values()).filter(
      job => 
        job.tenantId === tenantId && 
        !job.deleted && 
        job.status === 'active' &&
        new Date(job.lastSeenAt) < cutoffDate
    );
    
    for (const job of jobs) {
      job.status = 'expired';
      job.updatedAt = now.toISOString();
      this.jobsStore.set(job.id, job);
      expiredCount++;
    }
    
    return expiredCount;
  }

  /**
   * Get company by ID
   */
  async getCompany(companyId: string, tenantId: string): Promise<Company> {
    const company = this.companiesStore.get(companyId);
    
    if (!company || company.deleted || company.tenantId !== tenantId) {
      throw new CompanyNotFoundError(companyId);
    }
    
    return company;
  }

  /**
   * Find or create company
   */
  private async findOrCreateCompany(
    tenantId: string,
    companyName: string,
    companyWebsite?: string,
    companySize?: Company['size'],
    companyIndustry?: string,
    userId?: string
  ): Promise<Company> {
    // Try to find existing company by name and tenant
    const existingCompany = Array.from(this.companiesStore.values()).find(
      company => 
        company.tenantId === tenantId &&
        !company.deleted &&
        company.name.toLowerCase() === companyName.toLowerCase()
    );
    
    if (existingCompany) {
      return existingCompany;
    }
    
    // Create new company
    const now = new Date().toISOString();
    const company: Company = {
      id: uuidv4(),
      tenantId,
      name: companyName,
      website: companyWebsite,
      size: companySize,
      industry: companyIndustry,
      version: 1,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };
    
    // Validate company
    const validatedCompany = CompanySchema.parse(company);
    
    // Store company
    this.companiesStore.set(company.id, validatedCompany);
    
    return validatedCompany;
  }

  /**
   * Get job statistics
   */
  async getJobStats(tenantId: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    expiredJobs: number;
    bySource: Record<string, number>;
    bySeniority: Record<string, number>;
    byWorkMode: Record<string, number>;
    averageFreshnessScore: number;
  }> {
    const jobs = Array.from(this.jobsStore.values()).filter(
      job => job.tenantId === tenantId && !job.deleted
    );
    
    const bySource: Record<string, number> = {};
    const bySeniority: Record<string, number> = {};
    const byWorkMode: Record<string, number> = {};
    let totalFreshness = 0;
    let activeJobs = 0;
    let expiredJobs = 0;
    
    for (const job of jobs) {
      // Count by source
      bySource[job.source] = (bySource[job.source] || 0) + 1;
      
      // Count by seniority
      if (job.seniorityLevel) {
        bySeniority[job.seniorityLevel] = (bySeniority[job.seniorityLevel] || 0) + 1;
      }
      
      // Count by work mode
      byWorkMode[job.workMode] = (byWorkMode[job.workMode] || 0) + 1;
      
      // Sum freshness scores
      totalFreshness += job.freshnessScore;
      
      // Count by status
      if (job.status === 'active') {
        activeJobs++;
      } else if (job.status === 'expired') {
        expiredJobs++;
      }
    }
    
    return {
      totalJobs: jobs.length,
      activeJobs,
      expiredJobs,
      bySource,
      bySeniority,
      byWorkMode,
      averageFreshnessScore: jobs.length > 0 ? totalFreshness / jobs.length : 0,
    };
  }
}

// Export singleton instance
export const jobIngestionService = new JobIngestionService();
