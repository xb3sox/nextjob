import {
  ErrorCode,
  type EvaluationContext,
  type JsonValue,
  type Provider,
  type ResolutionDetails,
} from "@openfeature/web-sdk";
import { PostHog } from "posthog-react-native";
import * as z from "zod";

import { env } from "./env";

import type { FlagsClientStrategy } from "@workspace/flags";

let client: PostHog | null = null;

const getClient = () => {
  client ??= new PostHog(env.EXPO_PUBLIC_POSTHOG_KEY, {
    host: env.EXPO_PUBLIC_POSTHOG_HOST,
  });
  return client;
};

const resolve = <T>(
  schema: z.ZodType<T>,
  value: unknown,
  defaultValue: T,
  errorCode: ErrorCode,
): ResolutionDetails<T> => {
  const result = schema.safeParse(value);

  if (!result.success) {
    return { value: defaultValue, reason: "ERROR", errorCode };
  }

  return { value: result.data, reason: "STATIC" };
};

class PostHogReactNativeProvider implements Provider {
  readonly metadata = {
    name: "posthog-react-native-provider",
  };

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
  ): ResolutionDetails<boolean> {
    return resolve(
      z.boolean(),
      getClient().isFeatureEnabled(flagKey),
      defaultValue,
      ErrorCode.FLAG_NOT_FOUND,
    );
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
  ): ResolutionDetails<string> {
    return resolve(
      z.string(),
      getClient().getFeatureFlag(flagKey),
      defaultValue,
      ErrorCode.TYPE_MISMATCH,
    );
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
  ): ResolutionDetails<number> {
    return resolve(
      z.coerce.number(),
      getClient().getFeatureFlag(flagKey),
      defaultValue,
      ErrorCode.TYPE_MISMATCH,
    );
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
  ): ResolutionDetails<T> {
    const result = z
      .json()
      .safeParse(getClient().getFeatureFlagPayload(flagKey));

    if (!result.success) {
      return {
        value: defaultValue,
        reason: "ERROR",
        errorCode: ErrorCode.FLAG_NOT_FOUND,
      };
    }

    return { value: result.data as T, reason: "STATIC" };
  }
}

export const strategy = {
  getProvider: () => new PostHogReactNativeProvider(),
  syncContext: async (context: EvaluationContext | null) => {
    const posthog = getClient();

    if (context?.targetingKey) {
      const traits: Record<string, string> = {};
      const email = z.string().safeParse(context.email);
      const name = z.string().safeParse(context.name);

      if (email.success) {
        traits.email = email.data;
      }
      if (name.success) {
        traits.name = name.data;
      }

      posthog.identify(context.targetingKey, traits);
      await posthog.reloadFeatureFlagsAsync();
      return;
    }

    posthog.reset();
  },
} satisfies FlagsClientStrategy;
