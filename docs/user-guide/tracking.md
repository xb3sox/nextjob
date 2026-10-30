# Application Tracking User Guide

Track all your job applications, inspect cryptographic submission receipts, and manage application outcomes.

## 1. Application Tracker UI & Views

The Application Tracker organizes your active job search into clear status views:

- **Planned:** Jobs saved or staged for future application.
- **Needs Approval:** Applications awaiting your review on high-risk or sensitive field approvals.
- **Applying:** Applications currently in progress or executing through an ATS connector.
- **Applied:** Applications submitted and pending recruiter feedback.
- **Interview:** Applications progressed to screening or interview rounds.
- **Offer / Rejected / Withdrawn:** Final application outcome states.

Use the search bar and filter controls to narrow applications by company name, job title, status, or date range.

## 2. Submission Receipts

NextJob generates an immutable submission receipt for every completed application:

- **Cryptographic Hashes:** The receipt stores SHA-256 hashes of submitted fields and answers, preserving proof of submission without storing unencrypted sensitive values in receipt logs.
- **Job Version & Provenance:** Stores the exact job snapshot version, connector ID, timestamp, and confirmation evidence.
- **Verification Status:** Receipts carry a verification status (`unverified` vs. `verified`).
- **Integrity Validation:** Receipts are content-hashed. Any manual alteration invalidates the receipt check.

## 3. Manual Outcome Updates

Keep your tracker accurate by recording updates:

- **Update Status:** Change an application's state to *Interview*, *Offer*, *Rejected*, *Withdrawn*, or *Hired*.
- **Add Notes:** Record interview dates, recruiter contacts, or feedback notes.
- **Withdrawal:** Mark applications as withdrawn if you accept another offer or choose to opt out.
