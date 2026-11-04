import { QueryClientProvider } from "~/lib/query";

import { AnalyticsProvider } from "./analytics";
import { FlagsProvider } from "./flags";
import { I18nProvider } from "./i18n";
import { MonitoringProvider } from "./monitoring";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider>
      <I18nProvider>
        <AnalyticsProvider>
          <MonitoringProvider>
            <FlagsProvider>{children}</FlagsProvider>
          </MonitoringProvider>
        </AnalyticsProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};
