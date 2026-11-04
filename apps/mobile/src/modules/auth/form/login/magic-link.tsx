import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, View } from "react-native";

import { generateName, magicLinkLoginSchema } from "@workspace/auth";
import { useTranslation } from "@workspace/i18n";
import { Button } from "@workspace/ui-mobile/button";
import { Field, FieldError, FieldLabel } from "@workspace/ui-mobile/field";
import { Input } from "@workspace/ui-mobile/input";
import { Spinner } from "@workspace/ui-mobile/spinner";
import { Text } from "@workspace/ui-mobile/text";

import { pathsConfig } from "~/config/paths";

import { auth } from "../../lib/api";

import type { Path } from "~/config/paths";

interface MagicLinkLoginFormProps {
  readonly redirectTo?: Path;
  readonly email?: string;
}

export const MagicLinkLoginForm = memo<MagicLinkLoginFormProps>(
  ({ redirectTo = pathsConfig.index, email }) => {
    const { t } = useTranslation(["common", "auth"]);
    const form = useForm({
      resolver: standardSchemaResolver(magicLinkLoginSchema),
      defaultValues: {
        email: email ?? "",
      },
    });

    const signIn = useMutation({
      ...auth.mutations.signIn.magicLink,
      onSuccess: () => {
        Alert.alert(
          t("login.magicLink.success.title"),
          t("login.magicLink.success.description"),
        );
        form.reset();
      },
    });

    const submit = form.handleSubmit((data) =>
      signIn.mutateAsync({
        ...data,
        name: generateName(data.email),
        callbackURL: redirectTo,
      }),
    );

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
                onChangeText={field.onChange}
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                keyboardType="email-address"
                spellCheck={false}
                maxLength={254}
                editable={!form.formState.isSubmitting}
                returnKeyType="go"
                onSubmitEditing={() => void submit()}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          className="w-full"
          size="lg"
          onPress={submit}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Spinner className="text-primary-foreground size-5" />
          ) : (
            <Text>{t("login.magicLink.cta")}</Text>
          )}
        </Button>
      </View>
    );
  },
);
