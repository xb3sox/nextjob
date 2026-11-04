import { OpenFeature, type JsonValue } from "@openfeature/server-sdk";

import type { FlagsEvaluationContext, FlagsServerStrategy } from "./types";

export const createFlagsServer = (strategy: FlagsServerStrategy) => {
  let providerReady: Promise<void> | null = null;

  const ensureProvider = async () => {
    providerReady ??= OpenFeature.setProviderAndWait(
      strategy.getProvider(),
    ).catch((error: unknown) => {
      providerReady = null;
      throw error;
    });

    await providerReady;
  };

  const getClient = async () => {
    await ensureProvider();
    return OpenFeature.getClient();
  };

  return {
    getBooleanValue: async (
      flag: string,
      defaultValue: boolean,
      context?: FlagsEvaluationContext,
    ) => {
      const client = await getClient();
      return client.getBooleanValue(flag, defaultValue, context);
    },
    getStringValue: async (
      flag: string,
      defaultValue: string,
      context?: FlagsEvaluationContext,
    ) => {
      const client = await getClient();
      return client.getStringValue(flag, defaultValue, context);
    },
    getNumberValue: async (
      flag: string,
      defaultValue: number,
      context?: FlagsEvaluationContext,
    ) => {
      const client = await getClient();
      return client.getNumberValue(flag, defaultValue, context);
    },
    getObjectValue: async <T extends JsonValue>(
      flag: string,
      defaultValue: T,
      context?: FlagsEvaluationContext,
    ) => {
      const client = await getClient();
      return client.getObjectValue(flag, defaultValue, context);
    },
  };
};

export type { FlagsEvaluationContext, FlagsServerStrategy } from "./types";
