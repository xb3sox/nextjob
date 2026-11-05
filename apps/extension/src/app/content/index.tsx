/* eslint-disable i18next/no-literal-string */
import { useState } from "react";
import ReactDOM from "react-dom/client";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import { defineContentScript } from "wxt/utils/define-content-script";

import { logger } from "@workspace/shared/logger";
import { Button } from "@workspace/ui-web/button";

import "~/assets/styles/globals.css";
import {
  createGreenhouseConnector,
  detectFields,
  detectPlatform,
  runSyntheticAtsFill,
} from "~/modules/connectors";

import type { CandidateProfile } from "~/modules/connectors";

const greenhouseConnector = createGreenhouseConnector();

const ContentScriptUI = () => {
  const [statusText, setStatusText] = useState<string | null>(null);
  const platform = detectPlatform(document);
  const detectedCount = detectFields(document).length;

  const handleAutofill = async () => {
    setStatusText("Fetching profile...");
    let profile: CandidateProfile | null = null;
    try {
      const response = await fetch(
        "http://localhost:3000/api/nextjob/extension/autofill-bundle",
        {
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = (await response.json()) as {
          profile?: Record<string, string>;
        };
        if (data.profile) {
          // Map backend profile structure to CandidateProfile if necessary
          profile = {
            firstName: data.profile.firstName || "",
            lastName: data.profile.lastName || "",
            fullName: data.profile.fullName || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            linkedin: data.profile.linkedinUrl || "",
            github: data.profile.githubUrl || "",
            portfolio: data.profile.portfolioUrl || "",
            workAuthorization:
              (data.profile.workAuthorization as "yes" | "no") || undefined,
            sponsorship:
              (data.profile.sponsorship as "yes" | "no") || undefined,
          };
        }
      }
    } catch (e) {
      console.error("Failed to fetch profile bundle", e);
    }

    if (!profile) {
      setStatusText("Failed to load profile. Please log in.");
      return;
    }

    if (platform === "greenhouse") {
      const result = await greenhouseConnector.fill(document, {
        jobId: window.location.pathname,
        idempotencyKey: `ext-${Date.now()}`,
        profile,
      });
      setStatusText(
        result.success
          ? `NextJob Autofilled ${result.filledFieldCount} fields (${result.skippedFieldCount} unchanged)`
          : (result.error ?? "No matching fields filled"),
      );
      return;
    }

    const report = runSyntheticAtsFill(document, profile);
    setStatusText(
      `NextJob Autofilled ${report.filledCount}/${report.detectedCount} fields (${report.platform})`,
    );
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-1.5">
      {statusText && (
        <div className="bg-background text-foreground rounded-md border px-2.5 py-1 text-xs shadow-md">
          {statusText}
        </div>
      )}
      <Button size="sm" onClick={handleAutofill}>
        {`NextJob Autofill (${platform.toUpperCase()} • ${detectedCount} fields)`}
      </Button>
    </div>
  );
};

export default defineContentScript({
  matches: [
    "*://*.greenhouse.io/*",
    "*://*.lever.co/*",
    "*://*.myworkdayjobs.com/*",
    "*://*.ashbyhq.com/*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    logger.info("NextJob ATS Connector content script initialized.");

    const ui = await createShadowRootUi(ctx, {
      name: "turbostarter-extension",
      position: "overlay",
      anchor: "body",
      onMount: (container) => {
        const app = document.createElement("div");
        container.append(app);

        const root = ReactDOM.createRoot(app);
        root.render(<ContentScriptUI />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
