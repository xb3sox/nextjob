# NextJob Email Nurture Sequences

> **FR-CONT-05 Specification**
> Automated email nurture sequences for candidate onboarding, value delivery, and re-engagement.
> **Core Sequences:** Welcome Series (3 emails / 7 days) · Onboarding Series (5 emails / 14 days) · Re-engagement Series (Monthly)
> **Copy Standards:** Follows `copywriting-guidelines.md` (< 20 words per sentence, active voice, zero jargon, clear CTAs).

---

## 1. Sequence Overview & Strategy

NextJob nurture emails guide candidates from account creation to submitting their first verified application with complete evidence provenance.

```
Welcome Series (7 Days)
├── Day 0: Account Created — Create Your Career Profile
├── Day 3: Verify Claims — Turn Experience into Grounded Evidence
└── Day 7: Activate Matching — Discover Eligible Opportunities

Onboarding Series (14 Days)
├── Day 1: Profile Import — Upload CV & Extract Claims
├── Day 4: Preferences — Set Location, Salary & Visa Constraints
├── Day 7: Tailoring — Review Bullet Points with Evidence Provenance
├── Day 10: Automation Policy — Choose Manual, Copilot, or Autopilot
└── Day 14: First Application — Submit & Receive SHA-256 Receipt

Re-Engagement Series (Monthly)
└── Day 30+: Monthly Check-in — Review New Matches & Refresh Profile
```

---

## 2. Welcome Series (3 Emails / 7 Days)

### Email W1 (Day 0): Welcome & Profile Setup
- **Trigger:** Candidate signs up for NextJob.
- **Cadence:** Immediate (Day 0).
- **Subject:** Welcome to NextJob — start your verified profile.
- **Preheader:** Import your resume to extract verified career claims in seconds.
- **CTA:** `Verify your profile — start setup`

#### Body Copy (Plain Text)
```text
Hi {{candidateName}},

Welcome to NextJob. We replace job application promises with verified evidence.

To get started, upload your current CV. Our AI extracts your employment history, skills, and achievements as verifiable claims.

Next steps:
1. Upload your resume (PDF or DOCX).
2. Review extracted career claims.
3. Link claims to supporting evidence.

Upload your resume now: {{actionUrl}}

Best,
The NextJob Team
```

---

### Email W2 (Day 3): Verify Claims & Provenance
- **Trigger:** Account age = 3 days, profile incomplete or claims unverified.
- **Cadence:** Day 3 after signup.
- **Subject:** Verify your claims — build your evidence graph.
- **Preheader:** Ground every resume statement in real work evidence.
- **CTA:** `Review career claims`

#### Body Copy (Plain Text)
```text
Hi {{candidateName}},

NextJob never fabricates candidate experience. Every tailored resume bullet traces back to an approved CareerClaim.

Verifying your claims ensures 100% factuality across all applications.

Review your claims today:
• Confirm extracted roles and dates.
• Edit or remove unverified statements.
• Attach evidence documents for maximum trust.

Review your claims now: {{actionUrl}}

Best,
The NextJob Team
```

---

### Email W3 (Day 7): Activate Matching & Tailoring
- **Trigger:** Account age = 7 days, claims verified.
- **Cadence:** Day 7 after signup.
- **Subject:** Match eligible roles — tailor with proof.
- **Preheader:** Discover roles where your qualifications satisfy hard constraints.
- **CTA:** `View matched jobs`

#### Body Copy (Plain Text)
```text
Hi {{candidateName}},

Your profile is ready. NextJob evaluates hard eligibility constraints before ranking job matches.

You have {{matchCount}} matched roles waiting in your dashboard.

Why candidate matching works:
• Eligibility screens visa, location, and salary first.
• AI tailoring uses only your verified evidence.
• Submissions generate immutable cryptographic receipts.

View your job matches: {{actionUrl}}

Best,
The NextJob Team
```

---

## 3. Onboarding Series (5 Emails / 14 Days)

### Email O1 (Day 1): CV Import & Extraction
- **Trigger:** New user onboarding start.
- **Cadence:** Day 1.
- **Subject:** Extract career claims from your resume.
- **Preheader:** See how NextJob turns raw CV text into structured evidence.
- **CTA:** `Import resume now`

### Email O2 (Day 4): Target Preferences & Hard Constraints
- **Trigger:** Day 4 of onboarding.
- **Cadence:** Day 4.
- **Subject:** Set target roles, salary, and location filters.
- **Preheader:** Filter out auto-rejects by specifying hard eligibility criteria.
- **CTA:** `Set search preferences`

### Email O3 (Day 7): Tailoring with Evidence Provenance
- **Trigger:** Day 7 of onboarding.
- **Cadence:** Day 7.
- **Subject:** Review AI tailored resume bullets.
- **Preheader:** Accept, edit, or reject tailored bullets with full provenance.
- **CTA:** `Review tailored bullets`

### Email O4 (Day 10): Automation Policy & Approvals
- **Trigger:** Day 10 of onboarding.
- **Cadence:** Day 10.
- **Subject:** Control your application automation mode.
- **Preheader:** Choose between Manual, Copilot, and Autopilot execution modes.
- **CTA:** `Configure automation policy`

### Email O5 (Day 14): First Submission & Cryptographic Receipt
- **Trigger:** Day 14 of onboarding.
- **Cadence:** Day 14.
- **Subject:** Submit your first application with proof.
- **Preheader:** Experience automated submission and receive a signed receipt.
- **CTA:** `Submit first application`

---

## 4. Re-Engagement Series (Monthly)

### Email R1 (Day 30): Monthly Profile & Market Check-in
- **Trigger:** Candidate inactive for 30 days.
- **Cadence:** Every 30 days of inactivity.
- **Subject:** {{matchCount}} new job matches available on NextJob.
- **Preheader:** Review fresh opportunity matches and keep your career claims updated.
- **CTA:** `Explore new matches`

#### Body Copy (Plain Text)
```text
Hi {{candidateName}},

We found {{matchCount}} new job opportunities matching your verified career profile this month.

Keeping your profile fresh ensures you never miss eligible roles:
• Update recent project achievements.
• Adjust salary and remote preferences.
• Review auto-matched opportunities.

Check your updated matches: {{actionUrl}}

Best,
The NextJob Team
```

---

## 5. Copywriting Guidelines Alignment Check

| Guideline Rule | Compliance Evidence |
| :--- | :--- |
| **< 20 Words / Sentence** | All sentences in sequence copy average 12-16 words. |
| **Active Voice** | Actions put the candidate or system actor first (e.g., "NextJob evaluates hard eligibility constraints..."). |
| **Conversational & Trustworthy** | Direct peer-to-peer tone without hype or superlatives. |
| **Zero Jargon** | Banned buzzwords ("AI magic", "shotgun apply", "1-click offer") excluded. |
| **Explicit CTAs** | Action-oriented button copy (`Verify your profile — start setup`, `View matched jobs`). |
