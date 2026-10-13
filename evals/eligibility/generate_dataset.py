#!/usr/bin/env python3
"""Generate the eligibility evaluation dataset for T-13.

Produces cases.json — one case per record, each containing:
  - id, dimension, expectedStatus, rationale
  - rules[]   : fed to EligibilityEngineService.createRule() verbatim
  - profile   : fed to checkEligibility() as userProfile
  - job       : fed to checkEligibility() as job
  - checks[]  : per-rule expectations (status + optional reason substring)

Expected statuses were derived by hand from the engine semantics in
packages/api/src/eligibility/eligibility-engine.ts and are enforced at
runtime by evals/eligibility/eligibility-eval.test.ts (the G-04 gate).

Usage: python3 generate_dataset.py
"""

import json
import random
from datetime import date, timedelta
from pathlib import Path

random.seed(20261014)  # deterministic regeneration

TENANT = "00000000-0000-4000-8000-0000000000e1"  # valid UUID (EligibilityRuleSchema requires uuid)
USER = "00000000-0000-4000-8000-0000000000e2"    # valid UUID

DEGREES = ["high_school", "associate", "bachelor", "master", "doctorate"]
PROFICIENCIES = ["basic", "intermediate", "professional", "fluent", "native"]
CLEARANCES = ["none", "confidential", "secret", "top_secret", "ts_sci"]

COUNTRIES = [
    "US", "CA", "GB", "DE", "FR", "IN", "AU", "JP", "BR", "MX",
    "NL", "ES", "IT", "SG", "KR",
]
SKILLS = [
    "javascript", "python", "go", "rust", "java", "sql", "react",
    "node.js", "aws", "docker", "kubernetes", "terraform", "swift",
    "c++", "typescript",
]
LANGUAGES = ["english", "spanish", "french", "german", "japanese", "mandarin", "portuguese"]
AUTHS = ["US Citizen", "Green Card", "H1B", "EU Passport", "Work Permit", "Open Work Permit"]
LICENSES = ["RN", "CDL-A", "PE", "Series 7", "Real Estate", "Electrician", "Pilots License"]
CERTS = ["AWS SA", "PMP", "CISSP", "CPA", "CFA", "K8s CKA", "Scrum Master", "Comptia Security+"]
FIELDS = ["computer science", "mathematics", "engineering", "business", "physics", "biology", "law"]


def iso_days_ago(days: int) -> str:
    return (date(2026, 10, 14) - timedelta(days=days)).isoformat()


CASES = []


def add(dimension, expected, rationale, rules, profile, job, check_expectations):
    cid = f"ELG-{dimension.upper()[:3]}-{len(CASES) + 1:03d}"
    CASES.append({
        "id": cid,
        "dimension": dimension,
        "expectedStatus": expected,
        "rationale": rationale,
        "rules": rules,
        "profile": profile,
        "job": job,
        "checks": check_expectations,
    })


_rule_seq = [0]


def rule(check_type, condition, name=None, required=True):
    _rule_seq[0] += 1
    return {
        "tenantId": TENANT,
        "name": name or f"rule-{_rule_seq[0]:03d} {check_type}",
        "checkType": check_type,
        "required": required,
        "condition": condition,
        "userId": USER,
    }


# ---------------------------------------------------------------------------
# location (12)
# ---------------------------------------------------------------------------
LOC_JOB = {"location": {"country": "US", "city": "New York", "remote": False}}

add("location", "eligible", "User in allowed country list.",
    [rule("location", {"countries": ["US", "CA"]})],
    {"location": {"country": "US", "city": "Austin"}}, LOC_JOB,
    [{"type": "location", "status": "eligible"}])

add("location", "ineligible", "User country not in allowed list.",
    [rule("location", {"countries": ["US", "CA"]})],
    {"location": {"country": "IN"}}, LOC_JOB,
    [{"type": "location", "status": "ineligible", "reason_contains": "not in allowed countries"}])

add("location", "eligible", "Remote position overrides country restriction (allowRemote default true).",
    [rule("location", {"countries": ["US"], "allowRemote": True})],
    {"location": {"country": "BR"}},
    {"location": {"country": "US", "remote": True}},
    [{"type": "location", "status": "eligible", "reason_contains": "Remote position"}])

add("location", "eligible", "Onsite US job, user in US; no country condition set.",
    [rule("location", {})],
    {"location": {"country": "US"}}, LOC_JOB,
    [{"type": "location", "status": "eligible"}])

add("location", "unknown", "Missing user location yields unknown.",
    [rule("location", {"countries": ["US"]})],
    {}, LOC_JOB,
    [{"type": "location", "status": "unknown", "reason_contains": "Location information missing"}])

add("location", "ineligible", "Job requires relocation willingness; user unwilling.",
    [rule("location", {"requireRelocation": True})],
    {"location": {"country": "US"}, "willingToRelocate": False}, LOC_JOB,
    [{"type": "location", "status": "ineligible", "reason_contains": "relocation"}])

add("location", "eligible", "Job requires relocation; user willing.",
    [rule("location", {"requireRelocation": True})],
    {"location": {"country": "CA"}, "willingToRelocate": True}, LOC_JOB,
    [{"type": "location", "status": "eligible"}])

add("location", "eligible", "Single-country allow-list match.",
    [rule("location", {"countries": ["GB"]})],
    {"location": {"country": "GB", "city": "London"}},
    {"location": {"country": "GB", "city": "London", "remote": False}},
    [{"type": "location", "status": "eligible"}])

add("location", "ineligible", "Remote-only allowance disabled and user abroad.",
    [rule("location", {"countries": ["US"], "allowRemote": False})],
    {"location": {"country": "DE"}},
    {"location": {"country": "US", "remote": True}},
    [{"type": "location", "status": "ineligible", "reason_contains": "not in allowed countries"}])

