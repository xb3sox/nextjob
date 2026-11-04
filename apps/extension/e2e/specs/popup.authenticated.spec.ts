import { expect } from "@playwright/test";

import { test } from "../fixtures/extension";
import { PopupPage } from "../pages/popup.page";

test("authenticated popup shows the user menu", async ({
  popupPage,
  extensionId,
}) => {
  const popup = new PopupPage(popupPage, extensionId);

  await popup.open();
  await popup.waitForReady();
  await expect(popup.userMenu()).toBeVisible({ timeout: 15_000 });
});
