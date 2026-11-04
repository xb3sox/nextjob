import type {
  CandidateProfile,
  ConnectorDetectionResult,
  ConnectorFillPayload,
  ConnectorFillResult,
  FilledFieldReport,
  SubmissionRecord,
} from "./types";

export interface GreenhouseConnectorOptions {
  storageKey?: string;
  allowDuplicates?: boolean;
}

export interface GreenhouseConnectorInstance {
  detect: (root?: ParentNode) => ConnectorDetectionResult;
  isDuplicate: (jobId: string, idempotencyKey?: string) => boolean;
  fill: (
    root: ParentNode,
    payload: ConnectorFillPayload,
  ) => ConnectorFillResult;
  recordSubmission: (
    jobId: string,
    idempotencyKey: string,
    submissionHash?: string,
  ) => SubmissionRecord;
  clearHistory: () => void;
}

const DEFAULT_STORAGE_KEY = "nextjob.submissions.greenhouse";

const getLabelText = (el: HTMLElement): string => {
  if (el.id && el.ownerDocument) {
    const label = el.ownerDocument.querySelector(`label[for="${el.id}"]`);
    if (label?.textContent) {
      return label.textContent.trim();
    }
  }
  const parentLabel = el.closest("label");
  if (parentLabel?.textContent) {
    return parentLabel.textContent.trim();
  }
  return "";
};

const fillElement = (
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): { success: boolean; skipped?: boolean; error?: string } => {
  try {
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
            (value === "1" && /yes|true/i.test(opt.text)) ||
            (value === "0" && /no|false/i.test(opt.text)))
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

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new Event("blur", { bubbles: true }));

    return { success: true, skipped: false };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