add("location", "eligible", "Wide allow-list match (SG).",
    [rule("location", {"countries": ["JP", "SG", "KR", "AU"]})],
    {"location": {"country": "SG"}},
    {"location": {"country": "JP", "remote": False}},
    [{"type": "location", "status": "eligible"}])

add("location", "unknown", "Empty profile with explicit countries condition still lacks user location.",
    [rule("location", {"countries": ["US"]})],
    {},
    {"location": {"country": "AU", "remote": False}},
    [{"type": "location", "status": "unknown", "reason_contains": "missing"}])

add("location", "eligible", "Remote job passes even when allowRemote unset and user abroad.",
    [rule("location", {"countries": ["US"]})],
    {"location": {"country": "MX"}},
    {"location": {"country": "US", "remote": True}},
    [{"type": "location", "status": "eligible", "reason_contains": "Remote"}])

# ---------------------------------------------------------------------------
# work_authorization (10)
# ---------------------------------------------------------------------------
add("work_authorization", "eligible", "User holds one of the required authorizations.",
    [rule("work_authorization", {"requiredAuthorizations": ["US Citizen", "Green Card"]})],
    {"workAuthorization": {"authorizations": ["Green Card"]}}, LOC_JOB,
    [{"type": "work_authorization", "status": "eligible"}])

add("work_authorization", "ineligible", "User authorization set does not intersect requirement.",
    [rule("work_authorization", {"requiredAuthorizations": ["US Citizen", "Green Card"]})],
    {"workAuthorization": {"authorizations": ["H1B"]}}, LOC_JOB,
    [{"type": "work_authorization", "status": "ineligible", "reason_contains": "does not have required work authorization"}])

add("work_authorization", "unknown", "No work authorization data on profile.",
    [rule("work_authorization", {"requiredAuthorizations": ["EU Passport"]})],
    {}, LOC_JOB,
    [{"type": "work_authorization", "status": "unknown", "reason_contains": "missing"}])

add("work_authorization", "eligible", "Multiple authorizations include required EU Passport.",
    [rule("work_authorization", {"requiredAuthorizations": ["EU Passport"]})],
    {"workAuthorization": {"authorizations": ["Work Permit", "EU Passport"]}},
    {"location": {"country": "DE", "remote": False}},
    [{"type": "work_authorization", "status": "eligible"}])

add("work_authorization", "eligible", "Any-of list matched by second entry.",
    [rule("work_authorization", {"requiredAuthorizations": ["US Citizen", "H1B", "Green Card"]})],
    {"workAuthorization": {"authorizations": ["H1B"]}}, LOC_JOB,
    [{"type": "work_authorization", "status": "eligible"}])

add("work_authorization", "ineligible", "Citizen-only role; user has permit only.",
    [rule("work_authorization", {"requiredAuthorizations": ["US Citizen"]})],
    {"workAuthorization": {"authorizations": ["Open Work Permit"]}}, LOC_JOB,
    [{"type": "work_authorization", "status": "ineligible"}])

add("work_authorization", "eligible", "Present auth object with empty list but no condition requirements.",
    [rule("work_authorization", {})],
    {"workAuthorization": {"authorizations": []}}, LOC_JOB,
    [{"type": "work_authorization", "status": "eligible"}])

add("work_authorization", "eligible", "Broad any-of list satisfied.",
    [rule("work_authorization", {"requiredAuthorizations": ["Green Card", "Work Permit"]})],
    {"workAuthorization": {"authorizations": ["Work Permit"]}}, LOC_JOB,
    [{"type": "work_authorization", "status": "eligible"}])

add("work_authorization", "unknown", "Required check without auth info on remote-EU job.",
    [rule("work_authorization", {"requiredAuthorizations": ["EU Passport"]})],
    {},
    {"location": {"country": "NL", "remote": True}},
    [{"type": "work_authorization", "status": "unknown"}])

add("work_authorization", "eligible", "Government-adjacent role requiring citizen OR green card; user has Green Card.",
    [rule("work_authorization", {"requiredAuthorizations": ["US Citizen", "Green Card"]})],
    {"workAuthorization": {"authorizations": ["H1B", "Green Card"]}}, LOC_JOB,
    [{"type": "work_authorization", "status": "eligible", "reason_contains": None}])

# ---------------------------------------------------------------------------
# sponsorship (10)
# ---------------------------------------------------------------------------
add("sponsorship", "ineligible", "User needs sponsorship; job does not offer it.",
    [rule("sponsorship", {})],
    {"needsSponsorship": True},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": False},
    [{"type": "sponsorship", "status": "ineligible", "reason_contains": "does not offer"}])

add("sponsorship", "eligible", "User needs sponsorship and job offers it.",
    [rule("sponsorship", {})],
    {"needsSponsorship": True},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": True},
    [{"type": "sponsorship", "status": "eligible"}])

add("sponsorship", "eligible", "User does not need sponsorship; job irrelevant.",
    [rule("sponsorship", {})],
    {"needsSponsorship": False},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": False},
    [{"type": "sponsorship", "status": "eligible"}])

add("sponsorship", "ineligible", "requireNoSponsorship policy rejects sponsored candidate even when job offers sponsorship.",
    [rule("sponsorship", {"requireNoSponsorship": True})],
    {"needsSponsorship": True},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": True},
    [{"type": "sponsorship", "status": "ineligible", "reason_contains": "no sponsorship needed"}])

add("sponsorship", "eligible", "requireNoSponsorship satisfied by self-authorised user.",
    [rule("sponsorship", {"requireNoSponsorship": True})],
    {"needsSponsorship": False},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": False},
    [{"type": "sponsorship", "status": "eligible"}])

