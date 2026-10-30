# Privacy Controls User Guide

NextJob provides privacy controls that give you complete ownership and transparency over your personal data and Career Graph.

## 1. Inspect & Correct Data

- **View Data:** Inspect all stored claims, evidence documents, preferences, and approval logs in your account dashboard.
- **Data Corrections:** Submit corrections for any claim or profile detail. Corrections immediately update your career claims and invalidate outdated tailored assets.

## 2. Data Export

- **Full Export Package:** Download a complete JSON archive containing your profile, claims, evidence metadata, application history, and consents.
- **SHA-256 Checksum:** Every exported archive includes an accompanying SHA-256 checksum file to verify download integrity.

## 3. Account & Data Deletion

- **Cascading Purge:** Requesting account deletion triggers a cascading purge that permanently removes your profile, career claims, evidence documents, preferences, application records, and approval history across all database storage.
- **Deletion Receipt:** Upon completion of data deletion, NextJob issues an immutable `DataDeletionReceipt` acknowledging the purge.

## 4. Model Training Opt-Out & Disconnection

- **Disable Learning:** Opt out of having your anonymized profile or application interactions used for model quality improvements or evaluation datasets.
- **Disconnect Integrations:** Instantly revoke connected ATS credentials, session tokens, or browser extension permissions. Disconnecting immediately terminates active background workers and automated sync operations.