const computeSubmissionHash = (
  jobId: string,
  email: string,
  idempotencyKey: string,
): string => {
  const raw = `${jobId}:${email}:${idempotencyKey}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `gh_${Math.abs(hash).toString(16).padStart(8, "0")}`;
};

const resolveFieldMappings = (
  form: HTMLFormElement,
  profile: CandidateProfile,
  customAnswers?: Record<string, string>,
): Array<{
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  key: string;
  name: string;
  value: string;
}> => {
  const mappings: Array<{
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    key: string;
    name: string;
    value: string;
  }> = [];

  const inputs = Array.from(
    form.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select',
    ),
  );

  for (const el of inputs) {
    const id = (el.id || "").toLowerCase();
    const name = (el.name || "").toLowerCase();
    const auto = (el.autocomplete || "").toLowerCase();
    const labelText = getLabelText(el).toLowerCase();
    const fieldDesc = `${id} ${name} ${auto} ${labelText}`;

    if (
      (auto === "given-name" ||
        fieldDesc.includes("first_name") ||
        fieldDesc.includes("firstname")) &&
      profile.firstName
    ) {
      mappings.push({
        element: el,
        key: "firstName",
        name: el.name || el.id,
        value: profile.firstName,
      });
      continue;
    }

    if (
      (auto === "family-name" ||
        fieldDesc.includes("last_name") ||
        fieldDesc.includes("lastname")) &&
      profile.lastName
    ) {
      mappings.push({
        element: el,
        key: "lastName",
        name: el.name || el.id,
        value: profile.lastName,
      });
      continue;
    }

    if (
      (auto === "email" ||
        el.type === "email" ||
        fieldDesc.includes("email")) &&
      profile.email
    ) {
      mappings.push({
        element: el,
        key: "email",
        name: el.name || el.id,
        value: profile.email,
      });
      continue;
    }

    if (
      (auto === "tel" || el.type === "tel" || fieldDesc.includes("phone")) &&
      profile.phone
    ) {
      mappings.push({
        element: el,
        key: "phone",
        name: el.name || el.id,
        value: profile.phone,
      });
      continue;
    }

    if (fieldDesc.includes("linkedin") && profile.linkedin) {
      mappings.push({
        element: el,
        key: "linkedin",
        name: el.name || el.id,
        value: profile.linkedin,
      });
      continue;
    }

    if (fieldDesc.includes("github") && profile.github) {
      mappings.push({
        element: el,
        key: "github",
        name: el.name || el.id,
        value: profile.github,
      });
      continue;
    }

    if (
      (fieldDesc.includes("portfolio") || fieldDesc.includes("website")) &&
      profile.portfolio
    ) {
      mappings.push({
        element: el,
        key: "portfolio",
        name: el.name || el.id,
        value: profile.portfolio,
      });
      continue;
    }

    if (
      (fieldDesc.includes("authorized to work") ||
        fieldDesc.includes("work authorization") ||
        fieldDesc.includes("legally authorized")) &&
      profile.workAuthorization
    ) {
      const val = profile.workAuthorization === "yes" ? "1" : "0";
      mappings.push({
        element: el,
        key: "workAuthorization",
        name: el.name || el.id,
        value: val,
      });
      continue;
    }

    if (
      (fieldDesc.includes("sponsorship") ||
        fieldDesc.includes("require sponsorship") ||
        fieldDesc.includes("visa")) &&
      profile.sponsorship
    ) {
      const val = profile.sponsorship === "yes" ? "1" : "0";
      mappings.push({
        element: el,
        key: "sponsorship",
        name: el.name || el.id,
        value: val,
      });
      continue;
    }

    const combinedCustom = { ...profile.customAnswers, ...customAnswers };
    for (const [qKey, qVal] of Object.entries(combinedCustom)) {
      if (
        fieldDesc.includes(qKey.toLowerCase()) ||
        labelText.includes(qKey.toLowerCase())
      ) {
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
};

export const detectGreenhouseForm = (
  root: ParentNode = document,
): ConnectorDetectionResult => {
  const form = root.querySelector<HTMLFormElement>(
    '#application_form, form[action*="greenhouse.io"], form[action*="boards.greenhouse.io"], #dev-application-form',
  );

  const isUrlGreenhouse =
    typeof window !== "undefined" &&
    Boolean(window.location) &&
    /boards\.(eu\.)?greenhouse\.io/i.test(window.location.hostname);

  const isDetected = Boolean(form || isUrlGreenhouse);
  const confidence =
    form && isUrlGreenhouse ? 1.0 : form ? 0.95 : isUrlGreenhouse ? 0.8 : 0;

  let jobId: string | undefined;
  if (form) {
    const jobIdInput = form.querySelector<HTMLInputElement>(
      'input[name="job_id"], input[name="id"]',
    );
    if (jobIdInput?.value) {
      jobId = jobIdInput.value;
    }
  }

  if (!jobId && typeof window !== "undefined" && window.location) {
    const match = window.location.pathname.match(/\/jobs\/(\d+)/);
    if (match?.[1]) {
      jobId = match[1];
    }
  }

  return {
    isDetected,
    platform: "greenhouse",
    confidence,
    formElement: form,
    jobId,
  };
};

/**
 * Functional Greenhouse ATS Connector (replaces class GreenhouseConnector per TurboStarter rules).
 */
export const createGreenhouseConnector = (
  options: GreenhouseConnectorOptions = {},
): GreenhouseConnectorInstance => {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const allowDuplicates = options.allowDuplicates ?? false;
  const inMemorySubmissions = new Map<string, SubmissionRecord>();

  const getSubmissions = (): SubmissionRecord[] => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed as SubmissionRecord[];
          }
        }
      }
    } catch {
      // Fallback to in-memory
    }
    return Array.from(inMemorySubmissions.values());
  };

  const saveSubmissions = (records: SubmissionRecord[]): void => {
    inMemorySubmissions.clear();
    for (const r of records) {
      inMemorySubmissions.set(`${r.jobId}:${r.idempotencyKey}`, r);
    }

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(storageKey, JSON.stringify(records));
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const isDuplicate = (jobId: string, idempotencyKey?: string): boolean => {
    if (allowDuplicates) {
      return false;
    }

    const records = getSubmissions();
    return records.some(
      (record) =>
        record.jobId === jobId ||
        (Boolean(idempotencyKey) && record.idempotencyKey === idempotencyKey),
    );
  };

  const fill = (
    root: ParentNode,
    payload: ConnectorFillPayload,
  ): ConnectorFillResult => {
    const detection = detectGreenhouseForm(root);

    if (!detection.isDetected || !detection.formElement) {
      return {
        success: false,
        detected: false,
        platform: "greenhouse",
        isDuplicate: false,
        filledFieldCount: 0,
        skippedFieldCount: 0,
        fields: [],
        idempotencyKey: payload.idempotencyKey,
        error: "No Greenhouse application form detected on page",
      };
    }

    const targetJobId = payload.jobId || detection.jobId || "unknown-job";

    if (isDuplicate(targetJobId, payload.idempotencyKey)) {
      return {
        success: false,
        detected: true,
        platform: "greenhouse",
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

    const fieldsToFill = resolveFieldMappings(
      form,
      payload.profile,
      payload.answers,
    );

    for (const mapping of fieldsToFill) {
      const result = fillElement(mapping.element, mapping.value);
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

    const submissionHash = computeSubmissionHash(
      targetJobId,
      payload.profile.email,
      payload.idempotencyKey,
    );

    return {
      success: filledCount + skippedCount > 0,
      detected: true,
      platform: "greenhouse",
      isDuplicate: false,
      filledFieldCount: filledCount,
      skippedFieldCount: skippedCount,
      fields: filledReports,
      idempotencyKey: payload.idempotencyKey,
      submissionHash,
    };
  };

  const recordSubmission = (
    jobId: string,
    idempotencyKey: string,
    submissionHash?: string,
  ): SubmissionRecord => {
    const record: SubmissionRecord = {
      jobId,
      idempotencyKey,
      submissionHash:
        submissionHash || computeSubmissionHash(jobId, "", idempotencyKey),
      submittedAt: new Date().toISOString(),
      platform: "greenhouse",
    };

    const records = getSubmissions();
    records.push(record);
    saveSubmissions(records);

    return record;
  };

  const clearHistory = (): void => {
    inMemorySubmissions.clear();
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // In-memory fallback handles environment without localStorage
    }
  };

  return {
    detect: detectGreenhouseForm,
    isDuplicate,
    fill,
    recordSubmission,
    clearHistory,
  };
};
