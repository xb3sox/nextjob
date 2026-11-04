"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AnimatePresence, motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { Button } from "@workspace/ui-web/button";
import { Field, FieldError } from "@workspace/ui-web/field";
import { Icons } from "@workspace/ui-web/icons";
import { Input } from "@workspace/ui-web/input";
import { Spinner } from "@workspace/ui-web/spinner";

import {
  Section,
  SectionBadge,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "~/modules/marketing/layout/section";

const onSubmit = async (data: z.infer<typeof newsletterFormSchema>) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  /**
   * Collect newsletter emails here. `data.email` is already validated by Zod.
   *
   * Mirror the waitlist options in `~/modules/marketing/waitlist/form.tsx`:
   * Server Action, Hono API route, ESP (Loops/Resend/Mailchimp), or Postgres.
   *
   * Remove the artificial delay above once real persistence is wired up.
   */

  return data;
};

const newsletterFormSchema = z.object({
  email: z.email().max(254),
});

export function Newsletter() {
  const { t } = useTranslation("marketing");
  const form = useForm({
    resolver: standardSchemaResolver(newsletterFormSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <Section id="newsletter" className="relative my-4 overflow-hidden md:my-8">
      <div className="relative flex w-full flex-col items-center gap-6 overflow-hidden rounded-xl border px-6 py-10 sm:py-12 md:gap-10 md:py-16 lg:px-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-750 ease-in-out",
              "bg-[linear-gradient(to_top_left,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]",
              form.formState.isSubmitSuccessful ? "opacity-0" : "opacity-100",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-750 ease-in-out",
              "bg-[linear-gradient(to_top_left,color-mix(in_oklab,var(--success)_22%,transparent),transparent_70%)]",
              form.formState.isSubmitSuccessful ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <SectionHeader className="relative z-10">
          <SectionBadge>{t("newsletter.label")}</SectionBadge>
          <SectionTitle>{t("newsletter.title")}</SectionTitle>
          <SectionDescription>{t("newsletter.subtitle")}</SectionDescription>
        </SectionHeader>

        <AnimatePresence mode="wait">
          {form.formState.isSubmitSuccessful ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10 flex h-11 items-center justify-center text-center"
            >
              <p className="text-success text-xl font-semibold tracking-tight md:text-2xl">
                <Icons.CheckCircle2 className="inline-block size-[0.9em] translate-y-[-0.075em]" />{" "}
                {t("newsletter.success.title")}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="idle"
              exit={{ opacity: 0 }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="relative z-10 flex w-full max-w-md flex-col gap-2 sm:max-w-lg sm:gap-3 md:flex-row md:items-start"
            >
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="w-full min-w-0 md:flex-1"
                  >
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      required
                      aria-invalid={fieldState.invalid}
                      placeholder="elon@tesla.com"
                      disabled={form.formState.isSubmitting}
                      className="bg-card h-11"
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="relative h-11 w-full shrink-0 rounded-lg px-6 md:w-fit"
              >
                <span
                  className={cn(
                    "inline-flex items-center transition-opacity",
                    form.formState.isSubmitting && "opacity-0",
                  )}
                >
                  {t("newsletter.submit")}
                </span>
                <Spinner
                  aria-hidden={!form.formState.isSubmitting}
                  className={cn(
                    "absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 transition-opacity",
                    !form.formState.isSubmitting && "opacity-0",
                  )}
                />
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
