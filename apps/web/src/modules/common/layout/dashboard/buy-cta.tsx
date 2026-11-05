/* oxlint-disable i18next/no-literal-string */
import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { Badge } from "@workspace/ui-web/badge";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

export const BuyCta = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof TurboLink>, "href">) => {
  const { t } = useTranslation("marketing");
  return (
    <TurboLink
      href={pathsConfig.dashboard.user.jobs}
      className={cn(
        "relative m-1 overflow-hidden transition-all duration-200 ease-out",
        "block h-[105px]",
        "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-muted/40 hover:bg-muted/70 hover:border-border/80 absolute inset-x-0 top-0 flex flex-col gap-1.5 rounded-xl border p-3 shadow-2xs transition-colors",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-primary text-xs leading-tight font-bold tracking-tight">
            {t("buyCta.title")}
          </span>
          <Badge variant="outline" className="px-1 py-0 font-mono text-[9px]">
            P0 Open-Source
          </Badge>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-[11px] leading-snug">
          {t("buyCta.description")}
        </p>
        <div className="text-primary flex items-center gap-1 pt-0.5 text-[11px] font-semibold">
          <span>{t("buyCta.link")}</span>
          <Icons.ArrowRight className="size-3" />
        </div>
      </div>
    </TurboLink>
  );
};