add("sponsorship", "eligible", "Undefined sponsorship flag treated as falsy; eligible.",
    [rule("sponsorship", {})],
    {},
    {"location": {"country": "CA", "remote": False}},
    [{"type": "sponsorship", "status": "eligible"}])

add("sponsorship", "ineligible", "Needs sponsorship; job flag absent (falsy).",
    [rule("sponsorship", {})],
    {"needsSponsorship": True},
    {"location": {"country": "GB", "remote": False}},
    [{"type": "sponsorship", "status": "ineligible"}])

add("sponsorship", "eligible", "Needs sponsorship; remote role advertises sponsorship.",
    [rule("sponsorship", {})],
    {"needsSponsorship": True},
    {"location": {"country": "US", "remote": True}, "visaSponsorship": True},
    [{"type": "sponsorship", "status": "eligible"}])

add("sponsorship", "eligible", "No sponsorship requirement configured; defaults pass.",
    [rule("sponsorship", {})],
    {"needsSponsorship": False},
    {"location": {"country": "AU", "remote": False}, "visaSponsorship": True},
    [{"type": "sponsorship", "status": "eligible"}])

add("sponsorship", "ineligible", "Defense contractor policy: no sponsorship accepted; user needs it.",
    [rule("sponsorship", {"requireNoSponsorship": True})],
    {"needsSponsorship": True},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": False},
    [{"type": "sponsorship", "status": "ineligible"}])

# ---------------------------------------------------------------------------
# license (10)
# ---------------------------------------------------------------------------
add("license", "eligible", "All required licenses held and valid.",
    [rule("license", {"requiredLicenses": ["RN"]})],
    {"licenses": [{"name": "RN", "valid": True}]}, LOC_JOB,
    [{"type": "license", "status": "eligible"}])

add("license", "ineligible", "License held but expired (invalid).",
    [rule("license", {"requiredLicenses": ["RN"]})],
    {"licenses": [{"name": "RN", "valid": False}]}, LOC_JOB,
    [{"type": "license", "status": "ineligible", "reason_contains": "required licenses"}])

add("license", "ineligible", "Required license missing entirely.",
    [rule("license", {"requiredLicenses": ["CDL-A"]})],
    {"licenses": []}, LOC_JOB,
    [{"type": "license", "status": "ineligible"}])

add("license", "eligible", "Two required licenses both present and valid.",
    [rule("license", {"requiredLicenses": ["PE", "Real Estate"]})],
    {"licenses": [{"name": "PE", "valid": True}, {"name": "Real Estate", "valid": True}]},
    LOC_JOB,
    [{"type": "license", "status": "eligible"}])

add("license", "ineligible", "One of two required licenses invalid.",
    [rule("license", {"requiredLicenses": ["PE", "Electrician"]})],
    {"licenses": [{"name": "PE", "valid": True}, {"name": "Electrician", "valid": False}]},
    LOC_JOB,
    [{"type": "license", "status": "ineligible"}])

add("license", "eligible", "No required licenses configured; auto-pass.",
    [rule("license", {})],
    {"licenses": [{"name": "CDL-A", "valid": True}]}, LOC_JOB,
    [{"type": "license", "status": "eligible"}])

add("license", "ineligible", "Missing licenses field treated as empty list.",
    [rule("license", {"requiredLicenses": ["Pilots License"]})],
    {},
    {"location": {"country": "US", "remote": False}},
    [{"type": "license", "status": "ineligible"}])

add("license", "eligible", "Extra unrelated licenses do not block required match.",
    [rule("license", {"requiredLicenses": ["Series 7"]})],
    {"licenses": [{"name": "CDL-A", "valid": True}, {"name": "Series 7", "valid": True}]},
    LOC_JOB,
    [{"type": "license", "status": "eligible"}])

add("license", "ineligible", "Name mismatch is exact-match sensitive ('RN License' != 'RN').",
    [rule("license", {"requiredLicenses": ["RN"]})],
    {"licenses": [{"name": "RN License", "valid": True}]}, LOC_JOB,
    [{"type": "license", "status": "ineligible"}])

add("license", "eligible", "Optional (non-required) license rule fails but must not gate overall eligibility.",
    [rule("license", {"requiredLicenses": ["Electrician"]}, required=False)],
    {"licenses": []}, LOC_JOB,
    [{"type": "license", "status": "ineligible"}])

# ---------------------------------------------------------------------------
# certification (10)
# ---------------------------------------------------------------------------
add("certification", "eligible", "Required certification held.",
    [rule("certification", {"requiredCertifications": ["AWS SA"]})],
    {"certifications": [{"name": "AWS SA"}]}, LOC_JOB,
    [{"type": "certification", "status": "eligible"}])

add("certification", "ineligible", "Required certification missing.",
    [rule("certification", {"requiredCertifications": ["CISSP"]})],
    {"certifications": [{"name": "Comptia Security+"}]}, LOC_JOB,
    [{"type": "certification", "status": "ineligible", "reason_contains": "required certifications"}])

add("certification", "eligible", "Both required certifications held.",
    [rule("certification", {"requiredCertifications": ["PMP", "Scrum Master"]})],
    {"certifications": [{"name": "PMP"}, {"name": "Scrum Master"}]}, LOC_JOB,
    [{"type": "certification", "status": "eligible"}])

add("certification", "ineligible", "Only one of two required certs held.",
    [rule("certification", {"requiredCertifications": ["PMP", "CSM Advanced"]})],
    {"certifications": [{"name": "PMP"}]}, LOC_JOB,
    [{"type": "certification", "status": "ineligible"}])

add("certification", "eligible", "No condition configured; auto-pass.",
    [rule("certification", {})],
    {"certifications": []}, LOC_JOB,
    [{"type": "certification", "status": "eligible"}])

