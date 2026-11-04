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

const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  firstName: " Elena",
  lastName: "Rostova",
  fullName: "Elena Rostova",
  email: "elena.rostova@example.com",
  phone: "+1-555-0144",
  linkedin: "https://linkedin.com/in/elena-rostova",
  github: "https://github.com/elena-rostova",
  portfolio: "https://elenarostova.dev",
  workAuthorization: "yes",
  sponsorship: "no",
};

const greenhouseConnector = createGreenhouseConnector();

const ContentScriptUI = () => {
  const [statusText, setStatusText] = useState<string | null>(null);
  const platform = detectPlatform(document);
  const detectedCount = detectFields(document).length;

  const handleAutofill = () => {
    if (platform === "greenhouse") {
      const result = greenhouseConnector.fill(document, {
        jobId: window.location.pathname,
        idempotencyKey: `ext-${Date.now()}`,
        profile: DEFAULT_CANDIDATE_PROFILE,
      });
      setStatusText(
        result.success
          ? `NextJob Autofilled ${result.filledFieldCount} fields (${result.skippedFieldCount} unchanged)`
          : (result.error ?? "No matching fields filled"),
      );
      return;
    }

    const report = runSyntheticAtsFill(document, DEFAULT_CANDIDATE_PROFILE);
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
  matches: ["<all_urls>"],
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
