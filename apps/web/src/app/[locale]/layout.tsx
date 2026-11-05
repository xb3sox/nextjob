import "~/assets/styles/globals.css";
import { notFound } from "next/navigation";

import { config, isLocaleSupported } from "@workspace/i18n";

import { getLocale } from "~/lib/i18n";
import { DEFAULT_METADATA, DEFAULT_VIEWPORT } from "~/lib/metadata";
import { Providers } from "~/lib/providers/providers";
import { ImpersonatingBanner } from "~/modules/admin/users/user/impersonating-banner";
import { BaseLayout } from "~/modules/common/layout/base";
import { OfflineBanner } from "~/modules/common/offline-banner";
import { Toaster } from "~/modules/common/toast";

export const viewport = DEFAULT_VIEWPORT;
export const metadata = DEFAULT_METADATA;

export function generateStaticParams() {
  return config.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  if (!isLocaleSupported(locale)) {
    return notFound();
  }

  return (
    <BaseLayout locale={locale}>
      <Providers locale={locale}>
        <OfflineBanner />
        <ImpersonatingBanner />
        {children}
        <Toaster />
      </Providers>
    </BaseLayout>
  );
}
