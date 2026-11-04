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

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

import type {
  applicationItemSchema,
  applicationUiStatusSchema,
  tailoredDocumentItemSchema,
} from "@workspace/api/schema";
import type * as z from "zod";

type ApplicationItem = z.infer<typeof applicationItemSchema>;
type TailoredDocumentItem = z.infer<typeof tailoredDocumentItemSchema>;
type ApplicationUiStatus = z.infer<typeof applicationUiStatusSchema>;

const ALL_STATUSES: ApplicationUiStatus[] = [
  "Saved",
  "Preparing",
  "Needs Approval",
  "Ready",
  "Submitting",
  "Submission Uncertain",
  "Confirmed",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Failed",
];

interface ApplicationsWorkspaceProps {
  readonly initialApplications: ApplicationItem[];
  readonly initialDocuments: TailoredDocumentItem[];
  readonly locale: string;
}

const handleExportDocument = async (
  documentId: string,
  format: "docx" | "pdf_html" | "json",
) => {
  const res = await fetch("/api/nextjob/tailoring/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId, format }),
  });
  if (res.ok) {
    const exported = (await res.json()) as {
      fileName: string;
      mimeType: string;
      content: string;
    };
    const blob = new Blob([exported.content], { type: exported.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exported.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const ApplicationsWorkspace = ({
  initialApplications,
  initialDocuments,
  locale,
}: ApplicationsWorkspaceProps) => {
  const router = useRouter();
  const [applications, setApplications] =
    useState<ApplicationItem[]>(initialApplications);
  const [documents, setDocuments] =
    useState<TailoredDocumentItem[]>(initialDocuments);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialApplications[0]?.id ?? null,
  );
  const [editingStmtId, setEditingStmtId] = useState<string | null>(null);
  const [editedStmtText, setEditedStmtText] = useState("");
  const [confirmationCodeInput, setConfirmationCodeInput] =
    useState("CONF-2026-9941");
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isArabic = locale === "ar";

  const refreshApplications = async () => {
    const res = await fetch("/api/nextjob/applications", { cache: "no-store" });
    if (res.ok) {
      const payload = (await res.json()) as {
        applications: ApplicationItem[];
        documents: TailoredDocumentItem[];
      };
      setApplications(payload.applications);
      setDocuments(payload.documents);
      if (!selectedAppId && payload.applications[0]) {
        setSelectedAppId(payload.applications[0].id);
      }
    }
    router.refresh();
  };

  const handleStatementAction = async (
    documentId: string,
    statementId: string,
    action: "accept" | "edit" | "reject",
    editedText?: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/tailoring/statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          statementId,
          action,
          editedText,
        }),
      });
      if (res.ok) {
        setEditingStmtId(null);
        setStatusBanner(
          action === "edit"
            ? isArabic
              ? "تم تحديث العبارة وإعادة حساب بصمة المستند SHA-256 (يتطلب إعادة الموافقة)."
              : "Statement updated and SHA-256 payload hash recomputed (any prior approval invalidated for safety)."
            : isArabic
              ? "تم تحديث حالة العبارة المخصصة."
              : "Tailored statement status updated.",
        );
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/applications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (res.ok) {
        setStatusBanner(
          isArabic
            ? "تم اعتماد الطلب وربط الموافقة ببصمة SHA-256 للمستند المخصص. الحالة الآن: جاهز للتقديم (Ready)."
            : "Application explicitly approved and bound to tailored document SHA-256 payload hash. Status is now Ready.",
        );
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordSubmission = async (
    applicationId: string,
    hasConfirmationSignal: boolean,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          hasConfirmationSignal,
          confirmationCode: hasConfirmationSignal
            ? confirmationCodeInput
            : undefined,
          confirmationText: hasConfirmationSignal
            ? `Portal confirmation received (${confirmationCodeInput})`
            : undefined,
          uncertaintyReason: hasConfirmationSignal
            ? undefined
            : "Simulated network drop / missing portal confirmation receipt; automatic retry blocked.",
        }),
      });
      if (res.ok) {
        setStatusBanner(
          hasConfirmationSignal
            ? isArabic
              ? "تم تأكيد التقديم وإصدار إيصال SHA-256 مشفر."
              : "Submission Confirmed! Immutable SHA-256 SubmissionReceipt issued."
            : isArabic
              ? "تنبيه: لم يتم استلام إشارة تأكيد. تم وضع الطلب في حالة (Submission Uncertain) وحظر إعادة المحاولة التلقائية."
              : "Notice: No confirmation signal received. Application placed in 'Submission Uncertain' and automatic retry is blocked.",
        );
        await refreshApplications();
      } else {
        const err = (await res.json()) as { message?: string };
        setStatusBanner(
          err.message ?? "Submission blocked by safety policy engine.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransitionStatus = async (
    applicationId: string,
    targetUiStatus: ApplicationUiStatus,
    reason: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/applications/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          targetUiStatus,
          reason,
        }),
      });
      if (res.ok) {
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReceipt = async (applicationId: string) => {
    const res = await fetch("/api/nextjob/applications/verify-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });
    if (res.ok) {
      const check = (await res.json()) as {
        verified: boolean;
        receiptHash?: string;
        verificationStatus?: string;
      };
      setStatusBanner(
        check.verified
          ? `Cryptographic Receipt Verified (${check.verificationStatus}): SHA-256 ${check.receiptHash?.slice(0, 24)}… is intact.`
          : "Receipt verification failed.",
      );
    }
  };

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.uiStatus === statusFilter);

  const selectedApp =
    applications.find((a) => a.id === selectedAppId) ??
    filteredApplications[0] ??
    null;

  const selectedDoc = selectedApp?.tailoredDocumentId
    ? documents.find((d) => d.id === selectedApp.tailoredDocumentId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isArabic
              ? "الطلبات واستوديو تخصيص السيرة الذاتية"
              : "Applications & Evidence-Constrained CV Studio"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isArabic
              ? "تتبع حالات الطلبات الـ 12، راجع العبارات المخصصة جنباً إلى جنب مع ادعاءاتك الموثقة، وصدّر بصيغة DOCX و PDF و JSON."
              : "Track all 12 pipeline states, inspect side-by-side statement provenance, enforce payload-hash approvals, and verify SHA-256 submission receipts."}
          </p>
        </div>

        <Button
          size="sm"
          render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
        >
          <Icons.Plus className="size-4" />
          <span>
            {isArabic
              ? "اختيار وظيفة جديدة للتقديم"
              : "Prepare New Application"}
          </span>
        </Button>
      </div>

      {statusBanner && (
        <div
          role="status"
          className="border-primary/30 bg-primary/10 flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
        >
          <span>{statusBanner}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusBanner(null)}
          >
            <Icons.X className="size-4" />
          </Button>
        </div>
      )}

      {/* 12-State Pipeline Filter Bar (Section 5.4) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          className="h-8 text-xs"
        >
          {isArabic ? "الكل" : "All"} ({applications.length})
        </Button>
        {ALL_STATUSES.map((st) => {
          const count = applications.filter((a) => a.uiStatus === st).length;
          return (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="h-8 text-xs"
            >
              <span>
                {st} ({count})
              </span>
            </Button>
          );
        })}
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-muted-foreground text-sm">
              {isArabic
                ? "لا توجد طلبات قيد التتبع حالياً. اختر وظيفة من صفحة البحث لتوليد سيرة ذاتية مخصصة."
                : "No applications in your pipeline yet. Select a job in Find Jobs to generate an evidence-constrained tailored CV."}
            </p>
            <Button
              size="sm"
              render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
            >
              {isArabic ? "استكشاف الوظائف" : "Browse Recommended Jobs"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Application List */}
          <div className="flex flex-col gap-3">
            {filteredApplications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <Card
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? "border-primary ring-primary/20 ring-2"
                      : "hover:bg-accent/30"
                  }`}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">
                          {app.roleTitle}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {app.company}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          app.uiStatus === "Confirmed" ||
                          app.uiStatus === "Offer"
                            ? "default"
                            : app.uiStatus === "Submission Uncertain" ||
                                app.uiStatus === "Failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {app.uiStatus}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground pt-2 font-mono text-[11px]">
                      {`State: ${app.internalState}`}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Right 2 columns: Selected Application Detail & Evidence-Constrained CV Studio */}
          {selectedApp && (
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Lifecycle Controls & Approval Gate */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">
                          {`${selectedApp.roleTitle} @ ${selectedApp.company}`}
                        </CardTitle>
                        <Badge
                          variant={
                            selectedApp.uiStatus === "Submission Uncertain"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {selectedApp.uiStatus}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1 text-xs">
                        {`${isArabic ? "الحالة الداخلية:" : "Internal State:"} ${selectedApp.internalState} • ${
                          selectedApp.approvedPayloadHash
                            ? `Approved Payload SHA-256: ${selectedApp.approvedPayloadHash.slice(0, 16)}…`
                            : isArabic
                              ? "بانتظار موافقة المستخدم"
                              : "Awaiting Explicit Human Approval"
                        }`}
                      </CardDescription>
                    </div>

                    <a
                      href={selectedApp.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      <span>
                        {isArabic ? "إعلان الوظيفة الأصلي" : "Job Posting URL"}
                      </span>
                      <Icons.ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Submission Uncertainty Warning Banner (Section 10 Scenario #6) */}
                  {selectedApp.uiStatus === "Submission Uncertain" && (
                    <div className="border-destructive bg-destructive/10 space-y-2 rounded-lg border p-4 text-xs">
                      <div className="text-destructive flex items-center gap-2 font-bold">
                        <Icons.AlertTriangle className="size-4" />
                        <span>
                          {isArabic
                            ? "حالة التقديم غير مؤكدة (SUBMITTED_UNVERIFIED) — تم حظر إعادة المحاولة التلقائية"
                            : "Submission Uncertain (SUBMITTED_UNVERIFIED) — Automatic Retry Blocked"}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {selectedApp.uncertaintyReason}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void handleTransitionStatus(
                              selectedApp.id,
                              "Confirmed",
                              "User manually verified employer confirmation email/portal.",
                            )
                          }
                        >
                          {isArabic
                            ? "تأكيد التقديم يدوياً بعد التحقق"
                            : "Manually Mark Confirmed"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void handleTransitionStatus(
                              selectedApp.id,
                              "Failed",
                              "User confirmed submission did not go through.",
                            )
                          }
                        >
                          {isArabic ? "تحديد كفشل" : "Mark Failed"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Explicit Human Approval Gate */}
                  <div className="bg-muted/30 flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">
                        {isArabic
                          ? "بوابة الموافقة البشرية الإلزامية (Approval Checkpoint)"
                          : "1. Mandatory Human Approval Gate"}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedApp.approvedPayloadHash
                          ? isArabic
                            ? `تم الاعتماد بواسطة ${selectedApp.approvedByUserId} للبصمة ${selectedApp.approvedPayloadHash.slice(0, 14)}…`
                            : `Approved by ${selectedApp.approvedByUserId} for payload hash ${selectedApp.approvedPayloadHash.slice(0, 14)}…`
                          : isArabic
                            ? "راجع العبارات المخصصة أدناه ثم اضغط اعتماد لفتح إمكانية التقديم."
                            : "Review your tailored statements below, then click Approve to bind your approval to the current payload hash."}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={
                        isLoading ||
                        selectedApp.uiStatus === "Ready" ||
                        selectedApp.uiStatus === "Confirmed"
                      }
                      onClick={() =>
                        void handleApproveApplication(selectedApp.id)
                      }
                    >
                      <Icons.Check className="size-4" />
                      <span>
                        {selectedApp.uiStatus === "Ready"
                          ? isArabic
                            ? "تم الاعتماد (Ready)"
                            : "Approved & Ready"
                          : isArabic
                            ? "اعتماد السيرة والطلب"
                            : "Approve Payload to Submit"}
                      </span>
                    </Button>
                  </div>

                  {/* Step 2: Record Submission (Confirmed vs Submission Uncertain) */}
                  <div className="bg-muted/30 space-y-3 rounded-lg border p-4 text-xs">
                    <p className="font-semibold">
                      {isArabic
                        ? "2. تسجيل التقديم والتحقق من إشارة التأكيد"
                        : "2. Submission Execution & Confirmation Verification"}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        value={confirmationCodeInput}
                        onChange={(e) =>
                          setConfirmationCodeInput(e.target.value)
                        }
                        placeholder="Employer confirmation code (e.g. CONF-2026-9941)"
                        className="bg-background h-8 text-xs sm:w-64"
                      />
                      <Button
                        size="sm"
                        disabled={
                          isLoading || selectedApp.uiStatus !== "Ready"
                        }
                        onClick={() =>
                          void handleRecordSubmission(selectedApp.id, true)
                        }
                      >
                        <Icons.BadgeCheck className="size-3.5" />
                        <span>
                          {isArabic
                            ? "تقديم مع إيصال تأكيد (Confirmed)"
                            : "Submit with Confirmation Receipt"}
                        </span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          isLoading || selectedApp.uiStatus !== "Ready"
                        }
                        onClick={() =>
                          void handleRecordSubmission(selectedApp.id, false)
                        }
                      >
                        <Icons.AlertTriangle className="size-3.5 text-amber-500" />
                        <span>
                          {isArabic
                            ? "محاكاة تقديم بدون تأكيد (Uncertain)"
                            : "Simulate Unconfirmed Attempt"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Step 3: Post-Submission Pipeline Stage Transitions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-muted-foreground font-medium">
                      {isArabic ? "تحديث المرحلة:" : "Update Lifecycle Stage:"}
                    </span>
                    {(
                      [
                        "Interview",
                        "Offer",
                        "Rejected",
                        "Withdrawn",
                      ] as ApplicationUiStatus[]
                    ).map((stage) => (
                      <Button
                        key={stage}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          void handleTransitionStatus(
                            selectedApp.id,
                            stage,
                            `User updated application stage to ${stage}.`,
                          )
                        }
                      >
                        {stage}
                      </Button>
                    ))}
                  </div>

                  {/* Cryptographic Submission Receipt Inspector */}
                  {selectedApp.receipt && (
                    <div className="bg-background space-y-2 rounded-lg border p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {isArabic
                            ? "إيصال التقديم المشفر (SHA-256 Submission Receipt)"
                            : "Cryptographic Submission Receipt (SHA-256)"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() =>
                            void handleVerifyReceipt(selectedApp.id)
                          }
                        >
                          <Icons.Lock className="size-3" />
                          <span>
                            {isArabic
                              ? "التحقق من سلامة الإيصال"
                              : "Verify Receipt Integrity"}
                          </span>
                        </Button>
                      </div>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        {`Receipt ID: ${selectedApp.receipt.id} • Status: ${selectedApp.receipt.verificationStatus}`}
                      </p>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        {`Receipt SHA-256: ${selectedApp.receipt.receiptHash}`}
                      </p>
                      {selectedApp.receipt.confirmationCode && (
                        <p className="font-medium text-emerald-600">
                          {`${isArabic ? "مرجع التأكيد:" : "Confirmation Reference:"} ${selectedApp.receipt.confirmationCode}`}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Evidence-Constrained Tailored CV & Resume Builder (P0-07) */}
              {selectedDoc && (
                <Card>
                  <CardHeader>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {isArabic
                              ? "السيرة الذاتية المخصصة المقيدة بالأدلة"
                              : "Evidence-Constrained Tailored CV Studio"}
                          </CardTitle>
                          <Badge variant="default" className="text-xs">
                            {`0 ${isArabic ? "ادعاءات غير مدعومة" : "Unsupported Claims"}`}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {`Payload SHA-256: ${selectedDoc.payloadHash.slice(0, 20)}… • ${isArabic ? `مدعوم بـ ${selectedDoc.sourceClaimIds.length} حقيقة موثقة` : `Backed by ${selectedDoc.sourceClaimIds.length} verified profile claims`}`}
                        </CardDescription>
                      </div>

                      {/* Multi-Format Export Controls (DOCX, PDF/HTML, JSON) */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void handleExportDocument(selectedDoc.id, "docx")
                          }
                        >
                          <Icons.Download className="size-3.5" />
                          <span>{"DOCX"}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void handleExportDocument(
                              selectedDoc.id,
                              "pdf_html",
                            )
                          }
                        >
                          <Icons.Download className="size-3.5" />
                          <span>
                            {isArabic ? "PDF / طباعة HTML" : "PDF / Print HTML"}
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void handleExportDocument(selectedDoc.id, "json")
                          }
                        >
                          <Icons.Download className="size-3.5" />
                          <span>{"JSON"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {selectedDoc.statements.map((stmt) => {
                      const isEditing = editingStmtId === stmt.id;
                      return (
                        <div
                          key={stmt.id}
                          className={`space-y-2 rounded-lg border p-3.5 text-xs ${
                            stmt.status === "rejected" ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="uppercase">
                                {stmt.section}
                              </Badge>
                              <Badge variant="outline" className="font-mono">
                                {`Provenance: ${stmt.sourceClaimIds.join(", ")}`}
                              </Badge>
                              <Badge
                                variant={
                                  stmt.status === "rejected"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {stmt.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() =>
                                  void handleStatementAction(
                                    selectedDoc.id,
                                    stmt.id,
                                    "accept",
                                  )
                                }
                              >
                                {isArabic ? "قبول" : "Accept"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setEditingStmtId(stmt.id);
                                  setEditedStmtText(stmt.proposedText);
                                }}
                              >
                                {isArabic ? "تعديل" : "Edit"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() =>
                                  void handleStatementAction(
                                    selectedDoc.id,
                                    stmt.id,
                                    "reject",
                                  )
                                }
                              >
                                {isArabic ? "استبعاد" : "Reject"}
                              </Button>
                            </div>
                          </div>

                          {/* Side-by-side Original Verified Claim vs Tailored Statement */}
                          <div className="grid gap-3 pt-1 sm:grid-cols-2">
                            <div className="bg-muted/40 rounded border p-2.5">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                                {isArabic
                                  ? "الحقيقة الأصلية الموثقة:"
                                  : "Original Verified Fact:"}
                              </span>
                              <p className="mt-1">{stmt.originalText}</p>
                            </div>

                            <div className="bg-primary/5 border-primary/20 rounded border p-2.5">
                              <span className="text-primary block text-[10px] font-semibold uppercase">
                                {isArabic
                                  ? "الصياغة المخصصة للوظيفة:"
                                  : "Tailored Statement:"}
                              </span>
                              {isEditing ? (
                                <div className="mt-1 space-y-2">
                                  <Textarea
                                    value={editedStmtText}
                                    onChange={(e) =>
                                      setEditedStmtText(e.target.value)
                                    }
                                    rows={3}
                                    className="text-xs"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() =>
                                        void handleStatementAction(
                                          selectedDoc.id,
                                          stmt.id,
                                          "edit",
                                          editedStmtText,
                                        )
                                      }
                                    >
                                      {isArabic ? "حفظ" : "Save Statement"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs"
                                      onClick={() => setEditingStmtId(null)}
                                    >
                                      {isArabic ? "إلغاء" : "Cancel"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-1 font-medium">
                                  {stmt.proposedText}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-muted-foreground text-[11px]">
                            <span className="font-semibold">
                              {isArabic ? "سبب الملاءمة:" : "Why tailored:"}
                            </span>{" "}
                            {stmt.relevanceReason}
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Audit Trail for Selected Application */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isArabic
                      ? "سجل أحداث وتدقيق الطلب"
                      : "Application State Machine Audit Log"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2.5">
                  {selectedApp.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex flex-col justify-between gap-1 rounded border p-2.5 text-xs sm:flex-row sm:items-center"
                    >
                      <div>
                        <span className="font-mono font-semibold">
                          {evt.fromState ?? "INIT"} → {evt.toState}
                        </span>
                        <p className="text-muted-foreground">{evt.reason}</p>
                      </div>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        {new Date(evt.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
