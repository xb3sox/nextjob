/* oxlint-disable i18next/no-literal-string */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui-web/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui-web/dialog";
import { Icons } from "@workspace/ui-web/icons";
import { Input } from "@workspace/ui-web/input";
import { Textarea } from "@workspace/ui-web/textarea";

import type { careerWorkspaceResponseSchema } from "@workspace/api/schema";
import type * as z from "zod";

type CareerWorkspaceData = z.infer<typeof careerWorkspaceResponseSchema>;

interface MyCareerWorkspaceProps {
  readonly initialData: CareerWorkspaceData;
  readonly locale: string;
}

const SAMPLE_CONFLICT_CV_TEXT = `Senior Software Engineer at CloudScale Technologies (2021-01 to Present) - Led distributed TypeScript and Next.js platform engineering.
B.Sc. in Computer Science at Cairo University (2015 to 2019)
Skills: TypeScript, React, Next.js, Hono, Drizzle, PostgreSQL, Kubernetes`;

const handleExportJsonResume = async () => {
  const res = await fetch("/api/nextjob/career/export/json-resume");
  if (res.ok) {
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nextjob-verified-json-resume.json";
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const MyCareerWorkspace = ({
  initialData,
  locale,
}: MyCareerWorkspaceProps) => {
  const router = useRouter();
  const [data, setData] = useState<CareerWorkspaceData>(initialData);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    "all" | "experience" | "education" | "skill" | "project" | "achievement"
  >("all");

  // Conversational update state
  const [conversationalPrompt, setConversationalPrompt] = useState("");
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);

  // Import Dialog State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<
    "text" | "pdf" | "docx" | "json_resume"
  >("text");
  const [importFileName] = useState("Updated_CV_2026.pdf");
  const [importContent, setImportContent] = useState(SAMPLE_CONFLICT_CV_TEXT);

  // Preferences Modal State
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [targetRolesInput, setTargetRolesInput] = useState(
    initialData.preferences.targetRoles.join(", "),
  );
  const [locationsInput, setLocationsInput] = useState(
    initialData.preferences.locations.join(", "),
  );
  const [minSalaryInput, setMinSalaryInput] = useState(
    String(initialData.preferences.minSalary ?? 140000),
  );
  const [excludedCompaniesInput, setExcludedCompaniesInput] = useState(
    initialData.preferences.excludedCompanies.join(", "),
  );

  // Reusable Answers Modal State
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [newQuestionCategory, setNewQuestionCategory] = useState(
    "Work Authorization & Policy",
  );
  const [newQuestionPattern, setNewQuestionPattern] = useState("");
  const [newVerifiedAnswer, setNewVerifiedAnswer] = useState("");

  // Claim Editing State
  const [editingClaim, setEditingClaim] = useState<
    CareerWorkspaceData["claims"][number] | null
  >(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOrganization, setEditOrganization] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const isArabic = locale === "ar";

  const refreshCareer = async () => {
    const res = await fetch("/api/nextjob/career", { cache: "no-store" });
    if (res.ok) {
      const updated = (await res.json()) as CareerWorkspaceData;
      setData(updated);
    }
    router.refresh();
  };

  const handleConversationalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationalPrompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/career/conversational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: conversationalPrompt }),
      });
      if (res.ok) {
        const result = (await res.json()) as { assistantReply: string };
        setAssistantMessage(result.assistantReply);
        setConversationalPrompt("");
        await refreshCareer();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importContent.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/career/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: importFormat,
          fileName: importFileName,
          content: importContent,
        }),
      });
      if (res.ok) {
        const result = (await res.json()) as {
          conflictCount: number;
          importedClaims: unknown[];
        };
        setAssistantMessage(
          isArabic
            ? `تم تحليل الوثيقة بنجاح: تم استخراج ${result.importedClaims.length} حقيقة مهنية.`
            : `Document parsed: ${result.importedClaims.length} proposed career facts extracted.`,
        );
        setIsImportModalOpen(false);
        await refreshCareer();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimAction = async (
    claimId: string,
    action:
      | "confirm"
      | "edit"
      | "reject"
      | "mark_unverified"
      | "archive"
      | "resolve_conflict_keep_existing"
      | "resolve_conflict_accept_proposed",
    updates?: {
      title?: string;
      organization?: string | null;
      description?: string;
    },
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/career/claims/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action, updates }),
      });
      if (res.ok) {
        setEditingClaim(null);
        await refreshCareer();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...data.preferences,
        targetRoles: targetRolesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        locations: locationsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        minSalary: Number(minSalaryInput) || null,
        excludedCompanies: excludedCompaniesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/nextjob/career/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setAssistantMessage(
          isArabic
            ? "تم حفظ التفضيلات المهنية بنجاح."
            : "Target preferences updated successfully.",
        );
        setIsPreferencesModalOpen(false);
        await refreshCareer();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReusableAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionPattern.trim() || !newVerifiedAnswer.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/career/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCategory: newQuestionCategory,
          questionPattern: newQuestionPattern,
          verifiedAnswer: newVerifiedAnswer,
          isApprovedForReuse: true,
        }),
      });
      if (res.ok) {
        setNewQuestionPattern("");
        setNewVerifiedAnswer("");
        await refreshCareer();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pendingOrDisputedClaims = data.claims.filter(
    (c) =>
      c.verificationStatus === "pending_review" ||
      c.verificationStatus === "disputed" ||
      c.verificationStatus === "unverified",
  );

  const verifiedClaims = data.claims.filter(
    (c) => c.verificationStatus === "verified",
  );

  const filteredVerifiedClaims = verifiedClaims.filter((claim) => {
    if (activeCategoryFilter === "all") return true;
    return claim.category === activeCategoryFilter;
  });

  return (
    <div className="text-foreground mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 font-sans sm:px-6">
      {/* 1. Airbnb/Uber-Style Hero Profile Header */}
      <div className="border-border/60 from-muted/30 to-background rounded-2xl border bg-gradient-to-b p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity & Headline */}
          <div className="flex items-start gap-4">
            <div className="bg-foreground text-background flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm">
              {data.profile.headline?.charAt(0) || "C"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                  {data.profile.headline || "Senior Software Engineer"}
                </h1>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-emerald-500/20 bg-emerald-500/5 font-mono text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Verified Ledger
                </Badge>
              </div>

              <p className="text-muted-foreground line-clamp-2 max-w-2xl text-sm leading-relaxed">
                {data.profile.summary ||
                  "Verified career profile grounded in verifiable evidence, zero fabrication tolerance, and cryptographic submission proofs."}
              </p>

              <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Icons.Globe2 className="h-3.5 w-3.5" />
                  {data.profile.location || "Remote Worldwide"}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Icons.ClockFading className="h-3.5 w-3.5" />
                  {data.profile.yearsOfExperience || 6}+ Years Experience
                </span>
                <span>•</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {verifiedClaims.length} Verified Facts
                </span>
              </div>
            </div>
          </div>

          {/* Strength Gauge & Quick Action Group */}
          <div className="flex shrink-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:self-center">
            {/* Strength Card */}
            <div className="border-border/60 bg-background/80 flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-2xs">
              <div className="bg-muted/40 text-foreground relative flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs font-bold">
                {data.profile.completenessScore}%
              </div>
              <div className="space-y-0.5">
                <span className="text-foreground block text-xs font-semibold">
                  Profile Strength
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {data.profile.completenessScore >= 80
                    ? "ATS Ready"
                    : "Add More Facts"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-medium shadow-2xs"
                onClick={() => void handleExportJsonResume()}
              >
                <Icons.Download className="h-3.5 w-3.5" />
                <span>Export Resume</span>
              </Button>
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs font-medium shadow-2xs"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Icons.Plus className="h-3.5 w-3.5" />
                <span>Import CV</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notification / Assistant Alert */}
      {assistantMessage && (
        <div className="text-foreground flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Icons.CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-medium">{assistantMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAssistantMessage(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Action Required Banner (Airbnb Host Action Style) */}
      {pendingOrDisputedClaims.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Icons.AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-foreground text-sm font-semibold">
                  Action Required: {pendingOrDisputedClaims.length} Pending
                  Review
                </h3>
                <p className="text-muted-foreground text-xs">
                  Candidate protection policy: No verified fact is ever
                  overwritten without your explicit consent.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/30 font-mono text-xs text-amber-600 dark:text-amber-400"
            >
              {pendingOrDisputedClaims.length} items
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
            {pendingOrDisputedClaims.map((claim) => (
              <div
                key={claim.id}
                className="border-border/60 bg-background flex flex-col justify-between space-y-3 rounded-xl border p-4 shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase"
                    >
                      {claim.category}
                    </Badge>
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      {claim.verificationStatus === "disputed"
                        ? "Conflict Detected"
                        : "Pending Review"}
                    </span>
                  </div>
                  <h4 className="text-foreground text-sm font-semibold">
                    {claim.title}
                  </h4>
                  {claim.organization && (
                    <p className="text-muted-foreground text-xs font-medium">
                      @ {claim.organization}
                    </p>
                  )}
                  <p className="text-foreground/80 text-xs leading-relaxed">
                    {claim.description}
                  </p>
                </div>

                <div className="border-border/40 flex items-center gap-2 border-t pt-2">
                  <Button
                    size="sm"
                    className="h-8 flex-1 gap-1 text-xs"
                    onClick={() => handleClaimAction(claim.id, "confirm")}
                  >
                    <Icons.Check className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setEditingClaim(claim);
                      setEditTitle(claim.title);
                      setEditOrganization(claim.organization || "");
                      setEditDescription(claim.description);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 h-8 px-2.5 text-xs"
                    onClick={() => handleClaimAction(claim.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Two-Column Master Layout (Uber / Airbnb Core App Architecture) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Main Feed: Career Facts & Timeline (8 of 12 cols) */}
        <div className="flex flex-col gap-5 lg:col-span-8">
          {/* Category Pill Filters (Airbnb Category Bar Style) */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", label: `All Facts (${verifiedClaims.length})` },
              { id: "experience", label: "Experience" },
              { id: "education", label: "Education" },
              { id: "skill", label: "Skills" },
              { id: "project", label: "Projects" },
              { id: "achievement", label: "Achievements" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveCategoryFilter(tab.id as typeof activeCategoryFilter)
                }
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategoryFilter === tab.id
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/40 border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Verified Claims List */}
          <div className="flex flex-col gap-3">
            {filteredVerifiedClaims.length === 0 ? (
              <div className="border-border/70 bg-muted/10 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                <Icons.UserRound className="text-muted-foreground/60 mb-2 h-8 w-8" />
                <h3 className="text-foreground text-sm font-semibold">
                  No claims found in this category
                </h3>
                <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                  Import an updated CV or ask the Career Copilot to propose new
                  achievements.
                </p>
                <Button
                  size="sm"
                  className="mt-4 text-xs"
                  onClick={() => setIsImportModalOpen(true)}
                >
                  Import CV Document
                </Button>
              </div>
            ) : (
              filteredVerifiedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="group border-border/60 bg-card hover:border-foreground/20 relative flex flex-col justify-between space-y-3 rounded-2xl border p-5 transition-all hover:shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <Badge
                          variant="outline"
                          className="bg-muted/30 font-mono text-[10px] uppercase"
                        >
                          {claim.category}
                        </Badge>
                        <h3 className="text-foreground text-sm font-bold">
                          {claim.title}
                        </h3>
                      </div>
                      {(claim.startDate || claim.endDate) && (
                        <span className="text-muted-foreground font-mono text-xs">
                          {claim.startDate ?? "—"} to{" "}
                          {claim.endDate ?? "Present"}
                        </span>
                      )}
                    </div>

                    {claim.organization && (
                      <p className="text-muted-foreground pl-4 text-xs font-semibold">
                        @ {claim.organization}
                        {claim.location && ` • ${claim.location}`}
                      </p>
                    )}

                    <p className="text-foreground/90 pl-4 text-xs leading-relaxed whitespace-pre-wrap">
                      {claim.description}
                    </p>

                    {claim.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 pl-4">
                        {claim.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-muted/50 border-border/40 text-foreground/80 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-2 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      <Icons.BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                      100% Cryptographic Ground Truth
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                        onClick={() => {
                          setEditingClaim(claim);
                          setEditTitle(claim.title);
                          setEditOrganization(claim.organization || "");
                          setEditDescription(claim.description);
                        }}
                      >
                        <Icons.Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                        onClick={() => handleClaimAction(claim.id, "archive")}
                      >
                        Archive
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Intelligence Rail: Preferences, ATS Readiness, & Copilot (4 of 12 cols) */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          {/* Quick Conversational Prompt Box */}
          <Card className="border-border/60 bg-muted/15 rounded-2xl shadow-none">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-foreground text-background flex h-6 w-6 items-center justify-center rounded-md">
                  <Icons.Brain className="h-3.5 w-3.5" />
                </div>
                <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Update via Copilot
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 p-4 pt-1">
              <form onSubmit={handleConversationalSubmit} className="space-y-2">
                <Textarea
                  value={conversationalPrompt}
                  onChange={(e) => setConversationalPrompt(e.target.value)}
                  placeholder='e.g., "Led team of 8 engineers delivering GraphQL migration cut latency 40%"'
                  rows={3}
                  className="bg-background text-xs"
                  aria-label="Career Copilot update prompt"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!conversationalPrompt.trim() || isLoading}
                  className="h-8 w-full text-xs"
                >
                  <Icons.Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Propose Fact
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Target Preferences Summary Card */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <div>
                <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Target Preferences
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Job Match Boundaries
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsPreferencesModalOpen(true)}
              >
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-1 text-xs">
              <div>
                <span className="text-muted-foreground mb-1 block text-[11px]">
                  Target Roles
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.preferences.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="bg-muted text-foreground rounded px-2 py-0.5 text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-border/40 grid grid-cols-2 gap-2 border-t pt-2 font-mono">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Min Salary
                  </span>
                  <span className="text-foreground text-sm font-bold">
                    ${(data.preferences.minSalary || 140000).toLocaleString()}
                    /yr
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Work Mode
                  </span>
                  <span className="text-foreground text-sm font-bold capitalize">
                    {data.preferences.workModes[0] || "Remote"}
                  </span>
                </div>
              </div>

              {data.preferences.excludedCompanies.length > 0 && (
                <div className="border-border/40 border-t pt-2">
                  <span className="text-muted-foreground mb-1 block text-[11px]">
                    Excluded Companies
                  </span>
                  <p className="text-foreground/80 text-xs">
                    {data.preferences.excludedCompanies.join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reusable Answers & ATS Readiness */}
          <Card className="border-border/60 bg-card rounded-2xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <div>
                <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  ATS Reusable Q&A
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  1-Click Autofill Knowledge
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsAnswersModalOpen(true)}
              >
                Manage ({data.reusableAnswers.length})
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-1">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Icons.CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  {data.reusableAnswers.length} verified answers ready for
                  Greenhouse, Lever & Ashby.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-8 w-full text-xs"
                onClick={() => setIsAnswersModalOpen(true)}
              >
                Add Reusable Answer
              </Button>
            </CardContent>
          </Card>

          {/* Cryptographic Trust & GDPR Data Portability */}
          <div className="border-border/50 bg-muted/10 space-y-2 rounded-2xl border p-4 text-xs">
            <div className="text-muted-foreground flex items-center justify-between">
              <span className="text-foreground flex items-center gap-1.5 font-semibold">
                <Icons.Key className="h-3.5 w-3.5" />
                Data Portability
              </span>
              <span className="font-mono text-[10px]">GDPR Art. 20</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              You own your career graph. Export full cryptographic JSON package
              anytime.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs"
              onClick={() =>
                window.open("/api/nextjob/privacy/export", "_blank")
              }
            >
              <Icons.Download className="mr-1.5 h-3 w-3" />
              Download My Data Bundle
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Import CV Dialog */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Import Career Document
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload your CV or paste text. NextJob detects candidate facts and
              alerts on any date/title conflicts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center gap-1.5">
              {(["text", "pdf", "docx", "json_resume"] as const).map((fmt) => (
                <Button
                  key={fmt}
                  size="sm"
                  variant={importFormat === fmt ? "default" : "outline"}
                  className="h-7 text-xs capitalize"
                  onClick={() => setImportFormat(fmt)}
                >
                  {fmt.replace("_", " ")}
                </Button>
              ))}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="import-content"
                className="text-foreground text-xs font-medium"
              >
                Document Contents:
              </label>
              <Textarea
                id="import-content"
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                rows={6}
                className="bg-muted/20 font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportSubmit}
              disabled={isLoading || !importContent.trim()}
              className="h-8 gap-1.5 text-xs"
            >
              <Icons.Sparkles className="h-3.5 w-3.5" />
              Analyze & Extract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Target Preferences Dialog */}
      <Dialog
        open={isPreferencesModalOpen}
        onOpenChange={setIsPreferencesModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Target Job Preferences
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure parameters used to filter and score job matches.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="roles-input"
                className="text-foreground font-medium"
              >
                Target Roles (comma-separated):
              </label>
              <Input
                id="roles-input"
                value={targetRolesInput}
                onChange={(e) => setTargetRolesInput(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  htmlFor="loc-input"
                  className="text-foreground font-medium"
                >
                  Locations:
                </label>
                <Input
                  id="loc-input"
                  value={locationsInput}
                  onChange={(e) => setLocationsInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="salary-input"
                  className="text-foreground font-medium"
                >
                  Minimum Salary (USD):
                </label>
                <Input
                  id="salary-input"
                  type="number"
                  value={minSalaryInput}
                  onChange={(e) => setMinSalaryInput(e.target.value)}
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="excl-input"
                className="text-foreground font-medium"
              >
                Excluded Companies (Will Never Apply):
              </label>
              <Input
                id="excl-input"
                value={excludedCompaniesInput}
                onChange={(e) => setExcludedCompaniesInput(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreferencesModalOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Reusable Answers Manager */}
      <Dialog open={isAnswersModalOpen} onOpenChange={setIsAnswersModalOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Reusable ATS Answers
            </DialogTitle>
            <DialogDescription className="text-xs">
              NextJob uses these verified answers to autofill repetitive
              screening questions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddReusableAnswer} className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                value={newQuestionCategory}
                onChange={(e) => setNewQuestionCategory(e.target.value)}
                placeholder="Category (e.g. Work Authorization)"
                aria-label="Question Category"
                className="h-8 text-xs"
              />
              <Input
                value={newQuestionPattern}
                onChange={(e) => setNewQuestionPattern(e.target.value)}
                placeholder="Question Regex / Pattern"
                aria-label="Question Pattern"
                className="h-8 text-xs"
              />
            </div>
            <Textarea
              value={newVerifiedAnswer}
              onChange={(e) => setNewVerifiedAnswer(e.target.value)}
              placeholder="Verified truthful answer..."
              aria-label="Verified Answer"
              rows={2}
              className="text-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                !newQuestionPattern.trim() ||
                !newVerifiedAnswer.trim() ||
                isLoading
              }
              className="h-8 w-full text-xs"
            >
              Add Reusable Answer
            </Button>
          </form>

          <div className="divide-border/40 border-border/50 bg-muted/10 mt-3 divide-y rounded-xl border">
            {data.reusableAnswers.map((ans) => (
              <div key={ans.id} className="space-y-1 p-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase"
                  >
                    {ans.questionCategory}
                  </Badge>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {ans.questionPattern}
                  </span>
                </div>
                <p className="text-foreground/90 pt-0.5 text-xs font-medium">
                  {ans.verifiedAnswer}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnswersModalOpen(false)}
              className="h-8 w-full text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Edit Claim Dialog */}
      <Dialog
        open={Boolean(editingClaim)}
        onOpenChange={(open) => !open && setEditingClaim(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Career Fact
            </DialogTitle>
            <DialogDescription className="text-xs">
              Direct updates are verified and recorded with an audit proof.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="edit-role-title"
                className="text-foreground font-medium"
              >
                Title / Role:
              </label>
              <Input
                id="edit-role-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="edit-org-name"
                className="text-foreground font-medium"
              >
                Organization / Employer:
              </label>
              <Input
                id="edit-org-name"
                value={editOrganization}
                onChange={(e) => setEditOrganization(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="edit-claim-desc"
                className="text-foreground font-medium"
              >
                Verified Description & Impact:
              </label>
              <Textarea
                id="edit-claim-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingClaim(null)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (editingClaim) {
                  void handleClaimAction(editingClaim.id, "edit", {
                    title: editTitle,
                    organization: editOrganization || null,
                    description: editDescription,
                  });
                }
              }}
              disabled={isLoading}
              className="h-8 text-xs"
            >
              Save Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
