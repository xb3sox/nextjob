import {
  test as base,
  chromium,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { readFileSync } from "node:fs";

import { extensionBuildPath } from "../constants";

interface ExtensionFixtures {
  context: BrowserContext;
  extensionId: string;
  popupPage: Page;
}

interface StorageState {
  cookies?: Parameters<BrowserContext["addCookies"]>[0];
  origins?: {
    origin: string;
    localStorage: { name: string; value: string }[];
  }[];
}

const applyStorageState = async (
  context: BrowserContext,
  storageState: string | StorageState | undefined,
) => {
  if (!storageState) {
    return;
  }

  const state =
    typeof storageState === "string"
      ? (JSON.parse(readFileSync(storageState, "utf8")) as StorageState)
      : storageState;

  if (state.cookies?.length) {
    await context.addCookies(state.cookies);
  }

  if (state.origins?.length) {
    for (const origin of state.origins) {
      const page = await context.newPage();
      await page.goto(origin.origin);
      await page.evaluate((items) => {
        for (const item of items) {
          localStorage.setItem(item.name, item.value);
        }
      }, origin.localStorage);
      await page.close();
    }
  }
};

export const test = base.extend<ExtensionFixtures>({
  context: async ({ storageState }, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      headless: false,
      args: [
        `--disable-extensions-except=${extensionBuildPath}`,
        `--load-extension=${extensionBuildPath}`,
        ...(process.env.CI ? ["--no-sandbox"] : []),
      ],
    });

    await applyStorageState(context, storageState);

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();

    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker", {
        timeout: 15_000,
      });
    }

    const [, , extensionId] = serviceWorker.url().split("/");

    if (!extensionId) {
      throw new Error("Could not resolve extension id from service worker URL");
    }

    await use(extensionId);
  },
  popupPage: async ({ context, extensionId }, use) => {
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.waitForLoadState("domcontentloaded");
    await use(popup);
    await popup.close();
  },
});
