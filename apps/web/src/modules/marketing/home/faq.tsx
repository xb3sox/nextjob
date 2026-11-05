/* oxlint-disable i18next/no-literal-string */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui-web/accordion";
import { buttonVariants } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";

import { pathsConfig } from "~/config/paths";
import { getTranslation } from "~/lib/i18n";
import { TurboLink } from "~/modules/common/turbo-link";
import {
  Section,
  SectionHeader,
  SectionBadge,
  SectionTitle,
  SectionDescription,
} from "~/modules/marketing/layout/section";

const questions = [
  {
    question: "faq.question.whatDoesOurPlatformDo.question",
    answer: "faq.question.whatDoesOurPlatformDo.answer",
  },
  {
    question: "faq.question.howWillThisBenefitMyBusiness.question",
    answer: "faq.question.howWillThisBenefitMyBusiness.answer",
  },
  {
    question: "faq.question.isMyDataSafe.question",
    answer: "faq.question.isMyDataSafe.answer",
  },
  {
    question: "faq.question.whatKindOfIntegrationsAreAvailable.question",
    answer: "faq.question.whatKindOfIntegrationsAreAvailable.answer",
  },
  {
    question: "faq.question.howEasyIsItToOnboardMyTeam.question",
    answer: "faq.question.howEasyIsItToOnboardMyTeam.answer",
  },
  {
    question: "faq.question.whatTypesOfBusinessesCanUseThis.question",
    answer: "faq.question.whatTypesOfBusinessesCanUseThis.answer",
  },
  {
    question: "faq.question.canICustomizeThisToFitMyBusinessNeeds.question",
    answer: "faq.question.canICustomizeThisToFitMyBusinessNeeds.answer",
  },
] as const;

export const Faq = async () => {
  const { t } = await getTranslation({ ns: "marketing" });

  return (
    <Section
      id="faq"
      className="gap-10 py-12 sm:py-16 md:py-20 lg:flex-row lg:items-start lg:gap-14"
    >
      <SectionHeader className="grow basis-0 gap-4 lg:items-start lg:text-start">
        <SectionBadge>{t("faq.label")}</SectionBadge>
        <SectionTitle className="mt-2 lg:text-start">
          {t("faq.title")}
        </SectionTitle>
        <SectionDescription className="text-sm leading-relaxed sm:text-base lg:text-start">
          {t("faq.description")}
        </SectionDescription>

        <div className="pt-2">
          <TurboLink
            href={pathsConfig.marketing.contact}
            className={buttonVariants({
              variant: "outline",
              className:
                "group h-10 px-4 text-xs sm:text-sm font-medium border-border/70 hover:bg-muted/50 transition-all",
            })}
          >
            <span>{t("faq.cta")}</span>
            <Icons.ArrowRight className="ms-1.5 size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </TurboLink>
        </div>
      </SectionHeader>

      <Accordion multiple className="w-full grow basis-0 space-y-2.5">
        {questions.map((question) => (
          <AccordionItem
            key={question.question}
            value={question.question}
            className="border-border/60 bg-card/70 hover:bg-card/95 rounded-xl border px-4 shadow-xs transition-colors sm:px-5"
          >
            <AccordionTrigger className="text-foreground py-4 text-start text-sm font-medium hover:no-underline sm:text-base">
              {t(question.question)}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pt-1 pb-4 text-xs leading-relaxed font-normal sm:text-sm">
              {t(question.answer)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
};
