import { expect } from "@playwright/test";

import { test } from "../fixtures/extension";
import { PopupPage } from "../pages/popup.page";

test("popup renders and background messaging responds", async ({
  popupPage,
  extensionId,
}) => {
  const popup = new PopupPage(popupPage, extensionId);

  await popup.waitForReady();

  await expect(
    popupPage.getByRole("link", { name: "Learn more" }),
  ).toBeVisible();
  await expect(popup.main()).toContainText("app/popup");
});

test("popup shows sign-in affordance when logged out", async ({
  popupPage,
  extensionId,
}) => {
  const popup = new PopupPage(popupPage, extensionId);

  await popup.waitForReady();
  await expect(popup.signInLink()).toBeVisible();
});
