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
import { Skeleton } from "@workspace/ui-web/skeleton";

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

import type { todayDashboardResponseSchema } from "@workspace/api/schema";
import type * as z from "zod";

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
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {isArabic ? "NextJob P0" : "NextJob P0"}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {isArabic
                ? "ملف مهني واحد. كل الفرص. جهد أقل."
                : "One Profile. Every Opportunity. Less Work."}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {isArabic ? "اليوم — ملخص الإجراءات المهنية" : "Today"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isArabic
              ? "إجراءاتك اليومية ذات الأولوية: الوظائف المناسبة، الطلبات الجاهزة للموافقة، وتوثيق الملف المهني."
              : "Your daily career action summary. Prioritize high-fit opportunities and explicit approvals."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<TurboLink href={pathsConfig.dashboard.user.career} />}
          >
            <Icons.UserRound className="size-4" />
            <span>{isArabic ? "مسيرتي المهنية" : "My Career"}</span>
          </Button>
          <Button
            size="sm"
            render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
          >
            <Icons.Search className="size-4" />
            <span>{isArabic ? "البحث عن وظائف" : "Find Jobs"}</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="border-primary/30 bg-primary/10 text-foreground flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
        >
          <div className="flex items-center gap-2">
            <Icons.CheckCircle2 className="text-primary size-4" />
            <span>{statusMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusMessage(null)}
          >
            <Icons.X className="size-4" />
          </Button>
        </div>
      )}

      {/* Action-First Status Banner Cards (Section 5.1) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-primary border-l-4">
          <CardHeader className="pb-2">
            <CardDescription>
              {isArabic ? "الفرص المطابقة" : "Recommended Opportunities"}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {isArabic
                ? `تم العثور على ${metrics.suitableJobsCount} وظائف مناسبة.`
                : `${metrics.suitableJobsCount} suitable jobs found.`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TurboLink
              href={pathsConfig.dashboard.user.jobs}
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <span>
                {isArabic
                  ? "مراجعة تحليل الملاءمة والأهلية"
                  : "Review job fit & eligibility"}
              </span>
              <Icons.ArrowRight className="size-3" />
            </TurboLink>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>
              {isArabic ? "بانتظار موافقتك" : "Ready for Approval"}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {isArabic
                ? `${metrics.applicationsReadyForApprovalCount} طلبات جاهزة.`
                : `${metrics.applicationsReadyForApprovalCount} applications ready.`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TurboLink
              href={pathsConfig.dashboard.user.applications}
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <span>
                {isArabic
                  ? "مراجعة السيرة المخصصة والاعتماد"
                  : "Inspect tailored CV & approve"}
              </span>
              <Icons.ArrowRight className="size-3" />
            </TurboLink>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>
              {isArabic ? "توثيق الملف المهني" : "Profile Verification"}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {isArabic
                ? `${metrics.claimsNeedingVerificationCount} عنصر يحتاج لتأكيدك.`
                : `${metrics.claimsNeedingVerificationCount} claim needs your answer.`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TurboLink
              href={pathsConfig.dashboard.user.career}
              className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <span>
                {isArabic
                  ? "تأكيد الخبرات وحل التعارضات"
                  : "Verify claims & resolve conflicts"}
              </span>
              <Icons.ArrowRight className="size-3" />
            </TurboLink>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription>
              {isArabic ? "المقابلات والمتابعات" : "Interviews & Follow-ups"}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {isArabic
                ? `${metrics.upcomingInterviewsCount} مقابلات • ${metrics.followUpRemindersCount} تذكيرات`
                : `${metrics.upcomingInterviewsCount} interviews • ${metrics.followUpRemindersCount} follow-ups`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-muted-foreground text-xs">
              {metrics.uncertainSubmissionsCount > 0
                ? isArabic
                  ? `${metrics.uncertainSubmissionsCount} تقديم غير مؤكد يتطلب الفحص`
                  : `${metrics.uncertainSubmissionsCount} uncertain submission requires attention`
                : isArabic
                  ? "جميع حالات التقديم محدثة وموثقة"
                  : "All submission receipts verified"}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 columns: Recommended Jobs */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {isArabic
                    ? "الوظائف الموصى بها لك اليوم"
                    : "Recommended Jobs"}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? "مرتبة حسب مدى مطابقتها لخبراتك الموثقة وأهليتك."
                    : "Ranked by explainable match score and hard eligibility verification."}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<TurboLink href={pathsConfig.dashboard.user.jobs} />}
              >
                {isArabic ? "عرض الكل" : "View all"}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.recommendedJobs.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  {isArabic
                    ? "لا توجد وظائف مطابقة حالياً. قم بتحديث تفضيلاتك المهنية."
                    : "No suitable jobs found yet. Adjust your career preferences."}
                </p>
              ) : (
                data.recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-card hover:bg-accent/30 flex flex-col justify-between gap-3 rounded-lg border p-4 transition sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{job.title}</span>
                        <Badge variant="default" className="text-xs">
                          {job.overallScore}% {isArabic ? "تطابق" : "Fit"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {job.workMode}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {job.company} • {job.location} •{" "}
                        {job.salaryMin && job.salaryMax
                          ? `${job.salaryCurrency ?? "USD"} ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}`
                          : "Compensation unlisted"}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">
                          {isArabic ? "سبب التطابق: " : "Why it matches: "}
                        </span>
                        {job.fitAnalysis.whyMatches[0]}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handlePrepareApplication(job.id)}
                      >
                        <Icons.Check className="size-3.5" />
                        <span>
                          {isArabic ? "تخصيص السيرة والتقديم" : "Prepare CV"}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Applications Requiring Attention */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {isArabic
                    ? "طلبات التوظيف التي تتطلب انتباهك"
                    : "Applications Requiring Attention"}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? "طلبات جاهزة للموافقة أو محاولات تقديم غير مؤكدة."
                    : "Prepared applications awaiting human approval or uncertain submissions."}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <TurboLink href={pathsConfig.dashboard.user.applications} />
                }
              >
                {isArabic ? "إدارة الطلبات" : "Open Pipeline"}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.applicationsNeedingAction.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                  {isArabic
                    ? "لا توجد طلبات معلقة حالياً. اختر وظيفة أعلاه لإعداد سيرة ذاتية مخصصة."
                    : "No pending application approvals. Click 'Prepare CV' on any recommended job above to start."}
                </div>
              ) : (
                data.applicationsNeedingAction.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col justify-between gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{app.roleTitle}</span>
                        <Badge
                          variant={
                            app.uiStatus === "Submission Uncertain"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {app.uiStatus}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {app.company} •{" "}
                        {app.uncertaintyReason ??
                          app.notes ??
                          "Awaiting review and explicit payload approval."}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <TurboLink
                          href={pathsConfig.dashboard.user.applications}
                        />
                      }
                    >
                      {isArabic ? "مراجعة واعتماد" : "Review & Approve"}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Pending Profile Verifications & Activity */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic
                  ? "حقائق مهنية بانتظار التأكيد"
                  : "Actions Requiring Verification"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "لا يتم استخدام أي حقيقة غير موثقة في سيرتك الذاتية حتى توافق عليها."
                  : "Unverified claims and date conflicts are never used in tailored CVs until you confirm them."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.pendingClaims.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  {isArabic
                    ? "جميع حقائق ملفك المهني موثقة بالكامل!"
                    : "All career claims are verified!"}
                </p>
              ) : (
                data.pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="space-y-2 rounded-lg border p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{claim.title}</span>
                      <Badge
                        variant={
                          claim.verificationStatus === "disputed"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {claim.verificationStatus}
                      </Badge>
                    </div>
                    {claim.organization && (
                      <p className="text-muted-foreground">
                        {claim.organization}{" "}
                        {claim.startDate
                          ? `(${claim.startDate} – ${claim.endDate ?? "Present"})`
                          : ""}
                      </p>
                    )}
                    {claim.conflictDetails && (
                      <p className="text-destructive font-medium">
                        {claim.conflictDetails.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        disabled={isPending}
                        onClick={() => handleConfirmClaim(claim.id)}
                      >
                        <Icons.Check className="size-3" />
                        <span>{isArabic ? "تأكيد وتوثيق" : "Confirm"}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        render={
                          <TurboLink href={pathsConfig.dashboard.user.career} />
                        }
                      >
                        {isArabic ? "فحص" : "Inspect"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "سجل التدقيق الأخير" : "Recent Career Activity"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "سجل شفاف لجميع التغييرات والموافقات."
                  : "Immutable audit trail of profile revisions and application checkpoints."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {data.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="border-l-primary/40 border-l-2 pl-3 text-xs"
                >
                  <p className="font-medium">{item.action}</p>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
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
