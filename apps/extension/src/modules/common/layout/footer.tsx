import { BuiltWith } from "@workspace/ui-web/built-with";

import { appConfig } from "~/config/app";

export const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-1.5">
      <BuiltWith />
      <p className="text-muted-foreground text-xs">{`v${appConfig.version}`}</p>
    </footer>
  );
};
