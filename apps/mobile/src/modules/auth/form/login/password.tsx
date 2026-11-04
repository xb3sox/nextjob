import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { memo, useRef, type ComponentRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { passwordLoginSchema } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-mobile/button";
import { Checkbox } from "@workspace/ui-mobile/checkbox";
import { Field, FieldLabel, FieldError } from "@workspace/ui-mobile/field";
import { Input } from "@workspace/ui-mobile/input";
import { Spinner } from "@workspace/ui-mobile/spinner";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";
import { Link } from "~/modules/common/styled";

import { auth } from "../../lib/api";

import type { Href } from "expo-router";

interface PasswordLoginFormProps {
  readonly redirectTo?: Href;
  readonly email?: string;
  readonly onTwoFactorRedirect?: () => void;
}

export const PasswordLoginForm = memo<PasswordLoginFormProps>(
  ({ redirectTo = pathsConfig.index, email, onTwoFactorRedirect }) => {
    const { t } = useTranslation(["common", "auth"]);

    const form = useForm({
      resolver: standardSchemaResolver(passwordLoginSchema),
      defaultValues: {
        rememberMe: true,
        email,
      },
    });

    const signIn = useMutation({
      ...auth.mutations.signIn.email,
      onSuccess: (ctx) => {
        if ("twoFactorRedirect" in ctx) {
          return onTwoFactorRedirect?.();
        }

        router.navigate(redirectTo);
      },
    });

    const submit = form.handleSubmit((data) => signIn.mutateAsync(data));
    const passwordRef = useRef<ComponentRef<typeof Input>>(null);

    return (
      <View className="gap-6">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field invalid={fieldState.invalid}>
              <FieldLabel>{t("common:email")}</FieldLabel>
              <Input
                {...field}
                testID="login-email-input"
                onChangeText={field.onChange}
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                keyboardType="email-address"
                spellCheck={false}
                maxLength={254}
                editable={!form.formState.isSubmitting}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field invalid={fieldState.invalid}>
              <View className="flex-row items-center justify-between">
                <FieldLabel>{t("password")}</FieldLabel>
                <Link
                  href={pathsConfig.setup.auth.forgotPassword}
                  className="text-muted-foreground self-end font-sans text-sm underline underline-offset-4"
                >
                  {t("account.password.forgot.label")}
                </Link>
              </View>
              <Input
                {...field}
                ref={passwordRef}
                testID="login-password-input"
                secureTextEntry
                autoComplete="password"
                onChangeText={field.onChange}
                returnKeyType="go"
                onSubmitEditing={() => void submit()}
                editable={!form.formState.isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="rememberMe"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field invalid={fieldState.invalid} orientation="horizontal">
              <Checkbox
                {...field}
                checked={!!field.value}
                onCheckedChange={field.onChange}
                disabled={form.formState.isSubmitting}
              />
              <FieldLabel onPress={() => field.onChange(!field.value)}>
                {t("rememberMe")}
              </FieldLabel>
            </Field>
          )}
        />

        <Button
          testID="login-submit"
          className="w-full"
          size="lg"
          onPress={submit}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner className="text-primary-foreground" />
          ) : (
            <Text>{t("login.cta")}</Text>
          )}
        </Button>
      </View>
    );
  },
);

PasswordLoginForm.displayName = "PasswordLoginForm";
