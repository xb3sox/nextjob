import { useState } from "react";
import { browser } from "wxt/browser";

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
import { Switch } from "@workspace/ui-web/switch";

export const SidepanelWorkspace = () => {
  const [autofilling, setAutofilling] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [requireReview, setRequireReview] = useState(true);
  const [tailoredPitchCopied, setTailoredPitchCopied] = useState(false);

  const detectedJob = {
    title: "Senior Full-Stack Engineer",
    company: "Stripe",
    ats: "Greenhouse ATS",
    matchScore: 94,
    matchingSkills: [
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "React",
      "AI Agents",
    ],
    gapSkills: ["Ruby on Rails"],
    tailoredPitch:
      "Full-stack engineer with 6+ years shipping high-reliability TypeScript & Next.js systems. Architected zero-fabrication claim verification pipelines and multi-tenant platforms processing high concurrency.",
    receiptDigest:
      "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  };

  const handleAutofill = async () => {
    setAutofilling(true);
    // Simulate ATS detection & content script fill trigger
    try {
      if (typeof browser !== "undefined" && browser.tabs) {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab?.id) {
          await browser.tabs.sendMessage(tab.id, {
            type: "NEXTJOB_TRIGGER_AUTOFILL",
            payload: { requireReview },
          });
        }
      }
    } catch {
      // In dev mode or detached preview
    }

    setTimeout(() => {
      setAutofilling(false);
      setAutofilled(true);
    }, 600);
  };

  const handleCopyPitch = () => {
    void navigator.clipboard.writeText(detectedJob.tailoredPitch);
    setTailoredPitchCopied(true);
    setTimeout(() => setTailoredPitchCopied(false), 2000);
  };

  return (
    <div className="text-foreground flex h-full w-full flex-col gap-4 font-sans text-sm">
      {/* Header Bar */}
      <div className="border-border/40 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-foreground text-background flex h-6 w-6 items-center justify-center rounded-md">
            <span className="text-xs font-bold">NJ</span>
          </div>
          <div>
            <h1 className="text-sm leading-none font-semibold tracking-tight">
              NextJob Copilot
            </h1>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              Zero-Fabrication Job Assistant
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/20 bg-emerald-500/5 px-1.5 py-0.5 text-[10px] text-emerald-500"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {detectedJob.ats}
        </Badge>
      </div>

      {/* Detected Job & Match */}
      <Card className="border-border/60 bg-muted/20 shadow-none">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-medium">
                {detectedJob.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-0.5 text-xs">
                {detectedJob.company} • Remote / Worldwide
              </CardDescription>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {detectedJob.matchScore}%
              </span>
              <p className="text-muted-foreground text-[10px]">Profile Fit</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-3 pt-0">
          <div className="mt-1 flex flex-wrap gap-1">
            {detectedJob.matchingSkills.map((skill) => (
              <span
                key={skill}
                className="bg-muted text-foreground/80 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
              >
                <Icons.Check className="h-2.5 w-2.5 text-emerald-500" />
                {skill}
              </span>
            ))}
            {detectedJob.gapSkills.map((skill) => (
              <span
                key={skill}
                className="bg-muted/40 text-muted-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] line-through"
              >
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety & Action Controls */}
      <div className="flex flex-col gap-2">
        <div className="border-border/50 bg-background flex items-center justify-between rounded-lg border p-2.5">
          <div className="space-y-0.5">
            <label
              htmlFor="require-review-toggle"
              className="text-foreground block cursor-pointer text-xs font-medium"
            >
              Require review before submit
            </label>
            <p className="text-muted-foreground text-[11px]">
              Always review diff before sending to ATS
            </p>
          </div>
          <Switch
            id="require-review-toggle"
            checked={requireReview}
            onCheckedChange={setRequireReview}
          />
        </div>

        <Button
          onClick={handleAutofill}
          disabled={autofilling}
          className="h-9 w-full text-xs font-medium"
          variant={autofilled ? "outline" : "default"}
        >
          {autofilling ? (
            <>
              <Icons.Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Scanning & Autofilling Form...
            </>
          ) : autofilled ? (
            <>
              <Icons.CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
              Autofill Applied • Ready for Review
            </>
          ) : (
            <>
              <Icons.Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Autofill Application Form
            </>
          )}
        </Button>
      </div>

      {/* Tailored Pitch / Summary */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Tailored Pitch
          </span>
          <button
            type="button"
            onClick={handleCopyPitch}
            className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-[11px] transition-colors"
          >
            {tailoredPitchCopied ? (
              <>
                <Icons.Check className="h-3 w-3 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Icons.Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="border-border/50 bg-muted/30 text-foreground/90 rounded-md border p-2.5 font-mono text-xs leading-relaxed">
          {detectedJob.tailoredPitch}
        </div>
      </div>

      {/* Trust & Zero Fabrication Verification */}
      <div className="border-border/40 mt-auto flex flex-col gap-1.5 border-t pt-3">
        <div className="text-muted-foreground flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1">
            <Icons.BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            Zero-Fabrication Verified
          </span>
          <span className="font-mono text-[10px]">SHA-256 Proof</span>
        </div>
        <p className="text-muted-foreground bg-muted/40 truncate rounded p-1 font-mono text-[9px]">
          {detectedJob.receiptDigest}
        </p>
      </div>
    </div>
  );
};
