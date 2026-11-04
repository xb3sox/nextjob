import { policyRulePresets } from "@c15t/core";
import { defineConsentConfig, offline } from "@c15t/nextjs";
import { translations as en } from "@c15t/translations/en";
import { translations as es } from "@c15t/translations/es";

const hasHostedBackend = Boolean(process.env.NEXT_PUBLIC_C15T_BACKEND_URL);

export default defineConsentConfig({
  mode: hasHostedBackend
    ? undefined
    : offline({
        policyRules: [
          policyRulePresets.europeOptIn(),
          policyRulePresets.californiaOptOut(),
          policyRulePresets.worldOptOutNoPrompt(),
        ],
      }),
  options: {
    consentCategories: ["necessary", "measurement"],
    legalLinks: {
      privacyPolicy: { href: "/legal/privacy-policy", target: "_self" },
      cookiePolicy: { href: "/legal/cookie-policy", target: "_self" },
    },
    i18n: {
      detectBrowserLanguage: false,
      messages: {
        en,
        es,
      },
    },
    theme: {
      slots: {
        consentBanner: {
          style: {
            maxWidth: "calc(var(--consent-banner-max-width) + 3rem)",
          },
        },
      },
    },
  },
});
