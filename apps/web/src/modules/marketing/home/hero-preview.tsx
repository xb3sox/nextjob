/* oxlint-disable i18next/no-literal-string */
"use client";

import { useState } from "react";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";

type TabKey = "feed" | "diff" | "fit";

export const HeroPreview = () => {
  const { t, i18n } = useTranslation("marketing");
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [approvedJob2, setApprovedJob2] = useState(false);

  const atsMonitors = [
    {
      name: t("hero.preview.ticker.ashby"),
      latency: "82ms",
      status: "Active",
      parser: "API v2",
    },
    {
      name: t("hero.preview.ticker.greenhouse"),
      latency: "114ms",
      status: "Active",
      parser: "DOM Hook",
    },
    {
      name: t("hero.preview.ticker.lever"),
      latency: "96ms",
      status: "Active",
      parser: "Direct",
    },
    {
      name: t("hero.preview.ticker.workday"),
      latency: "210ms",
      status: "Active",
      parser: "Multi-step",
    },
  ];

  return (
    <div className="relative w-full max-w-5xl">
      {/* Decorative ambient glow backdrop */}
      <div
        className="from-primary/15 via-primary/5 pointer-events-none absolute -inset-1.5 -z-10 rounded-3xl bg-gradient-to-b to-transparent blur-xl transition-all"
        aria-hidden="true"
      />

      {/* Main Console Container */}
      <div className="bg-card/90 border-border/70 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md">
        {/* Top Control Bar: Window controls, Agent Status, and Tabs */}
        <div className="bg-muted/30 border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
          {/* Left: Window Dots & Agent Status */}
          <div className="flex items-center gap-3">
            <div
              className="hidden items-center gap-1.5 sm:flex"
              aria-hidden="true"
            >
              <span className="bg-border size-2.5 rounded-full" />
              <span className="bg-border size-2.5 rounded-full" />
              <span className="bg-border size-2.5 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-xs font-semibold tracking-tight">
                {t("hero.preview.status")}
              </span>
            </div>
            <div className="text-muted-foreground hidden items-center gap-2 font-mono text-[11px] md:flex">
              <span className="bg-border h-3 w-px" />
              <span>{t("hero.preview.cap")}</span>
              <span className="bg-border h-3 w-px" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {t("hero.preview.minMatch")}
              </span>
            </div>
          </div>

          {/* Right: Tab Switcher */}
          <div className="bg-muted/60 border-border/40 flex items-center gap-1 rounded-xl border p-1">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                activeTab === "feed"
                  ? "bg-card text-foreground border-border/50 border shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("hero.preview.tabs.feed")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("diff")}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                activeTab === "diff"
                  ? "bg-card text-foreground border-border/50 border shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("hero.preview.tabs.diff")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fit")}
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                activeTab === "fit"
                  ? "bg-card text-foreground border-border/50 border shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("hero.preview.tabs.fit")}
            </button>
          </div>
        </div>

        {/* Live ATS Detection Ticker Strip */}
        <div className="bg-muted/15 border-border/40 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs sm:px-6">
          <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
            <Icons.Radio className="size-3 animate-pulse text-emerald-500" />
            <span className="text-[10px] font-semibold tracking-wider uppercase">
              {t("hero.preview.ticker.label")}:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] sm:gap-4">
            {atsMonitors.map((ats) => (
              <div
                key={ats.name}
                className="bg-card/60 border-border/40 flex items-center gap-1.5 rounded-md border px-2 py-0.5"
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-foreground font-medium">{ats.name}</span>
                <span className="text-muted-foreground/70 hidden sm:inline">
                  ({ats.parser})
                </span>
                <span className="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                  {ats.latency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Body */}
        <div className="p-4 sm:p-6">
          {/* TAB 1: Autonomous Auto-Apply Feed */}
          {activeTab === "feed" && (
            <div className="space-y-3">
              {/* Job 1: Stripe */}
              <div className="bg-card border-border/60 group rounded-xl border p-3.5 shadow-xs transition-all hover:border-emerald-500/30 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {t("hero.preview.feed.item1Title")}
                        </span>
                        <span className="text-muted-foreground text-xs font-semibold">
                          @{t("hero.preview.feed.item1Company")}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {t("hero.preview.feed.item1Loc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      96% Match
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px]"
                    >
                      Greenhouse ATS
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/30 border-border/40 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Icons.CheckCircle2 className="size-3.5 shrink-0" />
                    <span>{t("hero.preview.feed.item1Status")}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
                    <span>{t("hero.preview.feed.item1Diff")}</span>
                    <span className="bg-border hidden h-3 w-px sm:inline" />
                    <span className="hidden sm:inline">
                      SHA-256: 7f3a...c9e1
                    </span>
                  </div>
                </div>
              </div>

              {/* Job 2: Linear (Awaiting approval gate) */}
              <div className="bg-card border-border/60 group rounded-xl border p-3.5 shadow-xs transition-all hover:border-amber-500/30 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400">
                      L
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {t("hero.preview.feed.item2Title")}
                        </span>
                        <span className="text-muted-foreground text-xs font-semibold">
                          @{t("hero.preview.feed.item2Company")}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {t("hero.preview.feed.item2Loc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      93% Match
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px]"
                    >
                      Ashby Direct
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/30 border-border/40 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {approvedJob2 ? (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <Icons.CheckCircle2 className="size-3.5" />
                        {isArabic
                          ? "تم الاعتماد والتسليم للإرسال ✓"
                          : "Approved & Queued for Delivery ✓"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Icons.Lock className="size-3.5" />
                        {t("hero.preview.feed.item2Status")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!approvedJob2 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveTab("diff")}
                          className="text-primary cursor-pointer text-xs font-medium hover:underline"
                        >
                          {t("hero.preview.feed.item2Inspect")}
                        </button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-6 cursor-pointer px-2.5 text-[11px]"
                          onClick={() => setApprovedJob2(true)}
                        >
                          {t("hero.preview.feed.item2Approve")}
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground font-mono text-[11px]">
                        SHA-256: 4b1c...e89d
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job 3: Vercel */}
              <div className="bg-card border-border/60 group rounded-xl border p-3.5 shadow-xs transition-all hover:border-blue-500/30 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400">
                      V
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {t("hero.preview.feed.item3Title")}
                        </span>
                        <span className="text-muted-foreground text-xs font-semibold">
                          @{t("hero.preview.feed.item3Company")}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {t("hero.preview.feed.item3Loc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 bg-blue-500/5 font-mono text-[10px] text-blue-600 dark:text-blue-400"
                    >
                      89% Match
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px]"
                    >
                      Lever Portal
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/30 border-border/40 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs">
                  <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Icons.BadgeCheck className="size-3.5 shrink-0 text-blue-500" />
                    <span>{t("hero.preview.feed.item3Status")}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
                    <span>{t("hero.preview.feed.item3Diff")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Visual Diff Studio */}
          {activeTab === "diff" && (
            <div className="space-y-4">
              <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h4 className="text-foreground text-sm font-semibold">
                    {t("hero.preview.diff.title")}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {t("hero.preview.diff.company")} •{" "}
                    {t("hero.preview.diff.source")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    {t("hero.preview.diff.confidence")}
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {t("hero.preview.diff.badge")}
                  </Badge>
                </div>
              </div>

              {/* Side-by-side or stacked diff view */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Red Deletion Box */}
                <div className="bg-destructive/5 border-destructive/20 rounded-xl border p-3.5 text-xs">
                  <div className="text-destructive mb-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold">
                    <Icons.Minus className="size-3" />
                    <span>{t("hero.preview.diff.original")}</span>
                  </div>
                  <p className="text-destructive/80 leading-relaxed line-through">
                    Built standard CI/CD pipelines and managed AWS cloud
                    infrastructure for microservices with normal deployment
                    schedules.
                  </p>
                </div>

                {/* Green Addition Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs">
                  <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Icons.Plus className="size-3" />
                    <span>{t("hero.preview.diff.tailored")}</span>
                  </div>
                  <p className="text-foreground leading-relaxed font-normal">
                    Architected zero-downtime GitOps pipelines on{" "}
                    <span className="rounded bg-emerald-500/20 px-1 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                      AWS EKS across 3 regions
                    </span>
                    , reducing p99 API latency by{" "}
                    <span className="rounded bg-emerald-500/20 px-1 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
                      42%
                    </span>{" "}
                    and slashing monthly cloud spend by $180k.
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Icons.ShieldCheck className="size-3" />
                    <span>[Claim #104 Verified • CloudScale Ledger]</span>
                  </div>
                </div>
              </div>

              {/* Diff Summary Bar */}
              <div className="bg-muted/30 border-border/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-xs">
                <div className="text-muted-foreground flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    +28 words
                  </span>
                  <span>/</span>
                  <span className="text-destructive font-medium">
                    -19 words
                  </span>
                  <span className="bg-border mx-1 h-3 w-px" />
                  <span>3 Citations Attached</span>
                </div>
                <div className="text-foreground font-mono text-[11px] font-medium">
                  {t("hero.preview.diff.stats")}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 5-Question Fit */}
          {activeTab === "fit" && (
            <div className="space-y-3">
              <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h4 className="text-foreground text-sm font-semibold">
                    {t("hero.preview.fit.title")}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Ashby Career Feed • Staff Distributed Systems Role
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400"
                >
                  {t("hero.preview.fit.status")}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-muted/30 border-border/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-foreground">
                      {t("hero.preview.fit.q1")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Pass
                  </Badge>
                </div>
                <div className="bg-muted/30 border-border/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-foreground">
                      {t("hero.preview.fit.q2")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Pass
                  </Badge>
                </div>
                <div className="bg-muted/30 border-border/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-foreground">
                      {t("hero.preview.fit.q3")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Pass
                  </Badge>
                </div>
                <div className="bg-muted/30 border-border/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-foreground">
                      {t("hero.preview.fit.q4")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Evidence Verified
                  </Badge>
                </div>
                <div className="bg-muted/30 border-border/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icons.CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-foreground">
                      {t("hero.preview.fit.q5")}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    Pass
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
