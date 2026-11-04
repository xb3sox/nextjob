"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";

import { updateUserSchema } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-web/button";
import { Field, FieldError } from "@workspace/ui-web/field";
import { Input } from "@workspace/ui-web/input";
import { Spinner } from "@workspace/ui-web/spinner";
import { toast } from "@workspace/ui-web/toast";

import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardDescription,
  SettingsCardFooter,
  SettingsCardHeader,
  SettingsCardTitle,
} from "~/modules/common/layout/dashboard/settings-card";
import { onPromise } from "~/utils";

import { user } from "../../lib/api";

import type { User } from "@workspace/auth";

interface EditNameProps {
  readonly user: User;
}

export const EditName = memo<EditNameProps>((props) => {
  const { t } = useTranslation(["common", "auth"]);
  const router = useRouter();
  const form = useForm({
    resolver: standardSchemaResolver(updateUserSchema.pick({ name: true })),
    defaultValues: {
      name: props.user.name,
    },
  });

  const updateUser = useMutation({
    ...user.mutations.update,
    onSuccess: () => {
      toast.add({ title: t("account.name.edit.success"), type: "success" });
      router.refresh();
    },
  });

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <SettingsCardTitle>{t("name")}</SettingsCardTitle>
        <SettingsCardDescription>
          {t("account.name.edit.description")}
        </SettingsCardDescription>
      </SettingsCardHeader>
      <SettingsCardContent>
        <form
          id="user-edit-name-form"
          onSubmit={onPromise(
            form.handleSubmit((data) => updateUser.mutateAsync(data)),
          )}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  id="user-edit-name"
                  autoComplete="name"
                  spellCheck={false}
                  required
                  minLength={2}
                  maxLength={32}
                  type="text"
                  disabled={form.formState.isSubmitting}
                  className="max-w-xs"
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
        {t("account.name.edit.info")}
        <Button
          form="user-edit-name-form"
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

EditName.displayName = "EditName";
