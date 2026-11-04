import { createFlagsReact } from "@workspace/flags";

import { strategy } from "./providers";

export const { FlagsProvider, setContext, clearContext } =
  createFlagsReact(strategy);
