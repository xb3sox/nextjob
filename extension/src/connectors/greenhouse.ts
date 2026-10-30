import type {
  CandidateProfile,
  ConnectorDetectionResult,
  ConnectorFillPayload,
  ConnectorFillResult,
  FilledFieldReport,
  SubmissionRecord,
} from './types';

export interface GreenhouseConnectorOptions {
  storageKey?: string;
  allowDuplicates?: boolean;
}

const DEFAULT_STORAGE_KEY = 'nextjob.submissions.greenhouse';

/**
 * Greenhouse ATS Connector
 * Detects Greenhouse application forms, maps standard & custom fields,
 * executes idempotent autofill, and enforces duplicate submission prevention.
 */
export class GreenhouseConnector {
  private readonly storageKey: string;
  private readonly allowDuplicates: boolean;
  private inMemorySubmissions: Map<string, SubmissionRecord> = new Map();

  constructor(options: GreenhouseConnectorOptions = {}) {
    this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
    this.allowDuplicates = options.allowDuplicates ?? false;
  }

  /**
   * Detects whether the current page or DOM root contains a Greenhouse application form.
   */
  public detect(root: ParentNode = document): ConnectorDetectionResult {
    const form = root.querySelector<HTMLFormElement>(
      '#application_form, form[action*="greenhouse.io"], form[action*="boards.greenhouse.io"], #dev-application-form'
    );

    const isUrlGreenhouse =
      typeof window !== 'undefined' &&
      window.location &&
      /boards\.(eu\.)?greenhouse\.io/i.test(window.location.hostname);

    const isDetected = Boolean(form || isUrlGreenhouse);
    const confidence = form && isUrlGreenhouse ? 1.0 : form ? 0.95 : isUrlGreenhouse ? 0.8 : 0;

    let jobId: string | undefined;
    if (form) {
      const jobIdInput = form.querySelector<HTMLInputElement>(
        'input[name="job_id"], input[name="id"]'
      );
      if (jobIdInput?.value) {
        jobId = jobIdInput.value;
      }
    }

    if (!jobId && typeof window !== 'undefined' && window.location) {
      const match = window.location.pathname.match(/\/jobs\/(\d+)/);
      if (match) {
        jobId = match[1];
      }
    }

    return {
      isDetected,
      platform: 'greenhouse',
      confidence,
      formElement: form,
      jobId,
    };
  }

  /**
   * Checks whether an application for this job has already been submitted.
   */
  public isDuplicate(jobId: string, idempotencyKey?: string): boolean {
    if (this.allowDuplicates) {
      return false;
    }

    const records = this.getSubmissions();
    return records.some(
      (record) =>
        record.jobId === jobId || (idempotencyKey && record.idempotencyKey === idempotencyKey)
    );
  }

