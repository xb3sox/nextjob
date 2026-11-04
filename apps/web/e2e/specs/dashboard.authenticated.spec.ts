import { expect, test } from "@playwright/test";

import { e2eUser } from "../constants";
import { SettingsPage } from "../pages/settings.page";

test("user can open account settings with a persisted session", async ({
  page,
}) => {
  const settings = new SettingsPage(page);

  await settings.goto();
  await settings.waitForReady();

  const expectedName = e2eUser.email.split("@")[0] ?? "";
  await expect(page.locator("#user-edit-name")).toHaveValue(expectedName);
});
