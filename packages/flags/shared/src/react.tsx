"use client";

import {
  OpenFeature,
  OpenFeatureProvider,
  useBooleanFlagValue,
  useNumberFlagValue,
  useObjectFlagValue,
  useStringFlagValue,
} from "@openfeature/react-sdk";
import { type ReactNode } from "react";

import type { FlagsClientStrategy, FlagsEvaluationContext } from "./types";

export interface FlagsProviderProps {
  readonly children: ReactNode;
}

export const createFlagsReact = (strategy: FlagsClientStrategy) => {
  let isProviderSet = false;

  const ensureProvider = () => {
    if (isProviderSet) {
      return;
    }

    OpenFeature.setProvider(strategy.getProvider());
    isProviderSet = true;
  };

  const setContext = async (context: FlagsEvaluationContext) => {
    ensureProvider();
    await strategy.syncContext?.(context);
    await OpenFeature.setContext(context);
  };

  const clearContext = async () => {
    ensureProvider();
    await strategy.syncContext?.(null);
    await OpenFeature.setContext({});
  };

  const FlagsProvider = ({ children }: FlagsProviderProps) => {
    ensureProvider();
    return <OpenFeatureProvider>{children}</OpenFeatureProvider>;
  };

  return {
    FlagsProvider,
    setContext,
    clearContext,
  };
};

export {
  useBooleanFlagValue,
  useStringFlagValue,
  useNumberFlagValue,
  useObjectFlagValue,
};
