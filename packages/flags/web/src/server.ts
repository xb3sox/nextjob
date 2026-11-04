import { createFlagsServer } from "@workspace/flags/server";

import { strategy } from "./providers/server";

export const {
  getBooleanValue,
  getStringValue,
  getNumberValue,
  getObjectValue,
} = createFlagsServer(strategy);
