import { Flag, useBooleanFlagValue } from "@workspace/flags";
import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { badgeVariants } from "@workspace/ui-web/badge";

import { Layout, render } from "~/modules/common/layout/layout";
import { Main } from "~/modules/common/main";

const DemoBanner = () => {
  const { t } = useTranslation("marketing");
  const demo = useBooleanFlagValue(Flag.DEMO, false);

  if (!demo) {
    return null;
  }

  return (
    <a
      className={cn(badgeVariants({ variant: "secondary" }))}
      href="https://www.turbostarter.dev/docs/extension/flags/overview"
    >
      {t("featureFlags.demo.banner", { flag: Flag.DEMO })}
    </a>
  );
};

const Options = () => {
  return (
    <Layout className="p-8">
      <div className="flex flex-col items-center gap-6">
        <Main filename="app/options" />
        <DemoBanner />
      </div>
    </Layout>
  );
};

render("root", <Options />);