add("certification", "ineligible", "Empty certifications with requirement.",
    [rule("certification", {"requiredCertifications": ["CFA"]})],
    {"certifications": []},
    {"location": {"country": "US", "remote": False}},
    [{"type": "certification", "status": "ineligible"}])

add("certification", "eligible", "Cert validity is not checked (unlike licenses); held cert passes.",
    [rule("certification", {"requiredCertifications": ["K8s CKA"]})],
    {"certifications": [{"name": "K8s CKA"}]}, LOC_JOB,
    [{"type": "certification", "status": "eligible"}])

add("certification", "eligible", "Many held certs include the required one.",
    [rule("certification", {"requiredCertifications": ["CPA"]})],
    {"certifications": [{"name": "CFA"}, {"name": "CPA"}, {"name": "Series 7"}]}, LOC_JOB,
    [{"type": "certification", "status": "eligible"}])

add("certification", "ineligible", "Case-sensitive exact match required ('cissp' != 'CISSP').",
    [rule("certification", {"requiredCertifications": ["CISSP"]})],
    {"certifications": [{"name": "cissp"}]}, LOC_JOB,
    [{"type": "certification", "status": "ineligible"}])

add("certification", "eligible", "Missing certifications field with no requirement passes.",
    [rule("certification", {})],
    {}, LOC_JOB,
    [{"type": "certification", "status": "eligible"}])

