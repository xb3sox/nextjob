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
  const [activeTab, setActiveTab] = useState<
    "claims" | "import" | "preferences" | "answers" | "revisions"
  >("claims");

  // Conversational update state
  const [conversationalPrompt, setConversationalPrompt] = useState("");
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);

  // Import state
  const [importFormat, setImportFormat] = useState<
    "text" | "pdf" | "docx" | "json_resume"
  >("text");
  const [importFileName, setImportFileName] = useState("Updated_CV_2026.pdf");
  const [importContent, setImportContent] = useState(SAMPLE_CONFLICT_CV_TEXT);

  // Inline claim editing state
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOrganization, setEditOrganization] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Preferences form state
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

  // Reusable answer form state
  const [newQuestionCategory, setNewQuestionCategory] = useState(
    "System Design & Impact",
  );
  const [newQuestionPattern, setNewQuestionPattern] = useState("");
  const [newVerifiedAnswer, setNewVerifiedAnswer] = useState("");

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
        const result = (await res.json()) as {
          assistantReply: string;
        };
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
            ? `تم استخراج ${result.importedClaims.length} حقائق مقترحة (${result.conflictCount} تعارض في التواريخ يتطلب قرارك).`
            : `Extracted ${result.importedClaims.length} proposed claims (${result.conflictCount} date/fact conflict detected for your confirmation).`,
        );
        setActiveTab("claims");
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
        body: JSON.stringify({
          claimId,
          action,
          updates,
        }),
      });
      if (res.ok) {
        setEditingClaimId(null);
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
            ? "تم حفظ التفضيلات المهنية وإعادة حساب ملاءمة الوظائف."
            : "Career preferences saved! Job fit scores have been recalculated.",
        );
        await refreshCareer();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/career/preferences/reset", {
        method: "POST",
      });
      if (res.ok) {
        const updated = (await res.json()) as CareerWorkspaceData["preferences"];
        setTargetRolesInput(updated.targetRoles.join(", "));
        setLocationsInput(updated.locations.join(", "));
        setMinSalaryInput(String(updated.minSalary ?? ""));
        setExcludedCompaniesInput(updated.excludedCompanies.join(", "));
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

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isArabic ? "مسيرتي المهنية — الملف الموحد" : "My Career"}
            </h1>
            <Badge variant="default">
              {data.profile.completenessScore}%{" "}
              {isArabic ? "مكتمل" : "Complete"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {isArabic
              ? "هويتك المهنية الموثقة: استيراد السيرة الذاتية، كشف التعارضات، التحديثات المحادثية بموافقتك، والتفضيلات."
              : "Your single authoritative career identity. Import resumes, resolve date conflicts, approve conversational updates, and manage preferences."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportJsonResume()}
          >
            <Icons.Download className="size-4" />
            <span>
              {isArabic ? "تصدير JSON Resume" : "Export JSON Resume"}
            </span>
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveTab("import")}
          >
            <Icons.Plus className="size-4" />
            <span>
              {isArabic ? "استيراد سيرة ذاتية / CV" : "Import CV / JSON Resume"}
            </span>
          </Button>
        </div>
      </div>

      {/* Conversational Profile Update Bar (Section 5.3) */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-5">
          <form
            onSubmit={handleConversationalSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-2">
              <Icons.Brain className="text-primary size-5 shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap">
                {isArabic ? "تحديث بالمحادثة:" : "Conversational Update:"}
              </span>
            </div>
            <Input
              value={conversationalPrompt}
              onChange={(e) => setConversationalPrompt(e.target.value)}
              placeholder={
                isArabic
                  ? 'مثال: "تمت ترقيتي إلى مدير تقنية المعلومات في CloudScale"'
                  : 'Example: "I was promoted to Information Manager at CloudScale Technologies"'
              }
              aria-label="Conversational career update"
              className="bg-background flex-1"
            />
            <Button type="submit" size="sm" disabled={isLoading}>
              <Icons.SendHorizontal className="size-3.5" />
              <span>
                {isArabic ? "اقتراح تعديل للمراجعة" : "Propose Structured Change"}
              </span>
            </Button>
          </form>
          {assistantMessage && (
            <div
              role="status"
              className="bg-background mt-3 flex items-center justify-between rounded-md border px-3 py-2 text-xs"
            >
              <span>{assistantMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAssistantMessage(null)}
              >
                <Icons.X className="size-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-3">
        <Button
          size="sm"
          variant={activeTab === "claims" ? "default" : "outline"}
          onClick={() => setActiveTab("claims")}
        >
          <span>
            {isArabic
              ? `السجل المهني والتعارضات (${data.claims.length})`
              : `Profile & Verification (${pendingOrDisputedClaims.length} pending)`}
          </span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "import" ? "default" : "outline"}
          onClick={() => setActiveTab("import")}
        >
          <span>
            {isArabic
              ? "استيراد السيرة الذاتية والأدلة"
              : "Import CV / Evidence"}
          </span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "preferences" ? "default" : "outline"}
          onClick={() => setActiveTab("preferences")}
        >
          <span>
            {isArabic ? "الأهداف والتفضيلات المهنية" : "Career Preferences"}
          </span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "answers" ? "default" : "outline"}
          onClick={() => setActiveTab("answers")}
        >
          <span>
            {isArabic
              ? `الإجابات الجاهزة (${data.reusableAnswers.length})`
              : `Reusable Answers (${data.reusableAnswers.length})`}
          </span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "revisions" ? "default" : "outline"}
          onClick={() => setActiveTab("revisions")}
        >
          <span>
            {isArabic
              ? `سجل المراجعات (${data.revisions.length})`
              : `Revision History (${data.revisions.length})`}
          </span>
        </Button>
      </div>

      {/* TAB 1: Profile Claims & Conflict Resolution */}
      {activeTab === "claims" && (
        <div className="flex flex-col gap-6">
          {pendingOrDisputedClaims.length > 0 && (
            <Card className="border-amber-500/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icons.AlertTriangle className="size-4 text-amber-500" />
                  <span>
                    {isArabic
                      ? "تغييرات مقترحة وتعارضات تتطلب موافقتك الصريحة"
                      : "Proposed Claims & Detected Conflicts Requiring Your Approval"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? "لا يتم استبدال أي حقيقة موثقة بصمت. راجع التواريخ والتفاصيل قبل الاعتماد."
                    : "Imported facts and conversational proposals stay here until you explicitly confirm, edit, or reject them."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {pendingOrDisputedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-muted/20 flex flex-col justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="uppercase">
                          {claim.category}
                        </Badge>
                        <span className="font-semibold">{claim.title}</span>
                        {claim.organization && (
                          <span className="text-muted-foreground text-sm">
                            @ {claim.organization}
                          </span>
                        )}
                        <Badge
                          variant={
                            claim.verificationStatus === "disputed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {claim.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {`${claim.startDate ?? "N/A"} – ${claim.endDate ?? (isArabic ? "الحالي" : "Present")} • ${isArabic ? "الثقة" : "Confidence"}: ${Math.round(claim.confidence * 100)}%`}
                      </p>
                      <p className="text-sm">{claim.description}</p>

                      {claim.conflictDetails && (
                        <div className="border-destructive/40 bg-destructive/10 mt-2 rounded-md border p-3 text-xs">
                          <p className="text-destructive font-semibold">
                            {isArabic
                              ? "تم اكتشاف تعارض مع سجل موثق حالي:"
                              : "Conflict Detected Against Existing Verified Record:"}{" "}
                            {claim.conflictDetails.reason}
                          </p>
                          <ul className="mt-1 space-y-1">
                            {claim.conflictDetails.differences.map(
                              (diff, idx) => (
                                <li key={idx}>
                                  <span className="font-mono font-medium">
                                    {diff.field}
                                  </span>
                                  :{" "}
                                  <span className="line-through opacity-75">
                                    {diff.existingValue}
                                  </span>{" "}
                                  →{" "}
                                  <span className="font-semibold">
                                    {diff.proposedValue}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {claim.conflictDetails ? (
                        <>
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() =>
                              void handleClaimAction(
                                claim.id,
                                "resolve_conflict_accept_proposed",
                              )
                            }
                          >
                            <Icons.Check className="size-3.5" />
                            <span>
                              {isArabic
                                ? "اعتماد التاريخ الجديد وأرشفة القديم"
                                : "Accept New & Archive Existing"}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() =>
                              void handleClaimAction(
                                claim.id,
                                "resolve_conflict_keep_existing",
                              )
                            }
                          >
                            <span>
                              {isArabic
                                ? "الإبقاء على السجل الحالي ورفض المقترح"
                                : "Keep Existing & Reject Proposed"}
                            </span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() =>
                              void handleClaimAction(claim.id, "confirm")
                            }
                          >
                            <Icons.Check className="size-3.5" />
                            <span>
                              {isArabic
                                ? "موافقة وتوثيق"
                                : "Approve & Verify"}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() =>
                              void handleClaimAction(claim.id, "reject")
                            }
                          >
                            <Icons.X className="size-3.5" />
                            <span>{isArabic ? "رفض" : "Reject"}</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Authoritative Verified Claims */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic
                  ? `الحقائق المهنية الموثقة (${verifiedClaims.length})`
                  : `Authoritative Verified Career Claims (${verifiedClaims.length})`}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "هذه الحقائق الموثقة هي المصدر الوحيد المسموح به لتخصيص السيرة الذاتية."
                  : "Only verified claims listed here are eligible for evidence-constrained CV and cover letter generation."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {verifiedClaims.map((claim) => {
                const isEditing = editingClaimId === claim.id;
                return (
                  <div
                    key={claim.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border p-4"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title / Role"
                          />
                          <Input
                            value={editOrganization}
                            onChange={(e) =>
                              setEditOrganization(e.target.value)
                            }
                            placeholder="Organization / Institution"
                          />
                        </div>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() =>
                              void handleClaimAction(claim.id, "edit", {
                                title: editTitle,
                                organization: editOrganization || null,
                                description: editDescription,
                              })
                            }
                          >
                            {isArabic ? "حفظ التعديلات" : "Save Verified Fact"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingClaimId(null)}
                          >
                            {isArabic ? "إلغاء" : "Cancel"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="uppercase">
                              {claim.category}
                            </Badge>
                            <span className="font-semibold">{claim.title}</span>
                            {claim.organization && (
                              <span className="text-muted-foreground text-sm">
                                • {claim.organization}
                              </span>
                            )}
                            <Badge variant="default" className="text-xs">
                              <Icons.BadgeCheck className="mr-1 size-3" />
                              {isArabic ? "موثق" : "Verified"}
                            </Badge>
                          </div>
                          {(claim.startDate || claim.location) && (
                            <p className="text-muted-foreground text-xs">
                              {claim.startDate
                                ? `${claim.startDate} – ${claim.isCurrent ? "Present" : (claim.endDate ?? "")}`
                                : ""}{" "}
                              {claim.location ? `• ${claim.location}` : ""}
                            </p>
                          )}
                          <p className="text-sm">{claim.description}</p>
                          {claim.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {claim.skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingClaimId(claim.id);
                              setEditTitle(claim.title);
                              setEditOrganization(claim.organization ?? "");
                              setEditDescription(claim.description);
                            }}
                          >
                            {isArabic ? "تعديل" : "Edit"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              void handleClaimAction(claim.id, "archive")
                            }
                          >
                            {isArabic ? "أرشفة" : "Archive"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Import CV / JSON Resume & Evidence */}
      {activeTab === "import" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic
                  ? "استيراد السيرة الذاتية أو JSON Resume"
                  : "Import CV, Resume, or JSON Resume"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "يتم استخراج الخبرات والتواريخ كعناصر مقترحة مع اكتشاف أي تعارض مع سجلاتك الحالية."
                  : "Extracts structured career claims with provenance hashes and automatic date conflict detection."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {isArabic ? "صيغة المستند" : "Document Format"}
                  </label>
                  <select
                    value={importFormat}
                    onChange={(e) =>
                      setImportFormat(
                        e.target.value as
                          | "text"
                          | "pdf"
                          | "docx"
                          | "json_resume",
                      )
                    }
                    className="bg-background border-input h-9 w-full rounded-md border px-3 text-xs"
                  >
                    <option value="text">
                      {isArabic
                        ? "نص السيرة الذاتية"
                        : "Resume Text / Extracted CV"}
                    </option>
                    <option value="pdf">
                      {isArabic ? "محتوى PDF" : "PDF Resume Content"}
                    </option>
                    <option value="docx">
                      {isArabic ? "محتوى DOCX" : "DOCX Resume Content"}
                    </option>
                    <option value="json_resume">
                      {isArabic ? "JSON Resume" : "JSON Resume Schema"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">
                    {isArabic ? "اسم الملف المرجعي" : "Source Filename"}
                  </label>
                  <Input
                    value={importFileName}
                    onChange={(e) => setImportFileName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium">
                  {isArabic
                    ? "محتوى السيرة الذاتية (يتضمن مثال لتعارض تواريخ العمل)"
                    : "Resume Content (Pre-loaded with a date conflict test case against CloudScale Technologies)"}
                </label>
                <Textarea
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  rows={7}
                  className="font-mono text-xs"
                />
              </div>

              <Button
                onClick={() => void handleImportSubmit()}
                disabled={isLoading}
              >
                <Icons.ArrowUp className="size-4" />
                <span>
                  {isArabic
                    ? "تحليل واستخراج الحقائق المقترحة"
                    : "Extract Proposed Claims & Check Conflicts"}
                </span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic
                  ? `سجل الأدلة والمستندات المستوردة (${data.evidence.length})`
                  : `Imported Evidence Provenance (${data.evidence.length})`}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "يرتبط كل ادعاء مهني ببصمة SHA-256 للمستند المصدر."
                  : "Every career claim is linked to an immutable SHA-256 evidence record."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="space-y-1 rounded-lg border p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{ev.title}</span>
                    <Badge variant="outline">{ev.type}</Badge>
                  </div>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {`SHA-256: ${ev.contentHash.slice(0, 24)}…`}
                  </p>
                  <p className="text-muted-foreground">
                    {`${isArabic ? "الحقائق المستخرجة" : "Extracted Facts"}: ${ev.extractedFactCount} • ${isArabic ? "التعارضات" : "Conflicts"}: ${ev.conflictCount}`}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Career Preferences */}
      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic
                ? "الأهداف المهنية وتفضيلات البحث والأتمتة"
                : "Career Goals, Matching & Automation Preferences"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "تؤثر هذه التفضيلات مباشرة على ترتيب الوظائف وتقييم الأهلية."
                : "Directly drives job recommendations, salary alignment, and mandatory human approval gates."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {isArabic
                    ? "الأدوار الوظيفية المستهدفة (مفصولة بفواصل)"
                    : "Target Roles (comma-separated)"}
                </label>
                <Input
                  value={targetRolesInput}
                  onChange={(e) => setTargetRolesInput(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {isArabic
                    ? "المواقع المفضلة (مفصولة بفواصل)"
                    : "Preferred Locations (comma-separated)"}
                </label>
                <Input
                  value={locationsInput}
                  onChange={(e) => setLocationsInput(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {isArabic
                    ? "الحد الأدنى للراتب السنوي (USD)"
                    : "Minimum Annual Salary (USD)"}
                </label>
                <Input
                  type="number"
                  value={minSalaryInput}
                  onChange={(e) => setMinSalaryInput(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  {isArabic
                    ? "الشركات المستبعدة (مفصولة بفواصل)"
                    : "Excluded Companies (comma-separated)"}
                </label>
                <Input
                  value={excludedCompaniesInput}
                  onChange={(e) => setExcludedCompaniesInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => void handleSavePreferences()}
                disabled={isLoading}
              >
                <Icons.Check className="size-4" />
                <span>
                  {isArabic ? "حفظ التفضيلات" : "Save Career Preferences"}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleResetPreferences()}
                disabled={isLoading}
              >
                <span>
                  {isArabic ? "إعادة تعيين للافتراضي" : "Reset to Defaults"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Reusable Application Answers */}
      {activeTab === "answers" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic
                  ? "الإجابات الموثقة القابلة لإعادة الاستخدام"
                  : "Verified Reusable Application Answers"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "احفظ إجاباتك الموثقة لأسئلة التوظيف المتكررة لتجنب إعادة الكتابة."
                  : "Eliminate repetitive form typing by maintaining verified answers for recurring screening questions."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.reusableAnswers.map((ans) => (
                <div
                  key={ans.id}
                  className="space-y-1.5 rounded-lg border p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{ans.questionCategory}</Badge>
                    <Badge variant="outline">
                      {ans.isApprovedForReuse
                        ? isArabic
                          ? "معتمد لإعادة الاستخدام"
                          : "Approved for Reuse"
                        : "Draft"}
                    </Badge>
                  </div>
                  <p className="font-semibold">{ans.questionPattern}</p>
                  <p className="text-muted-foreground">{ans.verifiedAnswer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "إضافة إجابة موثقة جديدة" : "Add Reusable Answer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReusableAnswer} className="space-y-3">
                <div>
                  <label
                    htmlFor="reusable-answer-category"
                    className="mb-1 block text-xs font-medium"
                  >
                    {isArabic ? "الفئة" : "Category"}
                  </label>
                  <Input
                    id="reusable-answer-category"
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="reusable-answer-question"
                    className="mb-1 block text-xs font-medium"
                  >
                    {isArabic ? "سؤال الفرز" : "Screening Question"}
                  </label>
                  <Input
                    id="reusable-answer-question"
                    value={newQuestionPattern}
                    onChange={(e) => setNewQuestionPattern(e.target.value)}
                    placeholder="e.g. What is your notice period?"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reusable-answer-body"
                    className="mb-1 block text-xs font-medium"
                  >
                    {isArabic ? "الإجابة الموثقة" : "Verified Answer"}
                  </label>
                  <Textarea
                    id="reusable-answer-body"
                    value={newVerifiedAnswer}
                    onChange={(e) => setNewVerifiedAnswer(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isArabic ? "حفظ الإجابة" : "Save Verified Answer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: Immutable Revision History */}
      {activeTab === "revisions" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic
                ? "سجل المراجعات والتغييرات التاريخية"
                : "Immutable Profile Revision History"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "كل عملية استيراد أو تعديل أو حل تعارض مسجلة مع الفاعل والسبب."
                : "Complete audit log of every import, conflict resolution, and user verification."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.revisions.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between gap-2 rounded-lg border p-3 text-xs sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rev.action}</Badge>
                    <span className="font-mono text-[11px]">
                      {`${isArabic ? "الفاعل" : "Actor"}: ${rev.actor}`}
                    </span>
                  </div>
                  <p className="font-medium">{rev.reason}</p>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {new Date(rev.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
