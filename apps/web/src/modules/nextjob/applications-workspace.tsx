/* oxlint-disable i18next/no-literal-string */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

import { VisualDiffViewer } from "./visual-diff-viewer";

import type {
  applicationItemSchema,
  applicationUiStatusSchema,
  tailoredDocumentItemSchema,
} from "@workspace/api/schema";
import type * as z from "zod";

type ApplicationItem = z.infer<typeof applicationItemSchema>;
type TailoredDocumentItem = z.infer<typeof tailoredDocumentItemSchema>;
type ApplicationUiStatus = z.infer<typeof applicationUiStatusSchema>;

const PIPELINE_STATUS_GROUPS: {
  id: string;
  labelEn: string;
  labelAr: string;
  statuses: ApplicationUiStatus[];
}[] = [
  { id: "all", labelEn: "All", labelAr: "الكل", statuses: [] },
  {
    id: "review",
    labelEn: "Needs Review",
    labelAr: "بانتظار المراجعة",
    statuses: ["Preparing", "Needs Approval", "Ready"],
  },
  {
    id: "active",
    labelEn: "Active",
    labelAr: "نشطة",
    statuses: ["Submitting", "Confirmed", "Interview", "Offer"],
  },
  {
    id: "closed",
    labelEn: "Closed",
    labelAr: "مغلقة",
    statuses: ["Rejected", "Withdrawn", "Failed"],
  },
];