  /**
   * Fills form fields from approved candidate profile data.
   * Enforces idempotency (no-op on already filled matching values) and duplicate prevention.
   */
  public fill(root: ParentNode, payload: ConnectorFillPayload): ConnectorFillResult {
    const detection = this.detect(root);

    if (!detection.isDetected || !detection.formElement) {
      return {
        success: false,
        detected: false,
        platform: 'greenhouse',
        isDuplicate: false,
        filledFieldCount: 0,
        skippedFieldCount: 0,
        fields: [],
        idempotencyKey: payload.idempotencyKey,
        error: 'No Greenhouse application form detected on page',
      };
    }

    const targetJobId = payload.jobId || detection.jobId || 'unknown-job';

    if (this.isDuplicate(targetJobId, payload.idempotencyKey)) {
      return {
        success: false,
        detected: true,
        platform: 'greenhouse',
        isDuplicate: true,
        filledFieldCount: 0,
        skippedFieldCount: 0,
        fields: [],
        idempotencyKey: payload.idempotencyKey,
        error: `Application duplicate blocked: job ${targetJobId} has already been submitted`,
      };
    }

    const form = detection.formElement;
    const filledReports: FilledFieldReport[] = [];
    let filledCount = 0;
    let skippedCount = 0;

    const fieldsToFill = this.resolveFieldMappings(form, payload.profile, payload.answers);

    for (const mapping of fieldsToFill) {
      const result = this.fillElement(mapping.element, mapping.value);
      if (result.success) {
        if (result.skipped) {
          skippedCount++;
        } else {
          filledCount++;
        }
        filledReports.push({
          key: mapping.key,
          name: mapping.name,
          value: mapping.value,
          success: true,
        });
      } else {
        filledReports.push({
          key: mapping.key,
          name: mapping.name,
          value: mapping.value,
          success: false,
          error: result.error,
        });
      }
    }

    const submissionHash = this.computeSubmissionHash(
      targetJobId,
      payload.profile.email,
      payload.idempotencyKey
    );

    return {
      success: filledCount + skippedCount > 0,
      detected: true,
      platform: 'greenhouse',
      isDuplicate: false,
      filledFieldCount: filledCount,
      skippedFieldCount: skippedCount,
      fields: filledReports,
      idempotencyKey: payload.idempotencyKey,
      submissionHash,
    };
  }

  /**
   * Records a successful submission to prevent duplicate applications.
   */
  public recordSubmission(
    jobId: string,
    idempotencyKey: string,
    submissionHash?: string
  ): SubmissionRecord {
    const record: SubmissionRecord = {
      jobId,
      idempotencyKey,
      submissionHash: submissionHash || this.computeSubmissionHash(jobId, '', idempotencyKey),
      submittedAt: new Date().toISOString(),
      platform: 'greenhouse',
    };

    const records = this.getSubmissions();
    records.push(record);
    this.saveSubmissions(records);

    return record;
  }

  /**
   * Clears submission history (useful for testing or cache resets).
   */
  public clearHistory(): void {
    this.inMemorySubmissions.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch {
      // In-memory fallback handles environment without localStorage
    }
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  private getSubmissions(): SubmissionRecord[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback to in-memory
    }
    return Array.from(this.inMemorySubmissions.values());
  }

  private saveSubmissions(records: SubmissionRecord[]): void {
    this.inMemorySubmissions.clear();
    for (const r of records) {
      this.inMemorySubmissions.set(`${r.jobId}:${r.idempotencyKey}`, r);
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(records));
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private resolveFieldMappings(
    form: HTMLFormElement,
    profile: CandidateProfile,
    customAnswers?: Record<string, string>
  ): Array<{
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    key: string;
    name: string;
    value: string;
  }> {
    const mappings: Array<{
      element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      key: string;
      name: string;
      value: string;
    }> = [];

    const inputs = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
      )
    );

