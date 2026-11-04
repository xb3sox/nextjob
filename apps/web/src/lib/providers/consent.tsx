import { ConsentBanner, ConsentDialog, ConsentRoot } from "@c15t/nextjs";
import { resolveConsent } from "@c15t/nextjs/server";

interface ConsentProviderProps {
  readonly children: React.ReactNode;
  readonly locale: string;
}

export const ConsentProvider = async ({
  children,
  locale,
}: ConsentProviderProps) => {
  return (
    <ConsentRoot
      state={resolveConsent({ language: locale })}
      options={{
        i18n: {
          locale,
          detectBrowserLanguage: false,
        },
      }}
    >
      {children}
      <ConsentBanner
        hideBranding
        legalLinks={["privacyPolicy", "cookiePolicy"]}
        layout={["customize", ["reject", "accept"]]}
      />
      <ConsentDialog
        hideBranding
        legalLinks={["privacyPolicy", "cookiePolicy"]}
      />
    </ConsentRoot>
  );
};
