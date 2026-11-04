import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "./e2e/env";
import { authStatePath } from "./e2e/constants";

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  globalSetup: "./e2e/setup/global-setup.ts",
  reporter: isCI
    ? [
        ["html", { open: "never", outputFolder: "./e2e/playwright-report" }],
        ["github"],
      ]
    : [
        [
          "html",
          { open: "on-failure", outputFolder: "./e2e/playwright-report" },
        ],
        ["list"],
      ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /setup\/.*\.setup\.ts/,
    },
    {
      name: "chrome-extension",
      testMatch: /specs\/.*\.spec\.ts/,
      testIgnore: /specs\/.*\.authenticated\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chrome-extension-authenticated",
      testMatch: /specs\/.*\.authenticated\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authStatePath,
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm with-env pnpm turbo build --filter=web && pnpm --filter web start -H localhost -p ${PORT}`,
        cwd: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "../..",
        ),
        reuseExistingServer: !isCI,
        url: `${baseURL}/api/status`,
        timeout: 300_000,
      },
});
