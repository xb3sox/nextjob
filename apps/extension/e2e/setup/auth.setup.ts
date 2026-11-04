import { test as setup } from "@playwright/test";

import { authStatePath, e2eUser } from "../constants";
import { LoginPage } from "../pages/login.page";

setup("authenticate as a user", async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();
  await login.waitForReady();
  await login.signIn(e2eUser.email, e2eUser.password);
  await login.waitForDashboard();

  await page.context().storageState({ path: authStatePath });
});
