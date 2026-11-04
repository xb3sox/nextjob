import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "./e2e/env";
import { authStatePath } from "./e2e/constants";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

const browsers = [
  { name: "chrome", device: "Desktop Chrome" },
  { name: "firefox", device: "Desktop Firefox" },
  { name: "safari", device: "Desktop Safari" },
] as const;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
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
  projects: browsers.flatMap(({ name, device }) => [
    {
      name: `${name}-setup`,
      testMatch: /setup\/.*\.setup\.ts/,
      use: { ...devices[device] },
    },
    {
      name,
      testMatch: /specs\/.*\.spec\.ts/,
      testIgnore: /specs\/.*\.authenticated\.spec\.ts/,
      use: { ...devices[device] },
    },
    {
      name: `${name}-authenticated`,
      testMatch: /specs\/.*\.authenticated\.spec\.ts/,
      dependencies: [`${name}-setup`],
      use: {
        ...devices[device],
        storageState: authStatePath,
      },
    },
  ]),
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm with-env pnpm turbo build --filter=web && pnpm --filter web start -H localhost -p ${PORT}`,
        cwd: repoRoot,
        reuseExistingServer: !isCI,
        url: `${baseURL}/api/status`,
        timeout: 300_000,
      },
});
