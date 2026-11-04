import type {
  AtsPlatform,
  CandidateProfile,
  DetectedField,
  FillResult,
  StandardFieldKey,
  SyntheticTestReport,
} from "./types";

export const detectPlatform = (root: ParentNode = document): AtsPlatform => {
  if (
    root.querySelector(
      '#application_form, [action*="greenhouse.io"], [id*="greenhouse"]',
    )
  ) {
    return "greenhouse";
  }
  if (
    root.querySelector(
      '#application-form, [action*="lever.co"], .lever-ats, [name^="urls["]',
    )
  ) {
    return "lever";
  }
  if (
    root.querySelector(
      '[data-automation-id*="workday"], [data-automation-id*="applyForm"]',
    )
  ) {
    return "workday";
  }
  return "generic";
};

const resolveFieldKey = (
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): {
  key: StandardFieldKey | "custom";
  confidence: number;
} => {
  const name = (el.name || "").toLowerCase();
  const id = (el.id || "").toLowerCase();
  const auto = (el.autocomplete || "").toLowerCase();
  const placeholder = (
    "placeholder" in el && typeof el.placeholder === "string"
      ? el.placeholder
      : ""
  ).toLowerCase();
  const automationId = (
    el.getAttribute("data-automation-id") || ""
  ).toLowerCase();

  let labelText = "";
  if (el.id && el.ownerDocument) {
    const label = el.ownerDocument.querySelector(`label[for="${el.id}"]`);
    if (label) {
      labelText = (label.textContent || "").toLowerCase();
    }
  }
  if (!labelText && el.closest("label")) {
    labelText = (el.closest("label")?.textContent || "").toLowerCase();
  }
  if (!labelText && el.parentElement?.querySelector("label")) {
    labelText = (
      el.parentElement.querySelector("label")?.textContent || ""
    ).toLowerCase();
  }

  const text = `${name} ${id} ${auto} ${placeholder} ${automationId} ${labelText}`;

  if (
    auto === "given-name" ||
    text.includes("first_name") ||
    text.includes("firstname") ||
    text.includes("first name")
  ) {
    return { key: "firstName", confidence: 0.95 };
  }
  if (
    auto === "family-name" ||
    text.includes("last_name") ||
    text.includes("lastname") ||
    text.includes("last name")
  ) {
    return { key: "lastName", confidence: 0.95 };
  }
  if (
    auto === "name" ||
    (text.includes("name") && !text.includes("first") && !text.includes("last"))
  ) {
    return { key: "fullName", confidence: 0.9 };
  }
  if (auto === "email" || el.type === "email" || text.includes("email")) {
    return { key: "email", confidence: 0.95 };
  }
  if (
    auto === "tel" ||
    el.type === "tel" ||
    text.includes("phone") ||
    text.includes("tel")
  ) {
    return { key: "phone", confidence: 0.95 };
  }
  if (text.includes("linkedin")) {
    return { key: "linkedin", confidence: 0.95 };
  }
  if (text.includes("github")) {
    return { key: "github", confidence: 0.95 };
  }
  if (text.includes("portfolio") || text.includes("website")) {
    return { key: "portfolio", confidence: 0.9 };
  }
  if (
    text.includes("authorized") ||
    text.includes("authorization") ||
    text.includes("work_auth")
  ) {
    return { key: "workAuthorization", confidence: 0.85 };
  }
  if (text.includes("sponsor") || text.includes("sponsorship")) {
    return { key: "sponsorship", confidence: 0.85 };
  }

  return { key: "custom", confidence: 0.5 };
};

export const detectFields = (
  container: ParentNode = document,
): DetectedField[] => {
  const elements = Array.from(
    container.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select',
    ),
  );

  return elements.map((el) => {
    const { key, confidence } = resolveFieldKey(el);
    return {
      element: el,
      key,
      name:
        el.name || el.id || el.getAttribute("data-automation-id") || "unnamed",
      type: el.type || "select",
      required: el.required || el.getAttribute("aria-required") === "true",
      confidence,
    };
  });
};

