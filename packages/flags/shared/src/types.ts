import type { Provider as ServerProvider } from "@openfeature/server-sdk";
import type {
  EvaluationContext,
  Provider as WebProvider,
} from "@openfeature/web-sdk";

export type FlagsEvaluationContext = EvaluationContext;

export interface FlagsClientStrategy {
  getProvider: () => WebProvider;
  syncContext?: (
    context: FlagsEvaluationContext | null,
  ) => void | Promise<void>;
}

export interface FlagsServerStrategy {
  getProvider: () => ServerProvider;
}
