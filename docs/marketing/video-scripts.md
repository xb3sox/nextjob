# NextJob Video Production Scripts & Guidelines

> **FR-CONT-04 Specification**  
> Complete audiovisual production scripts for marketing, product walkthroughs, and customer testimonials.  
> **Deliverables:** 60s Product Demo · 90s Brand Explainer · Customer Testimonial Interview Template

---

## 1. Product Demo Video (60 Seconds)

**Title:** NextJob in 60 Seconds: Honest Career Automation  
**Target Duration:** 60s (Paced at ~130 words per minute)  
**Music Track:** Clean, modern electronic rhythm; minimal, rhythmic, confident. No dramatic swells.

| Time | Visual Direction | On-Screen Graphic / UI | Voiceover (Audio) |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:08** | Fast zoom into a candidate's messy PDF resume dragging onto the NextJob dropzone. | `Importing Career Data...` | "You’ve spent years building real engineering experience. But job applications shouldn’t feel like a full-time job." |
| **0:08 - 0:18** | Split view: PDF text highlights and parses into distinct verified `CareerClaim` nodes with primary source evidence chips. | `Extracted 24 CareerClaims · 100% Provenance` | "NextJob extracts your work into immutable career claims. Every skill, project, and metric traces back to verifiable proof." |
| **0:18 - 0:30** | Dashboard shows live job card. Eligibility engine runs 10 constraint checks; match score animates to 94%. | `Eligibility: Verified · Hard Constraints: Passed` | "Before you waste time applying, our eligibility engine checks hard requirements. If a company requires US citizenship or 5 years in Go, you know instantly." |
| **0:30 - 0:42** | Tailor view. Proposed resume bullet highlights side-by-side with original claim and linked Github PR evidence. | `Original Claim → Tailored Bullet → Proof` | "Our tailoring engine adapts your bullets to match the job description, without ever fabricating a single word. Zero hallucinations." |
| **0:42 - 0:52** | Browser extension submits directly to Greenhouse ATS. Cryptographic receipt modal appears with SHA-256 hash. | `Application Submitted · Receipt: 0x7f8a...` | "Submit directly through native ATS connectors. You receive a frozen, cryptographic receipt of every answer transmitted." |
| **0:52 - 1:00** | Clean dark-mode outro screen with URL and single input CTA. | **NextJob.ai**<br>`Start free — create your account` | "Honest career automation, verified by evidence. Start free at NextJob.ai." |

---

## 2. Brand Explainer Video (90 Seconds)

**Title:** The Death of Resume Spam: Why Evidence Wins  
**Target Duration:** 90s  
**Tone:** Confident, analytical, empathetic, technical.

| Time | Visual Direction | On-Screen Graphic | Voiceover (Audio) |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:15** | Animated visualization of the broken hiring market: millions of AI bots spamming fake resumes, drowning recruiters in noise. | `The ATS Black Hole · Hallucinated Resumes` | "The job market is broken. Generative AI bots blast thousands of hallucinated resumes every minute. In response, ATS filters reject qualified candidates on sight." |
| **0:15 - 0:30** | Transition to NextJob's dark, focused interface. A single high-signal application card illuminates. | `High-Signal Automation · 100% Truth` | "NextJob was built on a different principle: what if automation was honest? What if every single claim on your resume was mathematically verifiable?" |
| **0:30 - 0:45** | Focus on the Evidence Vault. The candidate inspects their verified claims, verified work authorization, and confirmed skills. | `Career Vault · Provenance Tracing` | "It starts with your Career Vault. We extract your experience into verified claims. You confirm the facts once; NextJob guards their truth forever." |
| **0:45 - 1:05** | UI displays strict eligibility screening. A role that requires 10 years experience marks `Ineligible` with clear explanation. Another marks `Eligible`. | `Screening Rate: <2% False-Positive Rate` | "NextJob never sends blind applications. Our eligibility engine checks 10 hard constraints first, keeping false positives under 2%. You only apply where you qualify." |
| **1:05 - 1:20** | Submission moment. The state machine transitions from `Review` to `Submitted` to `Receipt Verified`. | `SHA-256 Frozen State · Receipt Verified` | "When an application goes out, NextJob freezes the submission into a SHA-256 cryptographic receipt. You possess permanent proof of what was sent." |
| **1:20 - 1:30** | Outro card with brand typography and key metric callout: 3.2x callback lift. | **NextJob**<br>3.2x Callback Lift · NextJob.ai | "No fake claims. No automated bans. Just honest automation that works. Create your account today at NextJob.ai." |

---

## 3. Customer Testimonial Interview Template

**Format:** 1-on-1 remote or studio video interview with candidate or talent leader.  
**Style:** Documentary, authentic, natural lighting, high-quality audio.

### Candidate Interview Framework

#### Segment 1: The Pain (Pre-NextJob)
1. "How many hours a week were you spending on job applications before using NextJob?"
2. "What was your biggest frustration with other AI tools or automated job boards?"
3. "Did you ever worry about AI tools hallucinating skills you didn't have?"

#### Segment 2: The Breakthrough (The NextJob Experience)
4. "What surprised you most about the profile extraction and CareerClaim setup?"
5. "How did it feel seeing the eligibility score before you submitted?"
6. "Walk us through the first time you received a submission receipt."

#### Segment 3: The Outcome & Recommendation
7. "What was your interview callback rate compared to your previous manual search?"
8. "If a fellow engineer asked if NextJob is just another spam bot, what would you tell them?"

### Required B-Roll Capture Checklist
- Candidate reviewing verified claims on laptop screen.
- Close-up of clicking `Review & Apply` on a tailored job card.
- Viewing the receipt hash verification screen.
- Casual, authentic profile shots (smiling, confident, focused working).

---

## 4. Production Standards & Voice Adherence

- **Word Economy:** Voiceover must stay strictly under 140 words per 60 seconds to prevent rushed pacing.
- **Visual Accuracy:** Never mock up UI elements that do not exist in the shipping product. Use actual production views (`JobCard`, `WaitlistForm`, `TailorPage`, `ApplicationsPage`).
- **Brand Colors:** Background near-black (`#0a0a0a`), text white (`#ffffff`), accent moss (`#10b981`), borders subtle (`rgba(255,255,255,0.1)`).
- **Audio Cleanliness:** Voiceover audio must be crisp with a -16 LUFS integrated target, no echo, and high dynamic range.
