/* oxlint-disable i18next/no-literal-string */
import { Badge } from "@workspace/ui-web/badge";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { TurboLink } from "~/modules/common/turbo-link";
import {
  Section,
  SectionBadge,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "~/modules/marketing/layout/section";

export const Features = async () => {
  const { t, i18n } = await getTranslation({ ns: "marketing" });
  const isArabic = i18n.language === "ar";

  return (
    <Section id="features" className="gap-8 sm:gap-12 md:gap-16">
      <SectionHeader>
        <SectionBadge>{t("features.label")}</SectionBadge>
        <SectionTitle>{t("features.title")}</SectionTitle>
        <SectionDescription>{t("features.description")}</SectionDescription>
      </SectionHeader>

      {/* Bento Grid Layout matching 4 Core Commercial Pillars */}
      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-12">
        {/* Pillar 1: Visual Diff Studio (Spans 7 cols on desktop) */}
        <div className="flex md:col-span-7">
          <div className="bg-card/90 hover:border-primary/40 border-border/60 group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-xs transition-all duration-300 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-primary/5 font-mono text-xs"
                >
                  {isArabic
                    ? "الركيزة 1: شفافية التدقيق"
                    : "Pillar 1: Auditable AI"}
                </Badge>
                <Icons.FileText className="text-primary size-5" />
              </div>

              <h3 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                {t("features.feature.core.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("features.feature.core.description")}
              </p>

              {/* Visual Diff Mockup Artifact */}
              <div className="border-border/60 bg-muted/20 mt-6 overflow-hidden rounded-xl border font-mono text-xs">
                <div className="bg-muted/40 border-border/50 text-muted-foreground flex items-center justify-between border-b px-3.5 py-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-foreground font-medium">
                      resume-diff-preview.pdf
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {isArabic
                      ? "مراجعة الفروقات نشطة"
                      : "Word-Level Diff Active"}
                  </span>
                </div>
                <div className="space-y-2 p-3.5 text-[11px] sm:text-xs">
                  <div className="bg-destructive/10 border-destructive/20 text-destructive rounded border p-2">
                    <span className="me-1 font-bold">-</span>
                    <span className="line-through">
                      {isArabic
                        ? "إدارة خدمات سحابية وبناء خطوط أنابيب CI/CD عادية للأنظمة."
                        : "Managed standard cloud services and built basic CI/CD pipelines for backend."}
                    </span>
                  </div>
                  <div className="text-foreground rounded border border-emerald-500/20 bg-emerald-500/10 p-2">
                    <span className="me-1 font-bold text-emerald-600 dark:text-emerald-400">
                      +
                    </span>
                    <span>
                      {isArabic
                        ? "هندسة خطوط GitOps على كوبرنيتيز عبر 3 مناطق جغرافية بنسبة استقرار 99.99% وخفض التأخير بنسبة 42% [إثبات #104]."
                        : "Architected multi-region GitOps on AWS EKS with 99.99% uptime, cutting API p99 latency by 42% [Claim #104]."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground font-mono text-xs">
                {isArabic
                  ? "فروقات دقيقة كلمة بكلمة"
                  : "Exact red/green word diffs"}
              </span>
              <TurboLink
                href={pathsConfig.dashboard.user.career}
                className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold group-hover:underline"
              >
                <span>
                  {isArabic ? "فتح استوديو الفروقات" : "Open Diff Studio"}
                </span>
                <Icons.ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </TurboLink>
            </div>
          </div>
        </div>

        {/* Pillar 2: Zero-Fabrication Engine (Spans 5 cols on desktop) */}
        <div className="flex md:col-span-5">
          <div className="bg-card/90 border-border/60 group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-xs transition-all duration-300 hover:border-emerald-500/40 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/5 font-mono text-xs text-emerald-600 dark:text-emerald-400"
                >
                  {isArabic
                    ? "الركيزة 2: إثبات تشفيري"
                    : "Pillar 2: Cryptographic Truth"}
                </Badge>
                <Icons.ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h3 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                {t("features.feature.ai.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("features.feature.ai.description")}
              </p>

              {/* Cryptographic Proof Card */}
              <div className="mt-6 space-y-2.5">
                <div className="bg-muted/30 border-border/50 space-y-2 rounded-xl border p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {isArabic ? "بوابة الأمان:" : "Safety Gate:"}
                    </span>
                    <Badge
                      variant="default"
                      className="bg-emerald-600 font-mono text-[10px]"
                    >
                      {isArabic ? "اجتياز 100%" : "PASSED (1.00)"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground truncate font-mono text-[11px]">
                    SHA-256: 8f9c2d7e4b1a3c5f...
                  </div>
                </div>

                <ul className="text-muted-foreground space-y-1.5 text-xs font-medium">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isArabic
                        ? "استخدام الحقائق الموثقة فقط (ثقة >= 0.80)"
                        : "Only verified claims (confidence >= 0.80)"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isArabic
                        ? "قفل أسماء الشركات والتواريخ رسمياً"
                        : "Exact employer names & dates locked"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isArabic
                        ? "حظر أي مهارة غير مدعومة بدليل"
                        : "Zero ungrounded hallucinations"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground font-mono text-xs">
                {isArabic ? "إثباتات مشفرة" : "Payload-bound proof"}
              </span>
              <TurboLink
                href={pathsConfig.dashboard.user.career}
                className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold group-hover:underline"
              >
                <span>{isArabic ? "عرض سجل الحقائق" : "Verify Claims"}</span>
                <Icons.ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </TurboLink>
            </div>
          </div>
        </div>

        {/* Pillar 3: Live ATS Career Page Monitoring (Spans 5 cols on desktop) */}
        <div className="flex md:col-span-5">
          <div className="bg-card/90 border-border/60 group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-xs transition-all duration-300 hover:border-blue-500/40 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-blue-500/30 bg-blue-500/5 font-mono text-xs text-blue-600 dark:text-blue-400"
                >
                  {isArabic
                    ? "الركيزة 3: رصد ATS فوري"
                    : "Pillar 3: Direct ATS Feeds"}
                </Badge>
                <Icons.Briefcase className="size-5 text-blue-600 dark:text-blue-400" />
              </div>

              <h3 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                {t("features.feature.mobile.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("features.feature.mobile.description")}
              </p>

              {/* Live ATS Platform Grid */}
              <div className="mt-6 grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="bg-muted/30 border-border/50 rounded-lg border p-2.5">
                  <div className="text-foreground flex items-center gap-1.5 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>Ashby Direct</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {isArabic ? "تحديث فوري < 60ث" : "Feed sync < 60s"}
                  </span>
                </div>
                <div className="bg-muted/30 border-border/50 rounded-lg border p-2.5">
                  <div className="text-foreground flex items-center gap-1.5 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>Greenhouse</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {isArabic ? "ربط برمجى مباشر" : "Direct API parser"}
                  </span>
                </div>
                <div className="bg-muted/30 border-border/50 rounded-lg border p-2.5">
                  <div className="text-foreground flex items-center gap-1.5 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>Lever Direct</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {isArabic ? "إزالة التكرار" : "De-duplicated"}
                  </span>
                </div>
                <div className="bg-muted/30 border-border/50 rounded-lg border p-2.5">
                  <div className="text-foreground flex items-center gap-1.5 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>Workday</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {isArabic ? "أتمتة متعددة الخطوات" : "Multi-step mapper"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground font-mono text-xs">
                {isArabic
                  ? "15 دقيقة قبل المواقع الأخرى"
                  : "15m before aggregators"}
              </span>
              <TurboLink
                href={pathsConfig.dashboard.user.jobs}
                className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold group-hover:underline"
              >
                <span>
                  {isArabic ? "استكشاف الوظائف المباشرة" : "Browse Live Feeds"}
                </span>
                <Icons.ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </TurboLink>
            </div>
          </div>
        </div>

        {/* Pillar 4: Bounded Auto-Apply Engine (Spans 7 cols on desktop) */}
        <div className="flex md:col-span-7">
          <div className="bg-card/90 border-border/60 group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-xs transition-all duration-300 hover:border-amber-500/40 sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/5 font-mono text-xs text-amber-600 dark:text-amber-400"
                >
                  {isArabic
                    ? "الركيزة 4: أتمتة منضبطة وآمنة"
                    : "Pillar 4: Safe Bounded Autonomy"}
                </Badge>
                <Icons.BadgeCheck className="size-5 text-amber-600 dark:text-amber-400" />
              </div>

              <h3 className="text-foreground mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                {t("features.feature.extension.title")}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                {t("features.feature.extension.description")}
              </p>

              {/* Bounded Controls Console */}
              <div className="border-border/60 bg-muted/20 mt-6 space-y-3 rounded-xl border p-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <div className="text-muted-foreground flex justify-between">
                    <span>
                      {isArabic
                        ? "الحد اليومي المطبق:"
                        : "Daily Application Budget:"}
                    </span>
                    <span className="text-foreground font-semibold">
                      18 / 25 applied
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: "72%" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-card/70 border-border/40 rounded border p-2 text-[11px]">
                    <span className="text-muted-foreground block">
                      {isArabic ? "عتبة الملاءمة:" : "Fit Threshold:"}
                    </span>
                    <span className="text-foreground font-bold">
                      &gt;= 85% Match
                    </span>
                  </div>
                  <div className="bg-card/70 border-border/40 rounded border p-2 text-[11px]">
                    <span className="text-muted-foreground block">
                      {isArabic ? "بوابة الأمان:" : "Human Gate:"}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {isArabic ? "إيقاف عند الغموض" : "Pause on Ambiguity"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border/40 mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground font-mono text-xs">
                {isArabic
                  ? "إيصالات مؤكدة وواضحة"
                  : "No spam, confirmed receipts"}
              </span>
              <TurboLink
                href={pathsConfig.dashboard.user.applications}
                className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold group-hover:underline"
              >
                <span>
                  {isArabic ? "مراجعة لوحة الطلبات" : "Manage Applications"}
                </span>
                <Icons.ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </TurboLink>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
