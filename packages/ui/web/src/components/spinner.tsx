import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";

import { Icons } from "#components/icons";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { t } = useTranslation("common");
  return (
    <Icons.Loader2
      role="status"
      aria-label={t("loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