    for (const el of inputs) {
      const id = (el.id || '').toLowerCase();
      const name = (el.name || '').toLowerCase();
      const auto = (el.autocomplete || '').toLowerCase();
      const labelText = this.getLabelText(el).toLowerCase();
      const fieldDesc = `${id} ${name} ${auto} ${labelText}`;

      // First name
      if (
        (auto === 'given-name' ||
          fieldDesc.includes('first_name') ||
          fieldDesc.includes('firstname')) &&
        profile.firstName
      ) {
        mappings.push({
          element: el,
          key: 'firstName',
          name: el.name || el.id,
          value: profile.firstName,
        });
        continue;
      }

      // Last name
      if (
        (auto === 'family-name' ||
          fieldDesc.includes('last_name') ||
          fieldDesc.includes('lastname')) &&
        profile.lastName
      ) {
        mappings.push({
          element: el,
          key: 'lastName',
          name: el.name || el.id,
          value: profile.lastName,
        });
        continue;
      }

      // Email
      if (
        (auto === 'email' || el.type === 'email' || fieldDesc.includes('email')) &&
        profile.email
      ) {
        mappings.push({ element: el, key: 'email', name: el.name || el.id, value: profile.email });
        continue;
      }

      // Phone
      if ((auto === 'tel' || el.type === 'tel' || fieldDesc.includes('phone')) && profile.phone) {
        mappings.push({ element: el, key: 'phone', name: el.name || el.id, value: profile.phone });
        continue;
      }

      // LinkedIn
      if (fieldDesc.includes('linkedin') && profile.linkedin) {
        mappings.push({
          element: el,
          key: 'linkedin',
          name: el.name || el.id,
          value: profile.linkedin,
        });
        continue;
      }

      // GitHub
      if (fieldDesc.includes('github') && profile.github) {
        mappings.push({
          element: el,
          key: 'github',
          name: el.name || el.id,
          value: profile.github,
        });
        continue;
      }

      // Portfolio
      if ((fieldDesc.includes('portfolio') || fieldDesc.includes('website')) && profile.portfolio) {
        mappings.push({
          element: el,
          key: 'portfolio',
          name: el.name || el.id,
          value: profile.portfolio,
        });
        continue;
      }

      // Work authorization
      if (
        (fieldDesc.includes('authorized to work') ||
          fieldDesc.includes('work authorization') ||
          fieldDesc.includes('legally authorized')) &&
        profile.workAuthorization
      ) {
        const val = profile.workAuthorization === 'yes' ? '1' : '0';
        mappings.push({
          element: el,
          key: 'workAuthorization',
          name: el.name || el.id,
          value: val,
        });
        continue;
      }

      // Sponsorship
      if (
        (fieldDesc.includes('sponsorship') ||
          fieldDesc.includes('require sponsorship') ||
          fieldDesc.includes('visa')) &&
        profile.sponsorship
      ) {
        const val = profile.sponsorship === 'yes' ? '1' : '0';
        mappings.push({ element: el, key: 'sponsorship', name: el.name || el.id, value: val });
        continue;
      }

      // Custom answers mapping
      const combinedCustom = { ...profile.customAnswers, ...customAnswers };
      for (const [qKey, qVal] of Object.entries(combinedCustom)) {
        if (fieldDesc.includes(qKey.toLowerCase()) || labelText.includes(qKey.toLowerCase())) {
          mappings.push({
            element: el,
            key: `custom:${qKey}`,
            name: el.name || el.id,
            value: qVal,
          });
          break;
        }
      }
    }

    return mappings;
  }

  private getLabelText(el: HTMLElement): string {
    if (el.id && el.ownerDocument) {
      const label = el.ownerDocument.querySelector(`label[for="${el.id}"]`);
      if (label?.textContent) {
        return label.textContent.trim();
      }
    }
    const parentLabel = el.closest('label');
    if (parentLabel?.textContent) {
      return parentLabel.textContent.trim();
    }
    return '';
  }

  private fillElement(
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string
  ): { success: boolean; skipped?: boolean; error?: string } {
    try {
      // Idempotency: skip if value is already identical
      if (element.value === value) {
        return { success: true, skipped: true };
      }

      if (element instanceof HTMLSelectElement) {
        let optionFound = false;
        for (let i = 0; i < element.options.length; i++) {
          const opt = element.options[i];
          if (
            opt &&
            (opt.value === value ||
              (value === '1' && /yes|true/i.test(opt.text)) ||
              (value === '0' && /no|false/i.test(opt.text)))
          ) {
            element.selectedIndex = i;
            optionFound = true;
            break;
          }
        }
        if (!optionFound) {
          element.value = value;
        }
      } else {
        element.value = value;
      }

      // Dispatch input & change events for frameworks (React, Vue, vanilla)
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));

      return { success: true, skipped: false };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private computeSubmissionHash(jobId: string, email: string, idempotencyKey: string): string {
    const raw = `${jobId}:${email}:${idempotencyKey}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `gh_${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
}
