# Applying User Guide

Learn how to discover jobs, evaluate fit, tailor application materials with evidence constraints, and complete submissions.

## 1. Job Discovery & Capability Cards

- **Deterministic Eligibility Evaluation:** NextJob checks mandatory requirements (work authorization, location, licensure, clearance) before ranking.
- **Capability Model Job Cards:** Each job card highlights key capability dimensions:
  - **Fit:** Match score based on role alignment and skill overlap.
  - **Eligibility:** Verified status (ELIGIBLE, INELIGIBLE, or UNKNOWN).
  - **Freshness:** Posting recency score.
  - **Automation & Execution:** Connector readiness and mode.

## 2. AI Tailoring with Evidence Constraints

When tailoring a resume variant or cover letter for a job:

- **Evidence Mapping:** Every generated statement maps directly to a verified claim in your Career Graph.
- **Review UI:** The tailoring interface displays a side-by-side view:
  - **Original Claim:** Your verified source experience.
  - **Proposed Wording:** The tailored statement formatted for the job requirements.
  - **Evidence Provenance:** Attached evidence chip linking to the source record.
- **Decision Controls:** You can Accept, Edit, or Reject each proposed statement before finalizing materials.

## 3. Risk Classifications & Approvals

Application fields are evaluated by the risk and policy engine:

- **Low / Medium Risk:** Basic contact info and standard work history.
- **High Risk:** Custom questions or open-ended responses.
- **Sensitive Risk:** Demographic, disability, health, or legal fields.
- **Approval Dialog:** When an application contains High or Sensitive fields, an interactive approval dialog presents the question, proposed answer, risk level, and payload version hash. You can choose:
  - *Approve Once:* Approve for this single application.
  - *Always Approve:* Store approval preference for identical future questions.
  - *Edit Answer:* Provide a custom answer.
  - *Reject / Block:* Decline answering or block the field.

## 4. Extension & ATS Connector Submissions

- **Browser Extension:** The NextJob WXT extension detects forms on ATS platforms (e.g., Greenhouse, Lever, Workday).
- **Autofill & Execution:** Approved answers are populated into form fields with client-side verification.
- **Duplicate Prevention:** Form state is checked prior to submission to prevent accidental duplicate applications.
