/* oxlint-disable i18next/no-literal-string */
"use client";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { useBreakpoint } from "@workspace/ui-web";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui-web/avatar";
import { Icons } from "@workspace/ui-web/icons";
import { Marquee } from "@workspace/ui-web/marquee";

import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionBadge,
  SectionTitle,
} from "~/modules/marketing/layout/section";

const reviews = [
  {
    name: "testimonials.reviews.jack.name",
    body: "testimonials.reviews.jack.body",
    img: "https://avatar.vercel.sh/jack",
    position: "testimonials.reviews.jack.position",
    tag: "Truth Ledger",
  },
  {
    name: "testimonials.reviews.jill.name",
    body: "testimonials.reviews.jill.body",
    img: "https://avatar.vercel.sh/jill",
    position: "testimonials.reviews.jill.position",
    tag: "5-Question Fit",
  },
  {
    name: "testimonials.reviews.john.name",
    body: "testimonials.reviews.john.body",
    img: "https://avatar.vercel.sh/john",
    position: "testimonials.reviews.john.position",
    tag: "Bilingual RTL",
  },
  {
    name: "testimonials.reviews.sarah.name",
    body: "testimonials.reviews.sarah.body",
    img: "https://avatar.vercel.sh/sarah",
    position: "testimonials.reviews.sarah.position",
    tag: "Zero-Fabrication",
  },
  {
    name: "testimonials.reviews.mike.name",
    body: "testimonials.reviews.mike.body",
    img: "https://avatar.vercel.sh/mike",
    position: "testimonials.reviews.mike.position",
    tag: "Approval Gate",
  },
] as const;

type Review = (typeof reviews)[number];

export const Testimonials = () => {
  const { t, i18n } = useTranslation("marketing");
  const isArabic = i18n.language === "ar";
  const isDesktop = useBreakpoint("md");

  const rows = isDesktop
    ? [
        reviews.slice(0, Math.ceil(reviews.length / 2)),
        reviews.slice(Math.ceil(reviews.length / 2)),
      ]
    : [reviews];

  return (
    <Section
      id="testimonials"
      className="gap-10 py-12 sm:py-16 md:py-20 lg:flex-row lg:items-center lg:gap-14"
    >
      <SectionHeader className="grow basis-0 gap-3.5 lg:items-start lg:text-start">
        <SectionBadge>{t("testimonials.label")}</SectionBadge>
        <SectionTitle className="mt-2 lg:text-start">
          {t("testimonials.title")}
        </SectionTitle>
        <SectionDescription className="text-sm leading-relaxed sm:text-base lg:text-start">
          {t("testimonials.description")}
        </SectionDescription>

        {/* Rating row with micro-trust proof */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Icons.Star
                key={index}
                className="size-4 fill-amber-400 text-amber-400 dark:fill-amber-400 dark:text-amber-400"
              />
            ))}
          </div>
          <span className="text-foreground font-mono text-xs font-semibold tabular-nums sm:text-sm">
            {t("testimonials.rating", {
              rating: 4.9,
              count: 120,
            })}
          </span>
        </div>

        <div className="text-muted-foreground mt-2 flex items-center gap-2 font-mono text-xs">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          <span>
            {isArabic
              ? "سجلات تدقيق موثقة بتشفير SHA-256"
              : "SHA-256 cryptographically verified proofs"}
          </span>
        </div>
      </SectionHeader>

      <div className="border-border/40 bg-muted/10 relative flex h-[520px] w-full grow flex-row items-center justify-center overflow-hidden rounded-2xl border p-2 lg:basis-0">
        {rows.map((row, index) => (
          <Marquee
            key={index}
            pauseOnHover
            vertical
            className="px-1 [--duration:24s]"
            reverse={index % 2 !== 0}
          >
            {row.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
        ))}
        {/* Soft edge masking for dark/light */}
        <div className="from-background via-background/80 pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent" />
        <div className="from-background via-background/80 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />
      </div>
    </Section>
  );
};

const ReviewCard = ({ img, name, position, body, tag }: Review) => {
  const { t } = useTranslation("marketing");
  return (
    <figure
      className={cn(
        "bg-card/90 hover:bg-card border-border/60 hover:border-border relative h-full w-full max-w-[340px] cursor-pointer overflow-hidden rounded-2xl border p-4 shadow-xs transition-all duration-200 sm:p-5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar className="border-border/50 size-9 border">
            <AvatarImage src={img} alt={t(name)} />
            <AvatarFallback className="bg-muted text-xs font-semibold uppercase">
              {t(name).slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <figcaption className="text-foreground text-sm font-semibold">
                {t(name)}
              </figcaption>
              <Icons.BadgeCheck className="text-primary size-3.5 shrink-0" />
            </div>
            <p className="text-muted-foreground font-mono text-[11px] leading-tight">
              {t(position)}
            </p>
          </div>
        </div>

        <span className="bg-muted/50 text-muted-foreground border-border/40 rounded-md border px-2 py-0.5 font-mono text-[10px]">
          {tag}
        </span>
      </div>
      <blockquote className="text-muted-foreground mt-3 text-xs leading-relaxed sm:text-sm">
        &ldquo;{t(body)}&rdquo;
      </blockquote>
    </figure>
  );
};
