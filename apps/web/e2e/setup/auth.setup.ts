import { test as setup } from "@playwright/test";

import { authStatePath, e2eUser } from "../constants";
import { DashboardPage } from "../pages/dashboard.page";
import { LoginPage } from "../pages/login.page";

setup("authenticate as a user", async ({ page }) => {
  const login = new LoginPage(page);
  const dashboard = new DashboardPage(page);

  await login.goto();
  await login.signIn(e2eUser.email, e2eUser.password);
  await dashboard.waitForReady();

  await page.context().storageState({ path: authStatePath });
});
