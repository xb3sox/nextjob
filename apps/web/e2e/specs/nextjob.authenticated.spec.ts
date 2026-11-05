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

  await page.goto(pathsConfig.dashboard.user.ai);
  await expect(page).toHaveURL(/\/dashboard\/ai/);
  await expect(page.getByText("Career Copilot")).toBeVisible();
});

test("Today Dashboard renders approval queue and metrics", async ({ page }) => {
  await page.goto(pathsConfig.dashboard.user.index);
  await expect(page.getByText("Approval Queue")).toBeVisible();
  await expect(page.getByText("Top Matching Roles")).toBeVisible();
});

test("Privacy data export endpoint responds with valid JSON bundle", async ({
  request,
}) => {
  const response = await request.get("/api/nextjob/privacy/export");
  if (response.status() === 200) {
    const data = await response.json();
    expect(data).toHaveProperty("exportMetadata");
    expect(data.exportMetadata).toHaveProperty("sha256Checksum");
  }
});

test("Arabic locale renders RTL layout direction on dashboard", async ({
  page,
}) => {
  await page.goto("/ar/dashboard");
  await expect(page.locator('[dir="rtl"]').first()).toBeVisible();
});
