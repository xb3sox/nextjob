import { expect } from "@playwright/test";

import { e2eUser } from "../constants";
import { test } from "../fixtures/extension";
import { LoginPage } from "../pages/login.page";
import { PopupPage } from "../pages/popup.page";

test.describe.configure({ mode: "serial" });

test("user can sign in from the popup via the web app", async ({
  context,
  popupPage,
  extensionId,
}) => {
  const popup = new PopupPage(popupPage, extensionId);

  await popup.waitForReady();
  await expect(popup.signInLink()).toBeVisible();

  const loginPagePromise = context.waitForEvent("page");
  await popup.signInLink().click();

  const loginPage = await loginPagePromise;
  const login = new LoginPage(loginPage);

  await login.waitForReady();
  await login.signIn(e2eUser.email, e2eUser.password);
  await login.waitForDashboard();
  await loginPage.close();

  await popupPage.reload();
  await expect(popup.userMenu()).toBeVisible({ timeout: 15_000 });
});
