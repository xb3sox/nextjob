"use client";

import { useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui-web/dialog";
import { Icons } from "@workspace/ui-web/icons";
import { Input } from "@workspace/ui-web/input";
import { Textarea } from "@workspace/ui-web/textarea";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingWizard = ({
  isOpen,
  onClose,
  onComplete,
}: OnboardingWizardProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("Senior Full-Stack Engineer");
  const [minSalary, setMinSalary] = useState("140000");
  const [workAuth, setWorkAuth] = useState<string>("US / Remote Worldwide");
  const [needsVisa, setNeedsVisa] = useState(false);
  const [automationMode, setAutomationMode] = useState<
    "review_first" | "auto_apply"
  >("review_first");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      if (cvText.trim()) {
        await fetch("/api/nextjob/career/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            format: "text",
            fileName: "Onboarding_CV.txt",
            content: cvText,
          }),
        });
      }

      await fetch("/api/nextjob/career/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRoles: [targetRole],
          locations: [workAuth],
          workModes: ["remote"],
          minSalary: Number(minSalary) || 140000,
          maxSalary: null,
          currency: "USD",
          seniorityLevels: ["Senior", "Staff"],
          employmentTypes: ["full-time"],
          excludedCompanies: [],
          excludedKeywords: [],
          requireApprovalBeforeSubmit: automationMode === "review_first",
          requireApprovalForProfileChanges: true,
          workAuthorizationCountries: [workAuth],
          requiresSponsorship: needsVisa,
          automationMode,
          autoApplyMinMatchScore: 85,
          dailyApplicationCap: 15,
          autoApplyKeywords: [],
        }),
      });

      onComplete();
    } catch {
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="font-sans sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between pb-1">
            <Badge variant="outline" className="font-mono text-[10px]">
              Step {step} of 3
            </Badge>
            <span className="text-muted-foreground text-[11px]">
              60-Second Setup
            </span>
          </div>
          <DialogTitle className="text-base font-bold">
            {step === 1 && "Welcome to NextJob: Add Master Resume"}
            {step === 2 && "Work Authorization & Target Goals"}
            {step === 3 && "Choose Your Application Mode"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === 1 &&
              "Drop or paste your existing CV. NextJob extracts your skills & experience without hallucinating."}
            {step === 2 &&
              "Set your target role and salary boundaries. The AI only targets roles meeting these rules."}
            {step === 3 &&
              "Decide whether you want to approve each submission, or let the agent auto-apply autonomously."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: CV Input */}
        {step === 1 && (
          <div className="space-y-3 py-2 text-xs">
            <div className="border-border/70 bg-muted/20 rounded-xl border border-dashed p-4 text-center">
              <Icons.FileText className="text-muted-foreground/60 mx-auto mb-1.5 h-6 w-6" />
              <p className="text-foreground font-medium">
                Paste your current CV text or resume
              </p>
              <p className="text-muted-foreground text-[11px]">
                We parse your employment history into verified facts.
              </p>
            </div>
            <Textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="e.g. Senior Software Engineer at TechCorp (2021 - Present)..."
              rows={5}
              className="font-mono text-xs"
            />
          </div>
        )}

        {/* Step 2: Work Auth & Target Goals */}
        {step === 2 && (
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label
                htmlFor="target-job-title"
                className="text-foreground font-medium"
              >
                Target Job Title:
              </label>
              <Input
                id="target-job-title"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="h-8 text-xs"
                placeholder="e.g. Senior Full-Stack Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  htmlFor="min-salary"
                  className="text-foreground font-medium"
                >
                  Minimum Salary (USD):
                </label>
                <Input
                  id="min-salary"
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="h-8 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="work-auth"
                  className="text-foreground font-medium"
                >
                  Work Authorization:
                </label>
                <Input
                  id="work-auth"
                  value={workAuth}
                  onChange={(e) => setWorkAuth(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="US Citizen, OPT, Global..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="visa-sponsorship"
                checked={needsVisa}
                onChange={(e) => setNeedsVisa(e.target.checked)}
                className="border-border text-foreground rounded"
              />
              <label
                htmlFor="visa-sponsorship"
                className="text-muted-foreground cursor-pointer text-xs"
              >
                I require visa sponsorship (H-1B, Skilled Worker)
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Choose Mode */}
        {step === 3 && (
          <div className="space-y-3 py-2 text-xs">
            <button
              type="button"
              onClick={() => setAutomationMode("review_first")}
              className={`w-full cursor-pointer space-y-1 rounded-xl border p-4 text-left transition-all ${
                automationMode === "review_first"
                  ? "border-foreground bg-muted/40 shadow-xs"
                  : "border-border/60 hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-bold">
                  Review Mode (Recommended)
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Default
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Agent prepares tailored applications and alerts you. You inspect
                the visual diff and approve in 1 click.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAutomationMode("auto_apply")}
              className={`w-full cursor-pointer space-y-1 rounded-xl border p-4 text-left transition-all ${
                automationMode === "auto_apply"
                  ? "border-foreground bg-muted/40 shadow-xs"
                  : "border-border/60 hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-bold">
                  Autonomous Auto-Apply
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400"
                >
                  Full Automation
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Agent submits directly to Workday, Greenhouse, Lever & Ashby
                when role fit is 85%+ within your daily cap.
              </p>
            </button>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => (s - 1) as typeof step)}
              className="h-8 text-xs"
            >
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground h-8 text-xs"
            >
              Skip
            </Button>
          )}

          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => (s + 1) as typeof step)}
              className="h-8 text-xs"
            >
              Next Step
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              {isSubmitting ? "Activating Agent..." : "Activate NextJob"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
