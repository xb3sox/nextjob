import "~/assets/styles/globals.css";
import { appConfig } from "~/config/app";
import { Providers } from "~/lib/providers/providers";
import { BaseLayout } from "~/modules/common/layout/base";
import { NotFound } from "~/modules/common/not-found";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <BaseLayout locale={appConfig.locale}>
      <Providers locale={appConfig.locale}>
        <NotFound locale={appConfig.locale} />
      </Providers>
    </BaseLayout>
  );
}
