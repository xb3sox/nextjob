import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { otpVerificationSchema, SecondFactor } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-mobile/button";
import { Checkbox } from "@workspace/ui-mobile/checkbox";
import { Field, FieldError, FieldLabel } from "@workspace/ui-mobile/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui-mobile/input-otp";
import { Spinner } from "@workspace/ui-mobile/spinner";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";

import { auth } from "../../lib/api";

import type { CtaProps, FormProps } from ".";

const TotpForm = memo<FormProps>(({ redirectTo = pathsConfig.index }) => {
  const { t } = useTranslation(["common", "auth"]);

  const form = useForm({
    resolver: standardSchemaResolver(otpVerificationSchema),
    defaultValues: {
      code: "",
      trustDevice: false,
    },
  });

  const verifyTotp = useMutation({
    ...auth.mutations.twoFactor.totp.verify,
    onSuccess: () => {
      router.replace(redirectTo);
    },
  });

  const submit = form.handleSubmit((data) => verifyTotp.mutateAsync(data));

  return (
    <View className="flex flex-col items-start gap-6">
      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field invalid={fieldState.invalid} className="items-start">
            <InputOTP
              maxLength={6}
              autoFocus
              value={field.value}
              onChange={field.onChange}
              onComplete={submit}
              editable={!form.formState.isSubmitting}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} index={index} max={6} {...slot} />
                  ))}
                </InputOTPGroup>
              )}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="trustDevice"
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              {...field}
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
            <FieldLabel onPress={() => field.onChange(!field.value)}>
              {t("login.twoFactor.trustDevice")}
            </FieldLabel>
          </Field>
        )}
      />

      <Button
        className="w-full"
        size="lg"
        disabled={form.formState.isSubmitting}
        onPress={submit}
      >
        {form.formState.isSubmitting ? (
          <Spinner className="text-primary-foreground" />
        ) : (
          <Text>{t("verify")}</Text>
        )}
      </Button>
    </View>
  );
});

const TotpCta = memo<CtaProps>(({ onFactorChange }) => {
  const { t } = useTranslation("auth");
  return (
    <View className="flex items-center justify-center pt-2">
      <Text
        onPress={() => onFactorChange(SecondFactor.TOTP)}
        className="text-muted-foreground cursor-pointer pl-2 text-sm font-medium underline underline-offset-4"
      >
        {t("login.twoFactor.totp.cta")}
      </Text>
    </View>
  );
});

export { TotpForm, TotpCta };
