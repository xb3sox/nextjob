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

import { Layout, render } from "~/modules/common/layout/layout";
import {
  createGreenhouseConnector,
  createMockGreenhouseHtml,
} from "~/modules/connectors";

import type { CandidateProfile } from "~/modules/connectors";

interface PopupProfile extends CandidateProfile {
  currentCompany?: string;
  currentTitle?: string;
}

const DEFAULT_PROFILE: PopupProfile = {
  firstName: "Alex",
  lastName: "Rivera",
  fullName: "Alex Rivera",
  email: "alex.rivera@nextjob.dev",
  phone: "+1-555-019-2834",
  linkedin: "https://linkedin.com/in/alexrivera-dev",
  github: "https://github.com/alexrivera",
  portfolio: "https://alexrivera.dev",
  currentCompany: "CloudScale Technologies",
  currentTitle: "Senior Full-Stack Engineer",
};

const POPUP_COPY = {
  title: "NextJob Browser Assistant",
  subtitle: "One Profile. Every Opportunity. Less Work.",
  syncBtn: "Sync Career Graph",
  pausedBadge: "Paused",
  activeBadge: "Active",
  resumeBtn: "Resume",
  pauseBtn: "Pause",
  policyHeading: "Action Policy & Field Guardrails (FR-03 / FR-07)",
  verifyAutofillBtn: "Verify Greenhouse ATS Autofill",
} as const;

interface PolicyRuleSummary {
  field: string;
  risk: "low" | "high" | "sensitive" | "unsupported";
  action: string;
}

const POLICY_SUMMARY: readonly PolicyRuleSummary[] = [
  { field: "Name / Email / Phone / Links", risk: "low", action: "Auto-Fill" },
  {
    field: "Compensation / Start Date",
    risk: "high",
    action: "Approval Required",
  },
  {
    field: "Demographics / Disability (FR-03)",
    risk: "sensitive",
    action: "User-Only Input",
  },
  {
    field: "CAPTCHA / MFA / Biometrics",
    risk: "unsupported",
    action: "Blocked",
  },
] as const;

const Popup = () => {
  const [profile, setProfile] = useState<PopupProfile>(DEFAULT_PROFILE);
  const [syncStatus, setSyncStatus] = useState<string>(
    "Verified Career Graph Ready",
  );
  const [lastFillReport, setLastFillReport] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handleSyncFromWebApi = async () => {
    setSyncStatus("Syncing with NextJob Web API...");
    try {
      const response = await fetch(
        "http://localhost:3000/api/nextjob/extension/autofill-bundle",
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = (await response.json()) as {
          profile?: PopupProfile;
          automationPaused?: boolean;
        };
        if (data.profile) {
          setProfile(data.profile);
        }
        if (typeof data.automationPaused === "boolean") {
          setIsPaused(data.automationPaused);
        }
        setSyncStatus("Synced live from NextJob Web API");
        return;
      }
    } catch {
      // Fallback to local verified profile snapshot
    }
    setSyncStatus("Using cached verified Career Graph");
  };

  const handleRunDryRunAutofill = async () => {
    if (isPaused) {
      setLastFillReport("Automation paused by user kill-switch.");
      return;
    }

    const container = document.createElement("div");
    container.innerHTML = createMockGreenhouseHtml();
    const connector = createGreenhouseConnector({ allowDuplicates: true });
    const result = await connector.fill(container, {
      jobId: "gh-dryrun-991",
      idempotencyKey: `idem-${Date.now()}`,
      profile,
    });

    setLastFillReport(
      `Filled ${result.filledFieldCount} low-risk fields on ${result.platform.toUpperCase()} (Hash: ${result.submissionHash?.slice(0, 14) ?? "verified"})`,
    );
  };

  return (
    <Layout className="gap-4 p-3">
      <div className="flex w-92 flex-col gap-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                {POPUP_COPY.title}
              </CardTitle>
              <Badge variant={isPaused ? "destructive" : "default"}>
                {isPaused ? POPUP_COPY.pausedBadge : POPUP_COPY.activeBadge}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {POPUP_COPY.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="rounded-md border p-2">
              <div className="font-medium">{profile.fullName}</div>
              <div className="text-muted-foreground">
                {`${profile.currentTitle ?? ""} · ${profile.currentCompany ?? ""}`}
              </div>
              <div className="text-muted-foreground mt-0.5">{syncStatus}</div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleSyncFromWebApi}
              >
                {POPUP_COPY.syncBtn}
              </Button>
              <Button
                size="sm"
                variant={isPaused ? "default" : "destructive"}
                className="text-xs"
                onClick={() => setIsPaused((prev) => !prev)}
              >
                {isPaused ? POPUP_COPY.resumeBtn : POPUP_COPY.pauseBtn}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold">
              {POPUP_COPY.policyHeading}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-xs">
            {POLICY_SUMMARY.map((rule) => (
              <div
                key={rule.field}
                className="flex items-center justify-between border-b pb-1 last:border-0"
              >
                <span>{rule.field}</span>
                <Badge variant="outline" className="text-[10px]">
                  {rule.action}
                </Badge>
              </div>
            ))}

            <Button
              size="sm"
              className="mt-2 w-full text-xs"
              disabled={isPaused}
              onClick={handleRunDryRunAutofill}
            >
              {POPUP_COPY.verifyAutofillBtn}
            </Button>

            {lastFillReport ? (
              <div className="bg-muted mt-1 rounded p-2 text-[11px]">
                {lastFillReport}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

render("root", <Popup />);
