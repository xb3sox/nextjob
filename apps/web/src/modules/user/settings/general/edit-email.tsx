"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";

import { emailSchema } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Field, FieldError } from "@workspace/ui-web/field";
import { Input } from "@workspace/ui-web/input";
import { Spinner } from "@workspace/ui-web/spinner";
import { toast } from "@workspace/ui-web/toast";

import { pathsConfig } from "~/config/paths";
import { auth } from "~/modules/auth/lib/api";
import {
  SettingsCard,
  SettingsCardTitle,
  SettingsCardHeader,
  SettingsCardDescription,
  SettingsCardFooter,
  SettingsCardContent,
} from "~/modules/common/layout/dashboard/settings-card";

import type { User } from "@workspace/auth";

interface EditEmailProps {
  readonly user: User;
}

export const EditEmail = memo<EditEmailProps>((props) => {
  const { t } = useTranslation(["common", "auth"]);
  const form = useForm({
    resolver: standardSchemaResolver(emailSchema),
    defaultValues: {
      email: props.user.email,
    },
  });

  const sendVerification = useMutation({
    ...auth.mutations.email.sendVerification,
    onSuccess: () => {
      toast.add({
        title: t("account.email.confirm.email.sent"),
        type: "success",
      });
    },
  });

  const changeEmail = useMutation({
    ...auth.mutations.email.change,
    onSuccess: () => {
      toast.add({ title: t("account.email.change.success"), type: "success" });
    },
  });

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <div className="flex items-center gap-3">
          <SettingsCardTitle>{t("email")}</SettingsCardTitle>
          <Badge variant={props.user.emailVerified ? "success" : "destructive"}>
            {props.user.emailVerified ? t("verified") : t("unverified")}
          </Badge>
          {!props.user.emailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                sendVerification.mutate({
                  email: props.user.email,
                  callbackURL: pathsConfig.dashboard.user.settings.index,
                })
              }
              disabled={sendVerification.isPending}
              type="button"
              className="h-auto px-3 py-1 text-xs"
            >
              {sendVerification.isPending
                ? t("account.email.confirm.loading")
                : t("account.email.confirm.cta")}
            </Button>
          )}
        </div>

        <SettingsCardDescription>
          {t("account.email.change.description")}
        </SettingsCardDescription>
      </SettingsCardHeader>

      <SettingsCardContent>
        <form
          id="user-edit-email-form"
          onSubmit={form.handleSubmit((data) =>
            changeEmail.mutateAsync({
              newEmail: data.email,
              callbackURL: pathsConfig.dashboard.user.settings.index,
            }),
          )}
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id="user-edit-email"
                  type="email"
                  inputMode="email"
                  spellCheck={false}
                  required
                  className="max-w-xs"
                  placeholder="john@doe.com"
                  disabled={form.formState.isSubmitting}
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
      </SettingsCardContent>

      <SettingsCardFooter>
        {t("account.email.change.info")}
        <Button
          form="user-edit-email-form"
          type="submit"
          size="sm"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner className="size-4" />
          ) : (
            t("save")
          )}
        </Button>
      </SettingsCardFooter>
    </SettingsCard>
  );
});

EditEmail.displayName = "EditEmail";