export const fillField = (field: DetectedField, value: string): boolean => {
  try {
    const el = field.element;
    if (el instanceof HTMLSelectElement) {
      const match = Array.from(el.options).find(
        (opt) =>
          opt.value === value ||
          opt.text.toLowerCase().includes(value.toLowerCase()),
      );
      if (match) {
        el.value = match.value;
      } else {
        el.value = value;
      }
    } else {
      el.value = value;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  } catch {
    return false;
  }
};

export const runSyntheticAtsFill = (
  container: ParentNode,
  profile: CandidateProfile,
): SyntheticTestReport => {
  const logs: string[] = [];
  const platform = detectPlatform(container);
  logs.push(`[DETECTOR] Detected ATS platform: ${platform}`);

  const detectedFields = detectFields(container);
  logs.push(
    `[DETECTOR] Scanned ${detectedFields.length} interactive input fields`,
  );

  const results: FillResult[] = [];
  let filledCount = 0;

  for (const field of detectedFields) {
    let valueToFill = "";

    switch (field.key) {
      case "firstName":
        valueToFill = profile.firstName;
        break;
      case "lastName":
        valueToFill = profile.lastName;
        break;
      case "fullName":
        valueToFill = profile.fullName;
        break;
      case "email":
        valueToFill = profile.email;
        break;
      case "phone":
        valueToFill = profile.phone;
        break;
      case "linkedin":
        valueToFill = profile.linkedin ?? "";
        break;
      case "github":
        valueToFill = profile.github ?? "";
        break;
      case "portfolio":
        valueToFill = profile.portfolio ?? "";
        break;
      case "workAuthorization":
        valueToFill = profile.workAuthorization === "yes" ? "1" : "0";
        break;
      case "sponsorship":
        valueToFill = profile.sponsorship === "yes" ? "1" : "0";
        break;
      case "custom":
      case "resume":
        valueToFill = profile.customAnswers?.[field.name] ?? "";
        break;
    }

    if (valueToFill) {
      const success = fillField(field, valueToFill);
      if (success) {
        filledCount++;
        logs.push(
          `[FILL:SUCCESS] ${field.key} (${field.name}) -> "${valueToFill}"`,
        );
        results.push({
          fieldKey: field.key,
          name: field.name,
          success: true,
          value: valueToFill,
        });
      } else {
        logs.push(`[FILL:FAILED] ${field.key} (${field.name})`);
        results.push({
          fieldKey: field.key,
          name: field.name,
          success: false,
          value: valueToFill,
          error: "Dispatch failed",
        });
      }
    } else {
      logs.push(
        `[FILL:SKIPPED] ${field.key} (${field.name}) -> No profile value`,
      );
    }
  }

  logs.push(
    `[REPORT] Platform: ${platform} | Detected: ${detectedFields.length} | Filled: ${filledCount}`,
  );

  return {
    platform,
    detectedCount: detectedFields.length,
    filledCount,
    results,
    logs,
  };
};

export const createMockGreenhouseHtml = (): string => `
  <div id="wrapper">
    <form id="application_form" action="https://boards.greenhouse.io/apply" method="POST">
      <div class="field">
        <label for="first_name">First Name <span class="asterisk">*</span></label>
        <input type="text" id="first_name" name="job_application[first_name]" autocomplete="given-name" required />
      </div>
      <div class="field">
        <label for="last_name">Last Name <span class="asterisk">*</span></label>
        <input type="text" id="last_name" name="job_application[last_name]" autocomplete="family-name" required />
      </div>
      <div class="field">
        <label for="email">Email <span class="asterisk">*</span></label>
        <input type="email" id="email" name="job_application[email]" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="phone">Phone <span class="asterisk">*</span></label>
        <input type="tel" id="phone" name="job_application[phone]" autocomplete="tel" required />
      </div>
      <div class="field">
        <label for="job_application_answers_attributes_0_text_value">LinkedIn Profile</label>
        <input type="url" id="job_application_answers_attributes_0_text_value" name="job_application[answers_attributes][0][text_value]" />
      </div>
      <div class="field">
        <label for="job_application_answers_attributes_1_text_value">GitHub URL</label>
        <input type="url" id="job_application_answers_attributes_1_text_value" name="job_application[answers_attributes][1][text_value]" />
      </div>
      <div class="field">
        <label for="job_application_answers_attributes_2_boolean_value">Are you legally authorized to work in the United States?</label>
        <select id="job_application_answers_attributes_2_boolean_value" name="job_application[answers_attributes][2][boolean_value]">
          <option value="">-- Please select --</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>
      <button type="submit" id="submit_app">Submit Application</button>
    </form>
  </div>
`;

export const createMockLeverHtml = (): string => `
  <div class="application-page lever-ats">
    <form id="application-form" action="https://jobs.lever.co/company/job/apply" method="POST">
      <input type="text" name="name" placeholder="Full name" autocomplete="name" required />
      <input type="email" name="email" placeholder="Email" autocomplete="email" required />
      <input type="tel" name="phone" placeholder="Phone" autocomplete="tel" required />
      <input type="url" name="urls[LinkedIn]" placeholder="LinkedIn URL" />
      <input type="url" name="urls[GitHub]" placeholder="GitHub URL" />
      <input type="url" name="urls[Portfolio]" placeholder="Portfolio URL" />
      <textarea name="comments" placeholder="Additional information"></textarea>
      <button type="submit">Submit application</button>
    </form>
  </div>
`;

export const createMockWorkdayHtml = (): string => `
  <div data-automation-id="workday-application">
    <form data-automation-id="applyForm">
      <div data-automation-id="legalNameSection_firstName">
        <label>First Name</label>
        <input type="text" data-automation-id="firstNameInput" name="firstName" required />
      </div>
      <div data-automation-id="legalNameSection_lastName">
        <label>Last Name</label>
        <input type="text" data-automation-id="lastNameInput" name="lastName" required />
      </div>
      <div data-automation-id="contactInfoSection_email">
        <label>Email Address</label>
        <input type="email" data-automation-id="emailInput" name="email" required />
      </div>
      <div data-automation-id="contactInfoSection_phone">
        <label>Phone Number</label>
        <input type="tel" data-automation-id="phoneInput" name="phone" required />
      </div>
      <div data-automation-id="socialSection_linkedin">
        <label>LinkedIn</label>
        <input type="url" data-automation-id="linkedinInput" name="linkedin" />
      </div>
      <button type="button" data-automation-id="bottom-navigation-next-button">Next</button>
    </form>
  </div>
`;
