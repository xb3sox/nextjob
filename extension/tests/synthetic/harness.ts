import type { AtsPlatform } from './types';

export function createMockGreenhouseHtml(): string {
  return `
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
}

export function createMockLeverHtml(): string {
  return `
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
}

export function createMockWorkdayHtml(): string {
  return `
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
}

export function createMockAtsPage(platform: AtsPlatform): HTMLElement {
  const container = document.createElement('div');
  container.id = 'synthetic-ats-container';

  switch (platform) {
    case 'greenhouse':
      container.innerHTML = createMockGreenhouseHtml();
      break;
    case 'lever':
      container.innerHTML = createMockLeverHtml();
      break;
    case 'workday':
      container.innerHTML = createMockWorkdayHtml();
      break;
    default:
      container.innerHTML = createMockGreenhouseHtml();
      break;
  }

  document.body.appendChild(container);
  return container;
}

export function cleanupMockAtsPage(): void {
  const existing = document.getElementById('synthetic-ats-container');
  if (existing) {
    existing.remove();
  }
}
