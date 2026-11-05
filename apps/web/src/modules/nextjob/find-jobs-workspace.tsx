/* oxlint-disable i18next/no-literal-string */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Card } from "@workspace/ui-web/card";
import { Icons } from "@workspace/ui-web/icons";
import { Input } from "@workspace/ui-web/input";
import { Skeleton } from "@workspace/ui-web/skeleton";

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
  const [eligibilityFilter] = useState<string>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [includeDuplicates] = useState(false);
  const [includeExpired] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialJobs[0]?.id ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const isArabic = locale === "ar";
  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? jobs[0];

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
        if (
          data.jobs.length > 0 &&
          !data.jobs.some((j) => j.id === selectedJobId)
        ) {
          setSelectedJobId(data.jobs[0]?.id ?? null);
        }
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
        };
        setBannerMessage(
          isArabic
            ? `تمت مزامنة المصادر (${syncResult.syncedSource}): إجمالي ${syncResult.totalCatalogCount} وظيفة.`
            : `Synced ${syncResult.syncedSource}: ${syncResult.totalCatalogCount} active opportunities in catalog.`,
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
        const result = (await res.json()) as { isDuplicate: boolean };
        setBannerMessage(
          result.isDuplicate
            ? isArabic
              ? "يوجد طلب نشط بالفعل لهذه الوظيفة في مسار الطلبات."
              : "Application already in pipeline. Check Applications workspace."
            : isArabic
              ? "تم إعداد مسودة السيرة المخصصة والطلب بنجاح! جاهز للمراجعة في الطلبات."
              : "Tailored CV draft ready for your review in Applications.",
        );
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-16">
      {/* Clean Header */}
      <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {isArabic ? "الوظائف المتاحة" : "Find Jobs"}
            </h1>
            <Badge
              variant="outline"
              className="font-mono text-[11px] font-normal"
            >
              <span className="tabular-nums">{jobs.length}</span>{" "}
              {isArabic ? "فرصة" : "roles"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {isArabic
              ? "فرص موثوقة ومطابقة لملفك المهني مع حساب الملاءمة بالأدلة."
              : "Curated roles matching your verified career profile and preferences."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={handleSyncSources}
            className="h-8 cursor-pointer text-xs"
          >
            <Icons.Globe2 className="size-3.5" />
            <span>{isArabic ? "مزامنة المصادر" : "Sync Feeds"}</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 cursor-pointer text-xs"
            render={
              <TurboLink href={pathsConfig.dashboard.user.applications} />
            }
          >
            <Icons.FileText className="size-3.5" />
            <span>{isArabic ? "الطلبات" : "Applications"}</span>
          </Button>
        </div>
      </div>

      {bannerMessage && (
        <div
          role="status"
          className="bg-muted/40 border-border/80 text-foreground flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-xs shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Icons.Info className="text-primary size-4 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-[11px]"
              render={
                <TurboLink href={pathsConfig.dashboard.user.applications} />
              }
            >
              {isArabic ? "عرض الطلبات" : "View Pipeline"}
            </Button>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close"
            >
              <Icons.X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Super Minimal Search & Filter Bar */}
      <div className="bg-card border-border/60 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Icons.Search className="text-muted-foreground/60 absolute start-3 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void fetchFilteredJobs({ search });
              }
            }}
            className="placeholder:text-muted-foreground/60 h-8 border-0 bg-transparent ps-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={
              isArabic
                ? "ابحث بالمسمى أو الشركة أو المهارة..."
                : "Search by title, company, or stack (e.g. React, Next.js, Cloud)..."
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t pt-2 sm:border-t-0 sm:pt-0">
          {(
            [
              { id: "all", labelEn: "All", labelAr: "الكل" },
              { id: "remote", labelEn: "Remote", labelAr: "عن بُعد" },
              { id: "hybrid", labelEn: "Hybrid", labelAr: "هجين" },
              { id: "on-site", labelEn: "On-site", labelAr: "حضوري" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setWorkModeFilter(mode.id);
                void fetchFilteredJobs({ workMode: mode.id });
              }}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                workModeFilter === mode.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {isArabic ? mode.labelAr : mode.labelEn}
            </button>
          ))}

          <span className="text-muted-foreground/40 mx-1">|</span>

          <button
            type="button"
            onClick={() => {
              const next = !savedOnly;
              setSavedOnly(next);
              void fetchFilteredJobs({ savedOnly: next });
            }}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              savedOnly
                ? "font-semibold text-amber-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icons.Star
              className={`size-3 ${savedOnly ? "fill-amber-500" : ""}`}
            />
            <span>{isArabic ? "محفوظة" : "Saved"}</span>
          </button>
        </div>
      </div>

      {/* Master-Detail Explorer */}
      {jobs.length === 0 ? (
        <div className="bg-card border-border/60 space-y-2 rounded-xl border py-16 text-center">
          <Icons.Briefcase className="text-muted-foreground/40 mx-auto size-8" />
          <h3 className="text-foreground text-sm font-semibold">
            {isArabic ? "لا توجد نتائج مطابقة" : "No matching jobs found"}
          </h3>
          <p className="text-muted-foreground mx-auto max-w-xs text-xs">
            {isArabic
              ? "جرّب تغيير كلمات البحث أو تصفية نمط العمل."
              : "Try clearing filters or syncing permitted feeds."}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 text-xs"
            onClick={() => {
              setSearch("");
              setWorkModeFilter("all");
              void fetchFilteredJobs({
                search: "",
                workMode: "all",
                savedOnly: false,
              });
            }}
          >
            {isArabic ? "إعادة الضبط" : "Reset Filters"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left Column: Job Cards List (Master) */}
          <div className="flex flex-col gap-2 lg:col-span-5">
            <div className="flex flex-col gap-1.5">
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isFitHigh = job.overallScore >= 80;

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedJobId(job.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`group relative flex cursor-pointer flex-col rounded-xl border p-3.5 text-start transition-all duration-150 ${
                      isSelected
                        ? "border-foreground/40 bg-accent/40 shadow-2xs"
                        : "border-border/60 bg-card hover:border-border hover:bg-accent/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground truncate text-sm font-medium">
                            {job.title}
                          </span>
                          {job.isSaved && (
                            <Icons.Star className="size-3 shrink-0 fill-amber-500 text-amber-500" />
                          )}
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {job.company} • {job.location}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                          isFitHigh
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {job.overallScore}%
                      </span>
                    </div>

                    <div className="text-muted-foreground mt-2.5 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="capitalize">{job.workMode}</span>
                        <span>•</span>
                        <span className="text-muted-foreground/80 truncate font-mono text-[10px]">
                          {job.sourceName}
                        </span>
                      </div>
                      {job.salaryMin && job.salaryMax && (
                        <span className="shrink-0 ps-1 font-mono tabular-nums">
                          {job.salaryCurrency ?? "$"}
                          {job.salaryMin.toLocaleString()} -{" "}
                          {job.salaryMax.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Clean Detail Inspector */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="bg-card border-border/60 sticky top-4 space-y-5 rounded-xl border p-5 shadow-2xs">
                {/* Header with Title and Primary Actions */}
                <div className="space-y-3 border-b pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-foreground text-lg font-semibold">
                          {selectedJob.title}
                        </h2>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                          {selectedJob.overallScore}%{" "}
                          {isArabic ? "توافق" : "Match"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        <span className="text-foreground font-medium">
                          {selectedJob.company}
                        </span>
                        {" • "}
                        <span>{selectedJob.location}</span>
                        {" • "}
                        <span className="capitalize">
                          {selectedJob.workMode}
                        </span>
                        {selectedJob.salaryMin && selectedJob.salaryMax && (
                          <>
                            {" • "}
                            <span className="text-foreground font-mono tabular-nums">
                              {selectedJob.salaryCurrency ?? "$"}
                              {selectedJob.salaryMin.toLocaleString()} -{" "}
                              {selectedJob.salaryMax.toLocaleString()}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={selectedJob.isSaved ? "secondary" : "outline"}
                        className="h-8 cursor-pointer text-xs"
                        onClick={() => void handleToggleSave(selectedJob.id)}
                      >
                        <Icons.Star
                          className={`size-3.5 ${selectedJob.isSaved ? "fill-amber-500 text-amber-500" : ""}`}
                        />
                        <span>
                          {selectedJob.isSaved
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
                        disabled={isLoading || selectedJob.status === "expired"}
                        onClick={() =>
                          void handlePrepareApplication(selectedJob.id)
                        }
                        className="h-8 cursor-pointer text-xs shadow-xs"
                      >
                        <Icons.Check className="size-3.5" />
                        <span>
                          {isArabic ? "تخصيص والتقديم" : "Tailor & Apply"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Match Analysis: Strengths & Gaps in Linear Style */}
                <div className="space-y-3">
                  <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {isArabic ? "تحليل الملاءمة المفسر" : "Fit Breakdown"}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="bg-muted/20 border-border/40 space-y-1.5 rounded-lg border p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <Icons.CheckCircle2 className="size-3.5" />
                        <span>
                          {isArabic ? "أسباب التوافق" : "Key Strengths"}
                        </span>
                      </div>
                      <ul className="text-muted-foreground list-disc space-y-1 ps-4 text-[11px] leading-relaxed">
                        {selectedJob.fitAnalysis.whyMatches
                          .slice(0, 3)
                          .map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                      </ul>
                    </div>

                    <div className="bg-muted/20 border-border/40 space-y-1.5 rounded-lg border p-3 text-xs">
                      <div className="text-foreground flex items-center gap-1.5 font-medium">
                        <Icons.BadgeCheck className="size-3.5 text-blue-500" />
                        <span>
                          {isArabic
                            ? "المتطلبات المستوفاة"
                            : "Requirements Met"}
                        </span>
                      </div>
                      <ul className="text-muted-foreground list-disc space-y-1 ps-4 text-[11px] leading-relaxed">
                        {selectedJob.fitAnalysis.requirementsMet
                          .slice(0, 3)
                          .map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  {selectedJob.fitAnalysis.missingRequired.length > 0 && (
                    <div className="bg-destructive/5 border-destructive/20 rounded-lg border p-3 text-xs">
                      <span className="text-destructive font-medium">
                        {isArabic
                          ? "متطلبات أساسية غير مؤكدة:"
                          : "Missing Required Skills:"}
                      </span>
                      <ul className="text-destructive/80 mt-1 list-disc space-y-0.5 ps-4 text-[11px]">
                        {selectedJob.fitAnalysis.missingRequired.map(
                          (gap, i) => (
                            <li key={i}>{gap}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5 border-t pt-4">
                  <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {isArabic ? "الوصف الوظيفي" : "Role Overview"}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Attribution Link */}
                <div className="text-muted-foreground flex items-center justify-between border-t pt-3 text-[11px]">
                  <span>
                    {isArabic ? "المصدر:" : "Source:"} {selectedJob.sourceName}
                  </span>
                  <a
                    href={selectedJob.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    <span>
                      {isArabic ? "فتح إعلان المصدر" : "Original Posting"}
                    </span>
                    <Icons.ArrowUpRight className="size-3" />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export const FindJobsWorkspaceSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
            <Skeleton className="mt-4 h-16 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
};
