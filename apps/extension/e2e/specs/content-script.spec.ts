import { expect } from "@playwright/test";

import { test } from "../fixtures/extension";

test("content script injects UI on a web page", async ({ context }) => {
  const page = await context.newPage();
  const contentScriptButton = page.getByRole("button", {
    name: "Content script UI",
  });

  await page.goto("https://example.com");
  await expect(contentScriptButton).toBeVisible({ timeout: 15_000 });

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toBe("This is injected UI!");
    void dialog.accept();
  });

  await contentScriptButton.click();
  await page.close();
});
