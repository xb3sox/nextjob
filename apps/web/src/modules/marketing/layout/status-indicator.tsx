import * as z from "zod";

import { cn } from "@workspace/ui";

import { API_PREFIX } from "~/config/paths";
import { getBaseUrl } from "~/lib/api/utils";
import { getTranslation } from "~/lib/i18n";

const getIsOperational = async () => {
  try {
    const response = await fetch(
      `${getBaseUrl()}${API_PREFIX}/status/api/metrics`,
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return false;
    }

    const data = z
      .object({
        snapshot: z.object({
          database: z.object({
            connected: z.boolean(),
          }),
        }),
      })
      .safeParse(await response.json());

    return data.success && data.data.snapshot.database.connected;
  } catch {
    return false;
  }
};

export const StatusIndicator = async () => {
  const [{ t }, isOperational] = await Promise.all([
    getTranslation({ ns: "marketing" }),
    getIsOperational(),
  ]);

  return (
    <a
      href={`${API_PREFIX}/status`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          isOperational ? "bg-success" : "bg-destructive",
        )}
        aria-hidden
      />
      {isOperational ? t("status.operational") : t("status.degraded")}
    </a>
  );
};
