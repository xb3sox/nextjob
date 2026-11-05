"use client";

import * as React from "react";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";

import { buttonVariants } from "#components/button";

export const BuiltWith = ({
  className,
  ...props
}: React.ComponentProps<"a">) => {
  const { t } = useTranslation("common");

  return (
    <a
      className={cn(
        buttonVariants({
          variant: "outline",
          className: "cursor-pointer gap-1.5 font-sans",
        }),
        className,
      )}
      href="https://github.com/xb3sox/nextjob"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {t("builtWith")}{" "}
      <span className="text-foreground font-semibold tracking-tight">
        {/* oxlint-disable-next-line i18next/no-literal-string */}
        NextJob Open-Source
      </span>
    </a>
  );
};
