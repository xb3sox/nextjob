"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Card } from "@workspace/ui-web/card";
import { Icons } from "@workspace/ui-web/icons";
import { Skeleton } from "@workspace/ui-web/skeleton";

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

import { AutomationModeCard } from "./automation-mode-card";

import type { todayDashboardResponseSchema } from "@workspace/api/schema";
import type * as z from "zod";

const OnboardingWizard = dynamic(
  () => import("./onboarding-wizard").then((mod) => mod.OnboardingWizard),
  {
    ssr: false,
    loading: () => null,
  },
);

type TodayDashboardData = z.infer<typeof todayDashboardResponseSchema>;

interface TodayDashboardProps {
  readonly initialData: TodayDashboardData;
  readonly locale: string;
}

export const TodayDashboard = ({
  initialData,
  locale,
}: TodayDashboardProps) => {
  const router = useRouter();
  const [data, setData] = useState<TodayDashboardData>(initialData);
  const [isPending, setIsPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const isArabic = locale === "ar";

  const refreshToday = async () => {
    const res = await fetch("/api/nextjob/today", { cache: "no-store" });
    if (res.ok) {
      const updated = (await res.json()) as TodayDashboardData;
      setData(updated);
    }
    router.refresh();
  };

  const handlePrepareApplication = async (jobId: string) => {
    setIsPending(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/nextjob/applications/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          language: isArabic ? "ar" : "en",
        }),
      });
      if (res.ok) {
        setStatusMessage(
          isArabic
            ? "تم إعداد السيرة الذاتية المخصصة والطلب للمراجعة والاعتماد."
            : "Prepared tailored CV and application for your review and approval.",
        );
        await refreshToday();
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleConfirmClaim = async (claimId: string) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/nextjob/career/claims/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          action: "confirm",
          reason: "Confirmed directly from Today action dashboard.",
        }),
      });
      if (res.ok) {
        setStatusMessage(
          isArabic
            ? "تم توثيق السجل المهني بنجاح."
            : "Career claim verified and added to your authoritative profile.",
        );
        await refreshToday();
      }
    } finally {
      setIsPending(false);
    }
  };

  const { metrics } = data;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16">
      {/* Super Minimal Header */}
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {isArabic ? "المحرك الذكي نشط" : "Autopilot Active"}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-muted-foreground font-mono text-xs">
              {metrics.suitableJobsCount}{" "}
              {isArabic ? "فرصة اليوم" : "matches today"}
            </span>
          </div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {isArabic ? "اليوم" : "Today"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <Icons.Sparkles className="size-3.5" />
            <span>
              {isArabic ? "إعداد المساعد (٦٠ ث)" : "Setup Agent (60s)"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer text-xs"
            render={<TurboLink href={pathsConfig.dashboard.user.career} />}
          >
            <Icons.UserRound className="size-3.5" />
            <span>{isArabic ? "مسيرتي" : "My Career"}</span>
          </Button>
          <Button
            size="sm"
            className="cursor-pointer text-xs"
            render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
          >
            <Icons.Search className="size-3.5" />
            <span>{isArabic ? "البحث عن وظائف" : "Find Jobs"}</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="bg-muted/40 border-border/80 text-foreground flex items-center justify-between rounded-lg border px-4 py-2.5 text-xs shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Dismiss"
          >
            <Icons.X className="size-3.5" />
          </button>
        </div>
      )}

      {/* World-Class Linear-Style Metric Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TurboLink
          href={pathsConfig.dashboard.user.jobs}
          className="group block"
        >
          <div className="bg-card hover:bg-accent/40 border-border/60 hover:border-border flex flex-col justify-between rounded-xl border p-4 transition-all duration-150">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {isArabic ? "وظائف متطابقة" : "Matched Jobs"}
              </span>
              <Icons.Briefcase className="text-muted-foreground/60 group-hover:text-foreground size-4 transition-colors" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
                {metrics.suitableJobsCount}
              </span>
              <span className="text-muted-foreground text-xs">
                {isArabic ? "فرصة" : "roles"}
              </span>
            </div>
          </div>
        </TurboLink>

        <TurboLink
          href={pathsConfig.dashboard.user.applications}
          className="group block"
        >
          <div className="bg-card hover:bg-accent/40 border-border/60 hover:border-border flex flex-col justify-between rounded-xl border p-4 transition-all duration-150">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {isArabic ? "بانتظار موافقتك" : "Needs Review"}
              </span>
              <Icons.Lock className="size-4 text-amber-500/80" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
                {metrics.applicationsReadyForApprovalCount}
              </span>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {isArabic ? "جاهز للاعتماد" : "pending"}
              </span>
            </div>
          </div>
        </TurboLink>

        <TurboLink
          href={pathsConfig.dashboard.user.career}
          className="group block"
        >
          <div className="bg-card hover:bg-accent/40 border-border/60 hover:border-border flex flex-col justify-between rounded-xl border p-4 transition-all duration-150">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">
                {isArabic ? "حقائق غير موثقة" : "Unverified Facts"}
              </span>
              <Icons.BadgeCheck className="size-4 text-blue-500/80" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
                {metrics.claimsNeedingVerificationCount}
              </span>
              <span className="text-muted-foreground text-xs">
                {isArabic ? "تتطلب تأكيد" : "claims"}
              </span>
            </div>
          </div>
        </TurboLink>

        <div className="bg-card border-border/60 flex flex-col justify-between rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              {isArabic ? "المقابلات والمراحل" : "Active Interviews"}
            </span>
            <Icons.Calendar className="size-4 text-emerald-500/80" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-foreground text-2xl font-semibold tracking-tight tabular-nums">
              {metrics.upcomingInterviewsCount}
            </span>
            <span className="text-muted-foreground text-xs">
              {metrics.uncertainSubmissionsCount > 0
                ? `${metrics.uncertainSubmissionsCount} ${isArabic ? "قيد التدقيق" : "in review"}`
                : isArabic
                  ? "مؤكد"
                  : "scheduled"}
            </span>
          </div>
        </div>
      </div>

      {/* Tsenta-Style Autonomous vs Review Mode Control */}
      <AutomationModeCard
        initialMode={
          data.metrics.applicationsReadyForApprovalCount > 0
            ? "review_first"
            : "review_first"
        }
        initialCap={15}
        initialThreshold={85}
        onUpdate={() => {
          void refreshToday();
        }}
      />

      {/* Main Grid: Action Queue (Left) & Truth Ledger (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Applications Awaiting Review & Recommended Matches */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Action-First: Ready for Approval Queue */}
          {data.applicationsNeedingAction.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <h2 className="text-foreground text-sm font-semibold">
                    {isArabic
                      ? "طلبات بانتظار موافقتك الصريحة"
                      : "Approval Queue"}
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 font-mono text-[11px] text-amber-600 dark:text-amber-400"
                  >
                    {data.applicationsNeedingAction.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-7 text-xs"
                  render={
                    <TurboLink href={pathsConfig.dashboard.user.applications} />
                  }
                >
                  <span>{isArabic ? "عرض الكل" : "View all"}</span>
                  <Icons.ArrowRight className="size-3" />
                </Button>
              </div>

              <div className="divide-border/40 divide-y">
                {data.applicationsNeedingAction.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col gap-3 py-3 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {app.roleTitle}
                        </span>
                        <span className="text-muted-foreground text-xs">•</span>
                        <span className="text-muted-foreground text-xs">
                          {app.company}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {app.uncertaintyReason ??
                          (isArabic
                            ? "السيرة المخصصة جاهزة للمراجعة والتقديم."
                            : "Tailored application ready for review and submission.")}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="h-8 shrink-0 cursor-pointer text-xs"
                      render={
                        <TurboLink
                          href={pathsConfig.dashboard.user.applications}
                        />
                      }
                    >
                      <Icons.Eye className="size-3.5" />
                      <span>
                        {isArabic ? "معاينة واعتماد" : "Review & Submit"}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clean Recommended Jobs List */}
          <div className="bg-card border-border/60 rounded-xl border">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-foreground text-sm font-semibold">
                  {isArabic ? "أفضل الفرص المطابقة" : "Top Matching Roles"}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {isArabic
                    ? "مرتبة وفق تحليل الملاءمة الدقيق مع ملفك المهني الموثق."
                    : "Ranked by fit score against your verified claims."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 text-xs"
                render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
              >
                <span>{isArabic ? "استكشاف الكل" : "Explore all"}</span>
                <Icons.ArrowRight className="size-3" />
              </Button>
            </div>

            <div className="divide-border/40 divide-y">
              {data.recommendedJobs.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-xs">
                  {isArabic
                    ? "لا توجد وظائف مطابقة حالياً. جرّب تحديث تفضيلاتك في مسيرتي."
                    : "No matching roles found yet. Adjust your preferences in My Career."}
                </div>
              ) : (
                data.recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="hover:bg-muted/20 flex flex-col gap-3 px-5 py-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground truncate text-sm font-medium">
                          {job.title}
                        </span>
                        <Badge
                          variant={
                            job.overallScore >= 90 ? "default" : "secondary"
                          }
                          className="font-mono text-[10px] tabular-nums"
                        >
                          {job.overallScore}% {isArabic ? "توافق" : "fit"}
                        </Badge>
                        <span className="text-muted-foreground/60 text-xs">
                          •
                        </span>
                        <span className="text-muted-foreground text-xs font-medium">
                          {job.company}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="capitalize">{job.workMode}</span>
                        {job.salaryMin && job.salaryMax && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] tabular-nums">
                              {job.salaryCurrency ?? "$"}
                              {job.salaryMin.toLocaleString()} -{" "}
                              {job.salaryMax.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handlePrepareApplication(job.id)}
                        className="h-8 cursor-pointer text-xs"
                      >
                        <Icons.Check className="size-3.5" />
                        <span>
                          {isArabic ? "تخصيص الطلب" : "Tailor & Prep"}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Claims Verification & Activity */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Unverified Claims Checklist */}
          <div className="bg-card border-border/60 space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {isArabic ? "توثيق الحقائق" : "Claim Verification"}
                </h3>
                <p className="text-muted-foreground text-[11px]">
                  {isArabic
                    ? "صفر فبركة: الحقائق الموثقة فقط تُدرج."
                    : "Only verified facts are used in tailoring."}
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {data.pendingClaims.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {data.pendingClaims.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  <Icons.CheckCircle2 className="mx-auto mb-1.5 size-5 text-emerald-500" />
                  <p className="text-foreground font-medium">
                    {isArabic ? "جميع الحقائق موثقة" : "All claims verified"}
                  </p>
                </div>
              ) : (
                data.pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-muted/30 border-border/50 space-y-1.5 rounded-lg border p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground truncate font-medium">
                        {claim.title}
                      </span>
                      <span className="text-muted-foreground font-mono text-[10px] uppercase">
                        {claim.verificationStatus}
                      </span>
                    </div>
                    {claim.organization && (
                      <p className="text-muted-foreground truncate text-[11px]">
                        {claim.organization}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        className="h-6 flex-1 cursor-pointer text-[11px]"
                        disabled={isPending}
                        onClick={() => handleConfirmClaim(claim.id)}
                      >
                        <Icons.Check className="size-3" />
                        <span>{isArabic ? "تأكيد" : "Verify"}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-6 cursor-pointer px-2 text-[11px]"
                        render={
                          <TurboLink href={pathsConfig.dashboard.user.career} />
                        }
                      >
                        <span>{isArabic ? "تفاصيل" : "Edit"}</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-card border-border/60 space-y-3 rounded-xl border p-4">
            <h3 className="text-muted-foreground border-b pb-2 text-xs font-semibold tracking-wider uppercase">
              {isArabic ? "النشاط الأخير" : "Recent Activity"}
            </h3>
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="border-border/60 space-y-0.5 border-s-2 ps-3 text-xs"
                >
                  <p className="text-foreground font-medium">{item.action}</p>
                  <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 60-Second Onboarding Wizard */}
      {isOnboardingOpen && (
        <OnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={() => {
            setIsOnboardingOpen(false);
            void refreshToday();
          }}
        />
      )}
    </div>
  );
};

export const TodayDashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-36" />
            <Skeleton className="mt-4 h-4 w-28" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-4 h-16 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
};
