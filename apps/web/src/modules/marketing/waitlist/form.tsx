"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { useTranslation } from "@workspace/i18n";
import { cn } from "@workspace/ui";
import { Button } from "@workspace/ui-web/button";
import { Field, FieldError } from "@workspace/ui-web/field";
import { Input } from "@workspace/ui-web/input";
import { Spinner } from "@workspace/ui-web/spinner";
import { toast } from "@workspace/ui-web/toast";

import { useWaitlistStore } from "./store";

const waitlistFormSchema = z.object({
  email: z.email().max(254),
});

export function WaitlistForm() {
  const { t } = useTranslation("marketing");
  const setEmail = useWaitlistStore((state) => state.setEmail);
  const form = useForm({
    resolver: standardSchemaResolver(waitlistFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof waitlistFormSchema>) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    /**
     * Collect waitlist emails here. `data.email` is already validated by Zod.
     *
     * --- Option 1: Server Action (recommended for simple flows) ---
     * Mirror `apps/web/src/modules/marketing/contact/actions/index.ts`:
     *
     * ```ts
     * // apps/web/src/modules/marketing/waitlist/actions.ts
     * "use server";
     *
     * import { db } from "@workspace/db";
     * import { sendEmail } from "@workspace/email/server";
     *
     * export const joinWaitlist = async (data: { email: string }) => {
     *   try {
     *     await db.insert(waitlist).values({ email: data.email });
     *     // optional: notify yourself
     *     // await sendEmail({ to: env.CONTACT_EMAIL, template: ..., variables: data });
     *     return { error: null };
     *   } catch (e) {
     *     return { error: e instanceof Error ? e.message : "Something went wrong" };
     *   }
     * };
     * ```
     *
     * Then call it from here (same pattern as `contact-form.tsx`):
     *
     * ```ts
     * const { error } = await joinWaitlist(data);
     * if (error) return toast.add({ title: error, type: "error" });
     * ```
     *
     * --- Option 2: Hono API route ---
     * Add a public endpoint in `packages/api/src/modules/` and call it via the API client:
     *
     * ```ts
     * import { handle } from "~/lib/api/server";
     * import { api } from "~/lib/api/client";
     *
     * const { error } = await handle(api.waitlist.$post)({ json: data });
     * if (error) return toast.add({ title: error, type: "error" });
     * ```
     *
     * --- Option 3: Third-party provider ---
     * POST to your ESP (Loops, Resend Audiences, Mailchimp, etc.) inside a Server Action.
     * Store the API key in `apps/web/env.config.ts` under `server`, then use `pnpm with-env`.
     *
     * ```ts
     * await fetch("https://app.loops.so/api/v1/contacts/create", {
     *   method: "POST",
     *   headers: {
     *     Authorization: `Bearer ${env.LOOPS_API_KEY}`,
     *     "Content-Type": "application/json",
     *   },
     *   body: JSON.stringify({ email: data.email, source: "waitlist" }),
     * });
     * ```
     *
     * --- Option 4: Persist in Postgres ---
     * 1. Add a `waitlist` table in `packages/db/src/schema/`
     * 2. Run `pnpm with-env pnpm -F @workspace/db db:generate` and `db:migrate`
     * 3. Insert from a Server Action or API mutation
     *
     * On success, call `setEmail(data.email)` to drive the success gradient + button state.
     * Remove the artificial delay above once real persistence is wired up.
     */

    toast.add({
      title: t("waitlist.success.title"),
      description: t("waitlist.success.description"),
      type: "success",
    });

    setEmail(data.email);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="animate-fade-in flex w-full max-w-md flex-col gap-2 opacity-0 [--animation-delay:200ms] sm:max-w-lg sm:gap-3 md:flex-row md:items-start"
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
              disabled={
                form.formState.isSubmitting || form.formState.isSubmitSuccessful
              }
              className={cn(
                "bg-background/50 h-11 rounded-lg shadow-sm backdrop-blur-md",
                form.formState.isSubmitSuccessful && "disabled:opacity-100",
              )}
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
        disabled={
          form.formState.isSubmitting || form.formState.isSubmitSuccessful
        }
        className={cn(
          "relative h-11 w-full shrink-0 rounded-lg px-6 text-base shadow-lg transition-all md:w-fit",
          form.formState.isSubmitSuccessful &&
            "bg-success text-success-foreground hover:bg-success/90 disabled:opacity-100",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center transition-opacity",
            form.formState.isSubmitting && "opacity-0",
          )}
        >
          {form.formState.isSubmitSuccessful
            ? t("waitlist.success.cta")
            : t("waitlist.submit")}
        </span>
        <Spinner
          aria-hidden={!form.formState.isSubmitting}
          className={cn(
            "absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 transition-opacity",
            !form.formState.isSubmitting && "opacity-0",
          )}
        />
      </Button>
    </form>
  );
}