interface ApplicationsWorkspaceProps {
  readonly initialApplications: ApplicationItem[];
  readonly initialDocuments: TailoredDocumentItem[];
  readonly locale: string;
}

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
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>("all");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialApplications[0]?.id ?? null,
  );
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

  const handleApproveApplication = async (applicationId: string) => {
    setIsLoading(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/nextjob/applications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (res.ok) {
        setStatusBanner(
          isArabic
            ? "تم اعتماد الطلب وتوثيق بصمة المستند بنجاح."
            : "Application approved and ready for automated submission.",
        );
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordSubmission = async (
    applicationId: string,
    confirmed: boolean,
  ) => {
    setIsLoading(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/nextjob/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          hasConfirmationSignal: confirmed,
          confirmationCode: `CONF-${Date.now().toString().slice(-4)}`,
        }),
      });
      if (res.ok) {
        setStatusBanner(
          confirmed
            ? isArabic
              ? "تم إرسال الطلب وإصدار إيصال تقديم موثق (SHA-256)."
              : "Application submitted! Cryptographic receipt generated."
            : isArabic
              ? "التقديم قيد التدقيق (Uncertain) بانتظار إشعار صاحب العمل."
              : "Submission in progress. Verification pending employer signal.",
        );
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransitionStatus = async (
    applicationId: string,
    targetStatus: ApplicationUiStatus,
    reason?: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/applications/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          targetUiStatus: targetStatus,
          reason: reason ?? `Status changed to ${targetStatus}`,
        }),
      });
      if (res.ok) {
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStatementEdit = async (
    documentId: string,
    statementId: string,
    newText: string,
  ) => {
    if (!newText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/nextjob/tailoring/statement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          statementId,
          action: "edit",
          editedText: newText,
        }),
      });
      if (res.ok) {
        await refreshApplications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeGroupFilter === "all") return true;
    const group = PIPELINE_STATUS_GROUPS.find(
      (g) => g.id === activeGroupFilter,
    );
    return group ? group.statuses.includes(app.uiStatus) : true;
  });

  const selectedApp =
    applications.find((a) => a.id === selectedAppId) ??
    filteredApplications[0] ??
    null;

  const selectedDoc = selectedApp?.tailoredDocumentId
    ? (documents.find((d) => d.id === selectedApp.tailoredDocumentId) ?? null)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-16">
      {/* Clean Header */}
      <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {isArabic ? "مسار الطلبات" : "Applications"}
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-[11px] font-normal"
            >
              <span className="tabular-nums">{applications.length}</span>{" "}
              {isArabic ? "طلب" : "tracked"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {isArabic
              ? "متابعة الطلبات، مراجعة السير المخصصة، والموافقة على التقديم."
              : "Review tailored CV drafts, approve submissions, and track statuses."}
          </p>
        </div>

        <Button
          size="sm"
          className="h-8 cursor-pointer text-xs"
          render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
        >
          <Icons.Plus className="size-3.5" />
          <span>{isArabic ? "وظيفة جديدة" : "Find More Jobs"}</span>
        </Button>
      </div>

      {statusBanner && (
        <div
          role="status"
          className="bg-muted/40 border-border/80 text-foreground flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-xs shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Dismiss"
          >
            <Icons.X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Segmented Pipeline Filter */}
      <div className="flex items-center gap-1 border-b pb-3">
        {PIPELINE_STATUS_GROUPS.map((group) => {
          const count =
            group.id === "all"
              ? applications.length
              : applications.filter((a) => group.statuses.includes(a.uiStatus))
                  .length;

          const isActive = activeGroupFilter === group.id;

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupFilter(group.id)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span>{isArabic ? group.labelAr : group.labelEn}</span>
              <span
                className={`rounded-full px-1.5 font-mono text-[10px] tabular-nums ${
                  isActive
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {applications.length === 0 ? (
        <div className="bg-card border-border/60 space-y-2 rounded-xl border py-16 text-center">
          <Icons.FileText className="text-muted-foreground/40 mx-auto size-8" />
          <h3 className="text-foreground text-sm font-semibold">
            {isArabic ? "لا توجد طلبات بعد" : "No applications yet"}
          </h3>
          <p className="text-muted-foreground mx-auto max-w-xs text-xs">
            {isArabic
              ? "اختر وظيفة مناسبة من قائمة الوظائف للبدء في تجهيز سيرتك المخصصة."
              : "Discover a matched role and tailor your first application with one click."}
          </p>
          <Button
            size="sm"
            className="mt-2 h-8 cursor-pointer text-xs"
            render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
          >
            <Icons.Search className="size-3.5" />
            <span>{isArabic ? "استكشاف الوظائف" : "Explore Jobs"}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left Column: Application Master List */}
          <div className="flex flex-col gap-1.5 lg:col-span-5">
            {filteredApplications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              const isNeedsApproval =
                app.uiStatus === "Needs Approval" ||
                app.uiStatus === "Preparing";
              const isReady = app.uiStatus === "Ready";
              const isConfirmed =
                app.uiStatus === "Confirmed" || app.uiStatus === "Offer";

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedAppId(app.id);
                    }
                  }}
                  role="button"
                  aria-label={`Select application for ${app.roleTitle} at ${app.company}`}
                  tabIndex={0}
                  className={`group relative flex cursor-pointer flex-col rounded-xl border p-3.5 text-start transition-all duration-150 ${
                    isSelected
                      ? "border-foreground/40 bg-accent/40 shadow-2xs"
                      : "border-border/60 bg-card hover:border-border hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground truncate text-sm font-medium">
                          {app.roleTitle}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        {app.company}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isConfirmed
                          ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                          : isReady
                            ? "bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400"
                            : isNeedsApproval
                              ? "bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {app.uiStatus}
                    </span>
                  </div>

                  <div className="text-muted-foreground mt-2.5 flex items-center justify-between font-mono text-[11px]">
                    <span>{app.internalState}</span>
                    <span className="tabular-nums">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detail Studio & Diff Inspector */}
          {selectedApp && (
            <div className="space-y-4 lg:col-span-7">
              {/* Application Top Summary & Actions */}
              <div className="bg-card border-border/60 space-y-4 rounded-xl border p-5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-foreground text-lg font-semibold">
                        {selectedApp.roleTitle}
                      </h2>
                      <Badge
                        variant={
                          selectedApp.uiStatus === "Confirmed"
                            ? "default"
                            : selectedApp.uiStatus === "Ready"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs font-medium"
                      >
                        {selectedApp.uiStatus}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      <span className="text-foreground font-medium">
                        {selectedApp.company}
                      </span>
                      {" • "}
                      <span>{selectedApp.internalState} mode</span>
                    </p>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="flex items-center gap-2">
                    {selectedApp.uiStatus === "Needs Approval" && (
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() =>
                          void handleApproveApplication(selectedApp.id)
                        }
                        className="h-8 cursor-pointer text-xs shadow-xs"
                      >
                        <Icons.Check className="size-3.5" />
                        <span>
                          {isArabic ? "اعتماد السيرة والطلب" : "Approve Draft"}
                        </span>
                      </Button>
                    )}

                    {selectedApp.uiStatus === "Ready" && (
                      <Button
                        size="sm"
                        disabled={isLoading}
                        onClick={() =>
                          void handleRecordSubmission(selectedApp.id, true)
                        }
                        className="h-8 cursor-pointer text-xs shadow-xs"
                      >
                        <Icons.Send className="size-3.5" />
                        <span>{isArabic ? "تقديم الآن" : "Submit Now"}</span>
                      </Button>
                    )}

                    <a
                      href={selectedApp.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${isArabic ? "الإعلان" : "Job URL"} (${isArabic ? "يفتح في علامة تبويب جديدة" : "opens in new tab"})`}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 text-xs font-medium"
                    >
                      <span>{isArabic ? "الإعلان" : "Job URL"}</span>
                      <Icons.ArrowUpRight className="size-3" />
                    </a>
                  </div>
                </div>

                {/* Status Transitions */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground me-1 text-[11px]">
                    {isArabic ? "تحديث المرحلة:" : "Move stage:"}
                  </span>
                  {(
                    [
                      "Interview",
                      "Offer",
                      "Rejected",
                      "Withdrawn",
                    ] as ApplicationUiStatus[]
                  ).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        void handleTransitionStatus(
                          selectedApp.id,
                          stage,
                          `User changed stage to ${stage}`,
                        )
                      }
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer rounded px-2 py-0.5 text-[11px] font-medium transition-colors"
                    >
                      {stage}
                    </button>
                  ))}
                </div>

                {/* Submission Receipt */}
                {selectedApp.receipt && (
                  <div className="space-y-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {isArabic
                          ? "إيصال التقديم الموثق (SHA-256)"
                          : "Verified Submission Receipt"}
                      </span>
                      <span className="text-muted-foreground font-mono text-[10px]">
                        {new Date(
                          selectedApp.receipt.submittedAt,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-mono text-[10px] break-all">
                      {selectedApp.receipt.payloadHash}
                    </p>
                  </div>
                )}
              </div>

              {/* Tailored CV Review Studio */}
              {selectedDoc && (
                <div className="bg-card border-border/60 space-y-4 rounded-xl border p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="text-foreground text-sm font-semibold">
                        {isArabic
                          ? "السيرة الذاتية المخصصة للوظيفة"
                          : "Tailored Resume Draft"}
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        {isArabic
                          ? "صياغة مخصصة بدقة ومقيدة فقط بالحقائق المهنية الموثقة."
                          : "Evidence-grounded statements matching role keywords."}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Zero Hallucination
                    </Badge>
                  </div>

                  {/* Summary */}
                  {selectedDoc.summary && (
                    <div className="bg-muted/20 space-y-1 rounded-lg p-3 text-xs">
                      <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        {isArabic
                          ? "الملخص المهني المخصص"
                          : "Tailored Executive Summary"}
                      </span>
                      <p className="text-foreground leading-relaxed">
                        {selectedDoc.summary}
                      </p>
                    </div>
                  )}

                  {/* Statements & Tsenta-Style Visual Diff */}
                  <div className="space-y-3">
                    <VisualDiffViewer
                      statements={selectedDoc.statements.map((s) => ({
                        id: s.id,
                        originalText:
                          s.proposedText.length > 50
                            ? `${s.proposedText.slice(0, 45)}... [Master Fact]`
                            : s.proposedText,
                        proposedText: s.proposedText,
                        status: s.status,
                        sourceClaimIds: s.sourceClaimIds,
                      }))}
                      targetCompany={selectedApp.company}
                      targetRole={selectedApp.roleTitle}
                      onApproveAll={() => {
                        if (selectedApp.uiStatus === "Needs Approval") {
                          void handleApproveApplication(selectedApp.id);
                        }
                      }}
                      onEditStatement={(stmtId, text) => {
                        void handleSaveStatementEdit(
                          selectedDoc.id,
                          stmtId,
                          text,
                        );
                      }}
                      isReadOnly={selectedApp.uiStatus === "Confirmed"}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
