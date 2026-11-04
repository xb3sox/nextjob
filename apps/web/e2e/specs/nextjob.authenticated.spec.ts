import { expect, test } from "@playwright/test";

import { pathsConfig } from "~/config/paths";

test("user can navigate across Today, Find Jobs, My Career, and Applications workspaces", async ({
  page,
}) => {
  await page.goto(pathsConfig.dashboard.user.index);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto(pathsConfig.dashboard.user.jobs);
  await expect(page).toHaveURL(/\/dashboard\/jobs/);

  await page.goto(pathsConfig.dashboard.user.career);
  await expect(page).toHaveURL(/\/dashboard\/career/);

  await page.goto(pathsConfig.dashboard.user.applications);
  await expect(page).toHaveURL(/\/dashboard\/applications/);
});

test("Arabic locale renders RTL layout direction on dashboard", async ({
  page,
}) => {
  await page.goto("/ar/dashboard");
  await expect(page.locator('[dir="rtl"]').first()).toBeVisible();
});
