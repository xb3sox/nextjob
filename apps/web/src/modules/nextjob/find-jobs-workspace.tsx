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

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

import type { jobWithFitSchema } from "@workspace/api/schema";
import type * as z from "zod";

type JobWithFit = z.infer<typeof jobWithFitSchema>;

interface FindJobsWorkspaceProps {
  readonly initialJobs: JobWithFit[];
  readonly locale: string;
}

export const FindJobsWorkspace = ({
  initialJobs,
  locale,
}: FindJobsWorkspaceProps) => {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithFit[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState<string>("all");
  const [eligibilityFilter, setEligibilityFilter] = useState<string>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(
    initialJobs[0]?.id ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const isArabic = locale === "ar";

  const fetchFilteredJobs = async (overrides?: {
    search?: string;
    workMode?: string;
    eligibility?: string;
    savedOnly?: boolean;
    includeDuplicates?: boolean;
    includeExpired?: boolean;
  }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: overrides?.search ?? search,
        workMode: overrides?.workMode ?? workModeFilter,
        eligibility: overrides?.eligibility ?? eligibilityFilter,
        savedOnly: String(overrides?.savedOnly ?? savedOnly),
        includeDuplicates: String(
          overrides?.includeDuplicates ?? includeDuplicates,
        ),
        includeExpired: String(overrides?.includeExpired ?? includeExpired),
      });
      const res = await fetch(`/api/nextjob/jobs?${params.toString()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { jobs: JobWithFit[] };
        setJobs(data.jobs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncSources = async () => {
    setIsLoading(true);
    setBannerMessage(null);
    try {
      const res = await fetch("/api/nextjob/jobs/sync", { method: "POST" });
      if (res.ok) {
        const syncResult = (await res.json()) as {
          syncedSource: string;
          addedCount: number;
          totalCatalogCount: number;
          mode: string;
        };
        setBannerMessage(
          isArabic
            ? `تمت مزامنة المصادر (${syncResult.syncedSource}) — إجمالي الوظائف: ${syncResult.totalCatalogCount}.`
            : `Synced ${syncResult.syncedSource} (${syncResult.addedCount} new, ${syncResult.totalCatalogCount} total catalog listings).`,
        );
        await fetchFilteredJobs();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (jobId: string) => {
    const res = await fetch("/api/nextjob/jobs/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    if (res.ok) {
      await fetchFilteredJobs();
    }
  };

  const handlePrepareApplication = async (jobId: string) => {
    setIsLoading(true);
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
        const result = (await res.json()) as {
          isDuplicate: boolean;
        };
        setBannerMessage(
          result.isDuplicate
            ? isArabic
              ? "يوجد طلب نشط بالفعل لهذه الوظيفة. يمكنك مراجعته في صفحة الطلبات."
              : "An active application already exists for this job. Opening Applications pipeline..."
            : isArabic
              ? "تم توليد سيرة ذاتية مخصصة مقيدة بالأدلة وإضافتها إلى الطلبات للمراجعة."
              : "Evidence-constrained tailored CV prepared! Review and approve it in Applications.",
        );
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isArabic
              ? "البحث عن وظائف وتحليل الملاءمة"
              : "Find Jobs & Fit Analysis"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isArabic
              ? "اكتشف الوظائف من المصادر المسموح بها مع إزالة التكرار وتحليل الأهلية والملاءمة من 5 أسئلة."
              : "Permitted public job feeds with SHA-256 deduplication, hard eligibility verification, and 5-question explainable fit."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={handleSyncSources}
          >
            <Icons.Globe2 className="size-4" />
            <span>
              {isArabic ? "مزامنة مصادر الوظائف" : "Sync Permitted Sources"}
            </span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            render={
              <TurboLink href={pathsConfig.dashboard.user.applications} />
            }
          >
            <span>{isArabic ? "عرض الطلبات" : "View Applications"}</span>
          </Button>
        </div>
      </div>

      {bannerMessage && (
        <div
          role="status"
          className="border-primary/30 bg-primary/10 flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
        >
          <span>{bannerMessage}</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              render={
                <TurboLink href={pathsConfig.dashboard.user.applications} />
              }
            >
              {isArabic ? "الانتقال إلى الطلبات" : "Go to Applications"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBannerMessage(null)}
            >
              <Icons.X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void fetchFilteredJobs({ search });
                  }
                }}
                placeholder={
                  isArabic
                    ? "ابحث بالمسمى الوظيفي، الشركة، أو المهارة (مثل TypeScript، Next.js)..."
                    : "Search by role, company, or skill (e.g. TypeScript, Next.js, AI)..."
                }
                aria-label="Search jobs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by work mode"
                value={workModeFilter}
                onChange={(e) => {
                  setWorkModeFilter(e.target.value);
                  void fetchFilteredJobs({ workMode: e.target.value });
                }}
                className="bg-background border-input h-9 rounded-md border px-3 text-xs"
              >
                <option value="all">
                  {isArabic ? "جميع أنماط العمل" : "All Work Modes"}
                </option>
                <option value="remote">
                  {isArabic ? "عن بُعد (Remote)" : "Remote"}
                </option>
                <option value="hybrid">
                  {isArabic ? "هجين (Hybrid)" : "Hybrid"}
                </option>
                <option value="on-site">
                  {isArabic ? "حضوري (On-site)" : "On-site"}
                </option>
              </select>

              <select
                aria-label="Filter by eligibility"
                value={eligibilityFilter}
                onChange={(e) => {
                  setEligibilityFilter(e.target.value);
                  void fetchFilteredJobs({ eligibility: e.target.value });
                }}
                className="bg-background border-input h-9 rounded-md border px-3 text-xs"
              >
                <option value="all">
                  {isArabic ? "جميع حالات الأهلية" : "All Eligibility"}
                </option>
                <option value="eligible">
                  {isArabic ? "مؤهل (Eligible)" : "Eligible Only"}
                </option>
                <option value="ineligible">
                  {isArabic ? "غير مؤهل (Ineligible)" : "Ineligible"}
                </option>
                <option value="unknown">
                  {isArabic ? "غير محدد (Unknown)" : "Unknown"}
                </option>
              </select>

              <Button
                size="sm"
                variant={savedOnly ? "default" : "outline"}
                onClick={() => {
                  const next = !savedOnly;
                  setSavedOnly(next);
                  void fetchFilteredJobs({ savedOnly: next });
                }}
              >
                <Icons.Star className="size-3.5" />
                <span>{isArabic ? "المحفوظة" : "Saved"}</span>
              </Button>

              <Button
                size="sm"
                variant={includeDuplicates ? "default" : "outline"}
                onClick={() => {
                  const next = !includeDuplicates;
                  setIncludeDuplicates(next);
                  void fetchFilteredJobs({ includeDuplicates: next });
                }}
              >
                <span>
                  {isArabic ? "إظهار المكررة" : "Show Cross-Posted Duplicates"}
                </span>
              </Button>

              <Button
                size="sm"
                variant={includeExpired ? "default" : "outline"}
                onClick={() => {
                  const next = !includeExpired;
                  setIncludeExpired(next);
                  void fetchFilteredJobs({ includeExpired: next });
                }}
              >
                <span>{isArabic ? "إظهار المنتهية" : "Show Expired"}</span>
              </Button>

              <Button
                size="sm"
                onClick={() => void fetchFilteredJobs()}
                disabled={isLoading}
              >
                <Icons.Search className="size-3.5" />
                <span>{isArabic ? "تطبيق" : "Search"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings with 5-Question Fit Analysis */}
      <div className="flex flex-col gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                {isArabic
                  ? "لم يتم العثور على وظائف تطابق عوامل التصفية المحددة."
                  : "No job listings match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const isExpanded = expandedJobId === job.id;
            return (
              <Card
                key={job.id}
                className={
                  job.status === "expired"
                    ? "border-dashed opacity-80"
                    : job.eligibilityStatus === "ineligible"
                      ? "border-destructive/30"
                      : ""
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <Badge
                          variant={
                            job.overallScore >= 80
                              ? "default"
                              : job.overallScore >= 60
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {job.overallScore}% {isArabic ? "ملاءمة" : "Fit Score"}
                        </Badge>
                        <Badge
                          variant={
                            job.eligibilityStatus === "eligible"
                              ? "secondary"
                              : job.eligibilityStatus === "ineligible"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {job.eligibilityStatus === "eligible"
                            ? isArabic
                              ? "مؤهل"
                              : "Eligible"
                            : job.eligibilityStatus === "ineligible"
                              ? isArabic
                                ? "غير مؤهل"
                                : "Ineligible"
                              : isArabic
                                ? "أهلية غير مؤكدة"
                                : "Eligibility Unknown"}
                        </Badge>
                        {job.status === "expired" && (
                          <Badge variant="destructive">
                            {isArabic ? "منتهية الصلاحية" : "Expired Listing"}
                          </Badge>
                        )}
                        {job.canonicalJobId && (
                          <Badge variant="outline">
                            {isArabic
                              ? `مكررة من ${job.canonicalJobId}`
                              : `Duplicate of ${job.canonicalJobId}`}
                          </Badge>
                        )}
                        {!job.canonicalJobId &&
                          job.duplicateOfIds.length > 0 && (
                            <Badge variant="outline">
                              {isArabic
                                ? `تم دمج ${job.duplicateOfIds.length} إعلان مكرر`
                                : `Deduplicated (${job.duplicateOfIds.length} duplicate merged)`}
                            </Badge>
                          )}
                      </div>

                      <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-foreground font-medium">
                          {job.company}
                        </span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="capitalize">{job.workMode}</span>
                        <span>•</span>
                        <span>
                          {job.salaryMin && job.salaryMax
                            ? `${job.salaryCurrency ?? "USD"} ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}`
                            : "Salary not listed"}
                        </span>
                        <span>•</span>
                        <span>
                          {isArabic ? "المصدر:" : "Source:"} {job.sourceName} (
                          {isArabic ? "حداثة" : "Freshness"}{" "}
                          {job.freshnessScore}%)
                        </span>
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant={job.isSaved ? "secondary" : "outline"}
                        onClick={() => void handleToggleSave(job.id)}
                      >
                        <Icons.Star className="size-3.5" />
                        <span>
                          {job.isSaved
                            ? isArabic
                              ? "محفوظة"
                              : "Saved"
                            : isArabic
                              ? "حفظ"
                              : "Save"}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setExpandedJobId(isExpanded ? null : job.id)
                        }
                      >
                        <span>
                          {isExpanded
                            ? isArabic
                              ? "إخفاء تحليل الملاءمة"
                              : "Hide 5-Question Analysis"
                            : isArabic
                              ? "عرض تحليل الملاءمة (5 أسئلة)"
                              : "Inspect 5-Question Fit"}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        disabled={isLoading || job.status === "expired"}
                        onClick={() => void handlePrepareApplication(job.id)}
                      >
                        <Icons.Check className="size-3.5" />
                        <span>
                          {isArabic
                            ? "تخصيص السيرة والتقديم"
                            : "Tailor CV & Prepare"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {job.description}
                  </p>

                  {/* 5 Mandatory Job Fit Questions (Section 5.2) */}
                  {isExpanded && (
                    <div className="bg-muted/30 grid gap-4 rounded-xl border p-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Question 1: Why does this match me? */}
                      <div className="bg-background space-y-2 rounded-lg border p-3">
                        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
                          <Icons.CheckCircle2 className="text-primary size-4" />
                          <span>
                            {isArabic
                              ? "1. لماذا تناسبني هذه الوظيفة؟"
                              : "1. Why does this match me?"}
                          </span>
                        </h3>
                        <ul className="space-y-1 text-xs">
                          {job.fitAnalysis.whyMatches.map((reason, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              • {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Question 2: What requirements do I meet? */}
                      <div className="bg-background space-y-2 rounded-lg border p-3">
                        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
                          <Icons.BadgeCheck className="size-4 text-emerald-600" />
                          <span>
                            {isArabic
                              ? "2. ما المتطلبات التي أستوفيها؟"
                              : "2. What requirements do I meet?"}
                          </span>
                        </h3>
                        <ul className="space-y-1 text-xs">
                          {job.fitAnalysis.requirementsMet.map((req, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              {`✓ ${req}`}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Question 3: What am I missing? (Required vs Preferred gaps) */}
                      <div className="bg-background space-y-2 rounded-lg border p-3">
                        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
                          <Icons.AlertTriangle className="size-4 text-amber-500" />
                          <span>
                            {isArabic
                              ? "3. ما الذي ينقصني؟ (إلزامي مقابل مفضل)"
                              : "3. What am I missing?"}
                          </span>
                        </h3>
                        {job.fitAnalysis.missingRequired.length === 0 &&
                        job.fitAnalysis.missingPreferred.length === 0 ? (
                          <p className="text-xs text-emerald-600">
                            {isArabic
                              ? "لا توجد فجوات مهارية؛ أنت تستوفي جميع المتطلبات الأساسية والمفضلة."
                              : "Zero skill or eligibility gaps detected against your verified profile."}
                          </p>
                        ) : (
                          <div className="space-y-2 text-xs">
                            {job.fitAnalysis.missingRequired.length > 0 && (
                              <div>
                                <span className="text-destructive font-semibold">
                                  {isArabic
                                    ? "متطلبات أساسية مفقودة:"
                                    : "Required Gaps:"}
                                </span>
                                <ul className="mt-0.5 space-y-0.5">
                                  {job.fitAnalysis.missingRequired.map(
                                    (gap, idx) => (
                                      <li
                                        key={idx}
                                        className="text-destructive"
                                      >
                                        • {gap}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                            {job.fitAnalysis.missingPreferred.length > 0 && (
                              <div>
                                <span className="font-semibold text-amber-600">
                                  {isArabic
                                    ? "مهارات مفضلة (غير إلزامية):"
                                    : "Preferred (Non-blocking) Gaps:"}
                                </span>
                                <ul className="mt-0.5 space-y-0.5">
                                  {job.fitAnalysis.missingPreferred.map(
                                    (gap, idx) => (
                                      <li
                                        key={idx}
                                        className="text-muted-foreground"
                                      >
                                        • {gap}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Question 4: Is the opportunity credible? */}
                      <div className="bg-background space-y-2 rounded-lg border p-3">
                        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
                          <Icons.Info className="size-4 text-blue-500" />
                          <span>
                            {isArabic
                              ? "4. هل الفرصة موثوقة؟"
                              : "4. Is the opportunity credible?"}
                          </span>
                        </h3>
                        <ul className="space-y-1 text-xs">
                          {job.fitAnalysis.credibility.signals.map(
                            (sig, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                • {sig}
                              </li>
                            ),
                          )}
                        </ul>
                        <a
                          href={
                            job.fitAnalysis.credibility.sourceAttributionUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        >
                          <span>
                            {isArabic
                              ? "رابط المصدر الأصلي"
                              : "Original Source Attribution"}
                          </span>
                          <Icons.ArrowUpRight className="size-3" />
                        </a>
                      </div>

                      {/* Question 5: What happens when I apply? */}
                      <div className="bg-background space-y-2 rounded-lg border p-3 md:col-span-2">
                        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
                          <Icons.Lock className="text-primary size-4" />
                          <span>
                            {isArabic
                              ? "5. ماذا يحدث عندما أتقدم للوظيفة؟"
                              : "5. What happens when I apply?"}
                          </span>
                        </h3>
                        <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
                          {job.fitAnalysis.applicationProcess.steps.map(
                            (step, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                {step}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
