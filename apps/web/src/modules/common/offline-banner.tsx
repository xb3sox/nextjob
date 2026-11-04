"use client";

import { useOffline } from "next/offline";

import { useTranslation } from "@workspace/i18n";

export function OfflineBanner() {
  const isOffline = useOffline();
  const { t } = useTranslation("common");

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      className="bg-foreground text-background fixed inset-x-0 top-0 z-50 flex items-center justify-center px-4 py-2 text-center text-sm"
    >
      {t("offline.banner")}
    </div>
  );
}
