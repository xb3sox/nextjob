import { statusMonitor } from "hono-status-monitor";

import { db } from "@workspace/db/server";

const log = console.log;
console.log = () => {};

export const monitor: ReturnType<typeof statusMonitor> = statusMonitor({
  healthCheck: async () => {
    const start = performance.now();
    await db.execute(`SELECT 1`);
    return {
      connected: true,
      latencyMs: performance.now() - start,
    };
  },
});

console.log = log;