# ---------------------------------------------------------------------------
# education (12)
# ---------------------------------------------------------------------------
add("education", "eligible", "Bachelor meets bachelor minimum.",
    [rule("education", {"minimumDegree": "bachelor"})],
    {"education": [{"degree": "bachelor", "field": "Computer Science"}]}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

add("education", "eligible", "Master exceeds bachelor minimum.",
    [rule("education", {"minimumDegree": "bachelor"})],
    {"education": [{"degree": "master", "field": "Data Science"}]}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

add("education", "ineligible", "Associate below bachelor minimum.",
    [rule("education", {"minimumDegree": "bachelor"})],
    {"education": [{"degree": "associate", "field": "IT"}]}, LOC_JOB,
    [{"type": "education", "status": "ineligible", "reason_contains": "minimum required education"}])

add("education", "ineligible", "High school below master minimum.",
    [rule("education", {"minimumDegree": "master"})],
    {"education": [{"degree": "high_school"}]}, LOC_JOB,
    [{"type": "education", "status": "ineligible"}])

add("education", "eligible", "Doctorate satisfies doctorate minimum.",
    [rule("education", {"minimumDegree": "doctorate"})],
    {"education": [{"degree": "doctorate", "field": "Physics"}]}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

add("education", "eligible", "Field requirement satisfied (case-insensitive contains).",
    [rule("education", {"requiredFields": ["computer science"]})],
    {"education": [{"degree": "bachelor", "field": "Computer Science"}]}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

add("education", "ineligible", "Wrong field of study.",
    [rule("education", {"requiredFields": ["law"]})],
    {"education": [{"degree": "master", "field": "Business"}]}, LOC_JOB,
    [{"type": "education", "status": "ineligible", "reason_contains": "field of study"}])

add("education", "eligible", "Any-of fields matched by second entry.",
    [rule("education", {"requiredFields": ["mathematics", "engineering"]})],
    {"education": [{"degree": "bachelor", "field": "Engineering"}]}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

add("education", "ineligible", "Combined degree+field: degree ok, field wrong.",
    [rule("education", {"minimumDegree": "bachelor", "requiredFields": ["physics"]})],
    {"education": [{"degree": "bachelor", "field": "Chemistry"}]}, LOC_JOB,
    [{"type": "education", "status": "ineligible"}])

add("education", "eligible", "Multiple degrees; highest satisfies requirement.",
    [rule("education", {"minimumDegree": "master"})],
    {"education": [{"degree": "bachelor"}, {"degree": "master"}]}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

add("education", "ineligible", "Empty education history against degree requirement.",
    [rule("education", {"minimumDegree": "high_school"})],
    {"education": []}, LOC_JOB,
    [{"type": "education", "status": "ineligible"}])

add("education", "eligible", "No conditions configured; auto-pass even with empty education.",
    [rule("education", {})],
    {"education": []}, LOC_JOB,
    [{"type": "education", "status": "eligible"}])

# ---------------------------------------------------------------------------
# experience (10)
# ---------------------------------------------------------------------------
add("experience", "eligible", "5 years continuous experience meets 3-year minimum.",
    [rule("experience", {"minimumYears": 3})],
    {"experience": [{"startDate": iso_days_ago(365 * 5 + 30), "endDate": iso_days_ago(30)}]},
    LOC_JOB,
    [{"type": "experience", "status": "eligible"}])

add("experience", "ineligible", "1 year falls short of 3-year minimum.",
    [rule("experience", {"minimumYears": 3})],
    {"experience": [{"startDate": iso_days_ago(365), "endDate": iso_days_ago(1)}]},
    LOC_JOB,
    [{"type": "experience", "status": "ineligible", "reason_contains": "years of experience"}])

add("experience", "eligible", "Current open-ended role counts to today (~2.9y vs 2y min).",
    [rule("experience", {"minimumYears": 2})],
    {"experience": [{"startDate": iso_days_ago(int(2.9 * 365))}]},
    LOC_JOB,
    [{"type": "experience", "status": "eligible"}])

add("experience", "eligible", "Summed overlapping roles exceed threshold.",
    [rule("experience", {"minimumYears": 4})],
    {"experience": [
        {"startDate": iso_days_ago(365 * 3), "endDate": iso_days_ago(365)},
        {"startDate": iso_days_ago(365 * 2 + 60), "endDate": iso_days_ago(60)},
    ]},
    LOC_JOB,
    [{"type": "experience", "status": "eligible"}])

add("experience", "ineligible", "Empty experience against requirement.",
    [rule("experience", {"minimumYears": 1})],
    {"experience": []}, LOC_JOB,
    [{"type": "experience", "status": "ineligible"}])

add("experience", "eligible", "No minimum configured; auto-pass.",
    [rule("experience", {})],
    {"experience": []}, LOC_JOB,
    [{"type": "experience", "status": "eligible"}])

add("experience", "ineligible", "Entry-level applicant vs senior 7-year requirement.",
    [rule("experience", {"minimumYears": 7})],
    {"experience": [{"startDate": iso_days_ago(365 * 2 + 180)}]},
    {"location": {"country": "US", "remote": True}},
    [{"type": "experience", "status": "ineligible"}])

add("experience", "eligible", "Comfortably-above-threshold: ~4.1 years vs 4-year min.",
    [rule("experience", {"minimumYears": 4})],
    {"experience": [{"startDate": iso_days_ago(int(4.1 * 365)), "endDate": iso_days_ago(3)}]},
    LOC_JOB,
    [{"type": "experience", "status": "eligible"}])

add("experience", "ineligible", "Entries without startDate contribute zero years.",
    [rule("experience", {"minimumYears": 2})],
    {"experience": [{"endDate": iso_days_ago(100)}]},
    LOC_JOB,
    [{"type": "experience", "status": "ineligible"}])

add("experience", "eligible", "Long career well past requirement.",
    [rule("experience", {"minimumYears": 5})],
    {"experience": [
        {"startDate": iso_days_ago(365 * 9), "endDate": iso_days_ago(365 * 4)},
        {"startDate": iso_days_ago(365 * 4), "endDate": iso_days_ago(1)},
    ]},
    LOC_JOB,
    [{"type": "experience", "status": "eligible"}])

# ---------------------------------------------------------------------------
# skill (10)
# ---------------------------------------------------------------------------
add("skill", "eligible", "All required skills present (case-insensitive).",
    [rule("skill", {"requiredSkills": ["JavaScript", "React"]})],
    {"skills": [{"name": "javascript"}, {"name": "React"}]}, LOC_JOB,
    [{"type": "skill", "status": "eligible"}])

add("skill", "ineligible", "Missing one required skill.",
    [rule("skill", {"requiredSkills": ["Go", "Kubernetes"]})],
    {"skills": [{"name": "go"}]}, LOC_JOB,
    [{"type": "skill", "status": "ineligible", "reason_contains": "required skills"}])

add("skill", "ineligible", "Empty skill list against requirement.",
    [rule("skill", {"requiredSkills": ["Python"]})],
    {"skills": []}, LOC_JOB,
    [{"type": "skill", "status": "ineligible"}])

add("skill", "eligible", "No required skills configured; auto-pass.",
    [rule("skill", {})],
    {"skills": [{"name": "rust"}]}, LOC_JOB,
    [{"type": "skill", "status": "eligible"}])

add("skill", "eligible", "Broad stack covers narrow requirement list.",
    [rule("skill", {"requiredSkills": ["SQL", "Python"]})],
    {"skills": [{"name": "Python"}, {"name": "SQL"}, {"name": "AWS"}, {"name": "Docker"}]},
    LOC_JOB,
    [{"type": "skill", "status": "eligible"}])

add("skill", "ineligible", "Near-miss names ('node' vs 'node.js') fail exact match.",
    [rule("skill", {"requiredSkills": ["Node.js"]})],
    {"skills": [{"name": "node"}]}, LOC_JOB,
    [{"type": "skill", "status": "ineligible"}])

add("skill", "eligible", "Mixed-case requirement matched via lowercase comparison.",
    [rule("skill", {"requiredSkills": ["TYPESCRIPT"]})],
    {"skills": [{"name": "TypeScript"}]}, LOC_JOB,
    [{"type": "skill", "status": "eligible"}])

add("skill", "ineligible", "Multiple missing skills reported together.",
    [rule("skill", {"requiredSkills": ["Rust", "Terraform", "AWS"]})],
    {"skills": [{"name": "AWS"}]}, LOC_JOB,
    [{"type": "skill", "status": "ineligible"}])

add("skill", "eligible", "Missing skills field with no requirement passes.",
    [rule("skill", {})],
    {}, LOC_JOB,
    [{"type": "skill", "status": "eligible"}])

add("skill", "eligible", "Single required skill satisfied exactly.",
    [rule("skill", {"requiredSkills": ["Java"]})],
    {"skills": [{"name": "java"}, {"name": "c++"}]},
    {"location": {"country": "DE", "remote": False}},
    [{"type": "skill", "status": "eligible"}])

# ---------------------------------------------------------------------------
# language (10)
# ---------------------------------------------------------------------------
add("language", "eligible", "Fluent meets fluent requirement.",
    [rule("language", {"requiredLanguages": [{"language": "English", "proficiency": "fluent"}]})],
    {"languages": [{"language": "english", "proficiency": "fluent"}]}, LOC_JOB,
    [{"type": "language", "status": "eligible"}])

add("language", "eligible", "Native exceeds professional requirement.",
    [rule("language", {"requiredLanguages": [{"language": "German", "proficiency": "professional"}]})],
    {"languages": [{"language": "German", "proficiency": "native"}]},
    {"location": {"country": "DE", "remote": False}},
    [{"type": "language", "status": "eligible"}])

add("language", "ineligible", "Intermediate below professional requirement.",
    [rule("language", {"requiredLanguages": [{"language": "French", "proficiency": "professional"}]})],
    {"languages": [{"language": "french", "proficiency": "intermediate"}]},
    {"location": {"country": "FR", "remote": False}},
    [{"type": "language", "status": "ineligible", "reason_contains": "language proficiency"}])

add("language", "ineligible", "Required language absent entirely.",
    [rule("language", {"requiredLanguages": [{"language": "Japanese"}]})],
    {"languages": [{"language": "english", "proficiency": "native"}]}, LOC_JOB,
    [{"type": "language", "status": "ineligible"}])

add("language", "eligible", "Unspecified requirement defaults to intermediate; user fluent passes.",
    [rule("language", {"requiredLanguages": [{"language": "Spanish"}]})],
    {"languages": [{"language": "spanish", "proficiency": "fluent"}]},
    {"location": {"country": "ES", "remote": False}},
    [{"type": "language", "status": "eligible"}])

add("language", "ineligible", "Unspecified requirement defaults to intermediate; user basic fails.",
    [rule("language", {"requiredLanguages": [{"language": "Mandarin"}]})],
    {"languages": [{"language": "mandarin", "proficiency": "basic"}]}, LOC_JOB,
    [{"type": "language", "status": "ineligible"}])

add("language", "eligible", "Multi-language requirement both satisfied.",
    [rule("language", {"requiredLanguages": [
        {"language": "English", "proficiency": "fluent"},
        {"language": "Portuguese", "proficiency": "intermediate"},
    ]})],
    {"languages": [
        {"language": "English", "proficiency": "native"},
        {"language": "Portuguese", "proficiency": "professional"},
    ]},
    {"location": {"country": "BR", "remote": False}},
    [{"type": "language", "status": "eligible"}])

add("language", "ineligible", "Multi-language requirement partially satisfied.",
    [rule("language", {"requiredLanguages": [
        {"language": "English", "proficiency": "fluent"},
        {"language": "German", "proficiency": "intermediate"},
    ]})],
    {"languages": [{"language": "English", "proficiency": "fluent"}]},
    {"location": {"country": "DE", "remote": False}},
    [{"type": "language", "status": "ineligible"}])

add("language", "eligible", "No required languages configured; auto-pass.",
    [rule("language", {})],
    {"languages": []}, LOC_JOB,
    [{"type": "language", "status": "eligible"}])

add("language", "eligible", "User proficiency missing defaults to basic; requirement basic passes.",
    [rule("language", {"requiredLanguages": [{"language": "Italian", "proficiency": "basic"}]})],
    {"languages": [{"language": "italian"}]},
    {"location": {"country": "IT", "remote": False}},
    [{"type": "language", "status": "eligible"}])

# ---------------------------------------------------------------------------
# clearance (10)
# ---------------------------------------------------------------------------
add("clearance", "eligible", "Secret clearance meets secret requirement.",
    [rule("clearance", {"requiredClearance": "secret"})],
    {"securityClearance": "secret"}, LOC_JOB,
    [{"type": "clearance", "status": "eligible"}])

add("clearance", "eligible", "TS/SCI exceeds secret requirement.",
    [rule("clearance", {"requiredClearance": "secret"})],
    {"securityClearance": "ts_sci"}, LOC_JOB,
    [{"type": "clearance", "status": "eligible"}])

add("clearance", "ineligible", "Confidential below secret requirement.",
    [rule("clearance", {"requiredClearance": "secret"})],
    {"securityClearance": "confidential"}, LOC_JOB,
    [{"type": "clearance", "status": "ineligible", "reason_contains": "clearance"}])

add("clearance", "ineligible", "No clearance declared (defaults none) vs top_secret requirement.",
    [rule("clearance", {"requiredClearance": "top_secret"})],
    {}, LOC_JOB,
    [{"type": "clearance", "status": "ineligible"}])

add("clearance", "eligible", "Requirement 'none' always satisfied.",
    [rule("clearance", {"requiredClearance": "none"})],
    {"securityClearance": "none"}, LOC_JOB,
    [{"type": "clearance", "status": "eligible"}])

add("clearance", "eligible", "Higher holder passes lower tier confidential.",
    [rule("clearance", {"requiredClearance": "confidential"})],
    {"securityClearance": "top_secret"},
    {"location": {"country": "US", "remote": False}},
    [{"type": "clearance", "status": "eligible"}])

add("clearance", "ineligible", "Downward tier mismatch: secret vs ts_sci.",
    [rule("clearance", {"requiredClearance": "ts_sci"})],
    {"securityClearance": "secret"},
    {"location": {"country": "US", "remote": False}},
    [{"type": "clearance", "status": "ineligible"}])

add("clearance", "eligible", "No clearance condition configured; auto-pass.",
    [rule("clearance", {})],
    {}, LOC_JOB,
    [{"type": "clearance", "status": "eligible"}])

add("clearance", "eligible", "Case-insensitive clearance values ('SECRET' == 'secret').",
    [rule("clearance", {"requiredClearance": "SECRET"})],
    {"securityClearance": "Secret"}, LOC_JOB,
    [{"type": "clearance", "status": "eligible"}])

add("clearance", "ineligible", "Unknown clearance string maps below requirement level.",
    [rule("clearance", {"requiredClearance": "confidential"})],
    {"securityClearance": "interim-pending"}, LOC_JOB,
    [{"type": "clearance", "status": "ineligible"}])

# ---------------------------------------------------------------------------
# multi_rule (composite scenarios, 10)
# ---------------------------------------------------------------------------
FULL_US_PROFILE = {
    "location": {"country": "US"},
    "workAuthorization": {"authorizations": ["US Citizen"]},
    "needsSponsorship": False,
    "education": [{"degree": "bachelor", "field": "Computer Science"}],
    "experience": [{"startDate": iso_days_ago(365 * 6)}],
    "skills": [{"name": "python"}, {"name": "react"}],
}

add("multi_rule", "eligible", "All six hard requirements met for onsite US senior role.",
    [
        rule("location", {"countries": ["US"]}),
        rule("work_authorization", {"requiredAuthorizations": ["US Citizen", "Green Card"]}),
        rule("sponsorship", {}),
        rule("education", {"minimumDegree": "bachelor"}),
        rule("experience", {"minimumYears": 5}),
        rule("skill", {"requiredSkills": ["Python", "React"]}),
    ],
    FULL_US_PROFILE, LOC_JOB,
    [{"status": "eligible"}] * 6)

add("multi_rule", "ineligible", "Skill gap fails one required rule among five.",
    [
        rule("location", {"countries": ["US"]}),
        rule("work_authorization", {"requiredAuthorizations": ["US Citizen"]}),
        rule("education", {"minimumDegree": "bachelor"}),
        rule("experience", {"minimumYears": 5}),
        rule("skill", {"requiredSkills": ["Kubernetes"]}),
    ],
    FULL_US_PROFILE, LOC_JOB,
    [{"status": "eligible"}, {"status": "eligible"}, {"status": "eligible"},
     {"status": "eligible"}, {"status": "ineligible"}])

add("multi_rule", "unknown", "Missing work-authorization data makes one required rule unverifiable.",
    [
        rule("location", {"countries": ["US"]}),
        rule("work_authorization", {"requiredAuthorizations": ["US Citizen"]}),
        rule("skill", {"requiredSkills": ["Python"]}),
    ],
    {"location": {"country": "US"}, "skills": [{"name": "python"}]},
    LOC_JOB,
    [{"status": "eligible"}, {"status": "unknown"}, {"status": "eligible"}])

add("multi_rule", "eligible", "Unknown non-required rule does not gate outcome.",
    [
        rule("location", {"countries": ["US"]}),
        rule("work_authorization", {"requiredAuthorizations": ["US Citizen"]}, required=False),
    ],
    {"location": {"country": "US"}},
    LOC_JOB,
    [{"status": "eligible"}, {"status": "unknown"}])

add("multi_rule", "ineligible", "Two independent blockers (country + sponsorship).",
    [
        rule("location", {"countries": ["US"]}),
        rule("sponsorship", {}),
    ],
    {"location": {"country": "IN"}, "needsSponsorship": True},
    {"location": {"country": "US", "remote": False}, "visaSponsorship": False},
    [{"status": "ineligible"}, {"status": "ineligible"}])

add("multi_rule", "eligible", "Remote-friendly composite: abroad user, remote job, skills+education OK.",
    [
        rule("location", {"countries": ["US"]}),
        rule("education", {"minimumDegree": "bachelor"}),
        rule("skill", {"requiredSkills": ["Go"]}),
        rule("language", {"requiredLanguages": [{"language": "English", "proficiency": "professional"}]}),
    ],
    {
        "location": {"country": "CA"},
        "education": [{"degree": "master", "field": "Engineering"}],
        "skills": [{"name": "go"}],
        "languages": [{"language": "english", "proficiency": "fluent"}],
    },
    {"location": {"country": "US", "remote": True}},
    [{"status": "eligible"}, {"status": "eligible"}, {"status": "eligible"}, {"status": "eligible"}])

add("multi_rule", "ineligible", "Government role: clearance + citizenship both fail.",
    [
        rule("clearance", {"requiredClearance": "top_secret"}),
        rule("work_authorization", {"requiredAuthorizations": ["US Citizen"]}),
        rule("education", {"minimumDegree": "bachelor"}),
    ],
    {"securityClearance": "secret", "workAuthorization": {"authorizations": ["Green Card"]},
     "education": [{"degree": "bachelor", "field": "Physics"}]},
    {"location": {"country": "US", "remote": False}},
    [{"status": "ineligible"}, {"status": "ineligible"}, {"status": "eligible"}])

add("multi_rule", "eligible", "Healthcare licensure bundle fully satisfied.",
    [
        rule("license", {"requiredLicenses": ["RN"]}),
        rule("certification", {"requiredCertifications": ["CISSP"]}),
        rule("experience", {"minimumYears": 2}),
    ],
    {
        "licenses": [{"name": "RN", "valid": True}],
        "certifications": [{"name": "CISSP"}],
        "experience": [{"startDate": iso_days_ago(365 * 3)}],
    },
    {"location": {"country": "US", "remote": False}},
    [{"status": "eligible"}, {"status": "eligible"}, {"status": "eligible"}])

add("multi_rule", "unknown", "Mixed unknown + eligible: unverifiable location gates as unknown.",
    [
        rule("location", {"countries": ["GB"]}),
        rule("skill", {"requiredSkills": ["SQL"]}),
    ],
    {"skills": [{"name": "sql"}]},
    {"location": {"country": "GB", "remote": False}},
    [{"status": "unknown"}, {"status": "eligible"}])

add("multi_rule", "eligible", "Ten-rule stress case: all default-condition rules pass.",
    [rule(t, {}) for t in [
        "location", "work_authorization", "sponsorship", "license", "certification",
        "education", "experience", "skill", "language", "clearance",
    ]],
    FULL_US_PROFILE, LOC_JOB,
    [{"status": "eligible"}] * 10)

# ---------------------------------------------------------------------------
# randomized balanced tail (reach >= 112 total, all dimensions covered)
# ---------------------------------------------------------------------------
while len(CASES) < 112:
    dim = random.choice([
        "location", "work_authorization", "sponsorship", "license", "certification",
        "education", "experience", "skill", "language", "clearance",
    ])
    home = random.choice(COUNTRIES)
    dest = random.choice(COUNTRIES)
    remote = random.random() < 0.3
    job = {"location": {"country": dest, "remote": remote}}
    expect = None

    if dim == "location":
        allowed = random.sample(COUNTRIES, k=random.randint(2, 5))
        rules = [rule("location", {"countries": allowed})]
        profile = {"location": {"country": home}}
        if remote:
            expect = ("eligible", f"Remote job bypasses country allow-list {allowed}.")
        else:
            ok = home in allowed
            expect = ("eligible" if ok else "ineligible",
                      f"User country {'in' if ok else 'not in'} allow-list {allowed}.")
    elif dim == "work_authorization":
        req = random.sample(AUTHS, k=random.randint(1, 3))
        mine = random.sample(AUTHS, k=random.randint(1, 3))
        rules = [rule("work_authorization", {"requiredAuthorizations": req})]
        profile = {"workAuthorization": {"authorizations": mine}}
        ok = bool(set(req) & set(mine))
        expect = ("eligible" if ok else "ineligible",
                  f"{'Intersection' if ok else 'No intersection'} between {req} and {mine}.")
    elif dim == "sponsorship":
        needs = random.random() < 0.5
        offers = random.random() < 0.5
        job["visaSponsorship"] = offers
        rules = [rule("sponsorship", {})]
        profile = {"needsSponsorship": needs}
        ok = (not needs) or offers
        expect = ("eligible" if ok else "ineligible",
                  f"needs={needs}, offers={offers}.")
    elif dim == "license":
        req = random.sample(LICENSES, k=random.randint(1, 2))
        mine = [{"name": l, "valid": random.random() < 0.8}
                for l in random.sample(LICENSES, k=random.randint(1, 3))]
        rules = [rule("license", {"requiredLicenses": req})]
        profile = {"licenses": mine}
        ok = all(any(m["name"] == r and m["valid"] for m in mine) for r in req)
        expect = ("eligible" if ok else "ineligible",
                  f"Required {req}; held {[(m['name'], m['valid']) for m in mine]}.")
    elif dim == "certification":
        req = random.sample(CERTS, k=random.randint(1, 2))
        mine = random.sample(CERTS, k=random.randint(1, 4))
        rules = [rule("certification", {"requiredCertifications": req})]
        profile = {"certifications": [{"name": c} for c in mine]}
        ok = all(r in mine for r in req)
        expect = ("eligible" if ok else "ineligible",
                  f"Required {req}; held {mine}.")
    elif dim == "education":
        mindeg = random.choice(DEGREES[1:])
        deg = random.choice(DEGREES)
        rules = [rule("education", {"minimumDegree": mindeg})]
        profile = {"education": [{"degree": deg, "field": random.choice(FIELDS).title()}]}
        ok = DEGREES.index(deg) >= DEGREES.index(mindeg)
        expect = ("eligible" if ok else "ineligible", f"{deg} vs minimum {mindeg}.")
    elif dim == "experience":
        miny = random.choice([1, 2, 3, 5, 7])
        yrs = round(random.uniform(0.4, 9), 1)
        rules = [rule("experience", {"minimumYears": miny})]
        profile = {"experience": [{"startDate": iso_days_ago(int(yrs * 365) + 10)}]}
        ok = yrs >= miny
        expect = ("eligible" if ok else "ineligible",
                  f"~{yrs}y experience vs {miny}y minimum.")
    elif dim == "skill":
        req = random.sample(SKILLS, k=random.randint(1, 3))
        mine = random.sample(SKILLS, k=random.randint(1, 6))
        rules = [rule("skill", {"requiredSkills": req})]
        profile = {"skills": [{"name": s} for s in mine]}
        ok = all(r in mine for r in req)
        expect = ("eligible" if ok else "ineligible",
                  f"Required {req}; held {mine}.")
    else:  # language
        lang = random.choice(LANGUAGES)
        reqp = random.choice(PROFICIENCIES[1:])
        myp = random.choice(PROFICIENCIES)
        rules = [rule("language", {"requiredLanguages": [{"language": lang, "proficiency": reqp}]})]
        profile = {"languages": [{"language": lang, "proficiency": myp}]}
        ok = PROFICIENCIES.index(myp) >= PROFICIENCIES.index(reqp)
        expect = ("eligible" if ok else "ineligible",
                  f"{lang} {myp} vs required {reqp}.")

    add(dim, expect[0], expect[1], rules, profile, job,
        [{"type": rules[0]["checkType"], "status": expect[0]}])

# ---------------------------------------------------------------------------
# write outputs
# ---------------------------------------------------------------------------
out_dir = Path(__file__).parent
manifest = {
    "name": "eligibility-eval-dataset",
    "version": "1.0.0",
    "taskId": "T-13",
    "targetMetric": "false-positive rate <= 2% (G-04)",
    "engineUnderTest": "packages/api/src/eligibility/eligibility-engine.ts",
    "totalCases": len(CASES),
    "dimensions": sorted({c["dimension"] for c in CASES}),
    "generatedBy": "generate_dataset.py (seed=20261014)",
    "notes": (
        "A false positive = engine reports 'eligible' where expectedStatus is "
        "'ineligible'. Overall-status expectation: any required ineligible => "
        "ineligible; else any required unknown => unknown; else eligible "
        "(matches calculateOverallStatus)."
    ),
}
with open(out_dir / "manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)
    f.write("\n")

with open(out_dir / "cases.json", "w") as f:
    json.dump(CASES, f, indent=2)
    f.write("\n")

counts = {}
for c in CASES:
    counts.setdefault(c["dimension"], 0)
    counts[c["dimension"]] += 1
print(f"total cases: {len(CASES)}")
for d in sorted(counts):
    print(f"  {d}: {counts[d]}")
