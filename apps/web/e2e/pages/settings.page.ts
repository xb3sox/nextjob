import { expect, type Page } from "@playwright/test";

import { pathsConfig } from "~/config/paths";

export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(pathsConfig.dashboard.user.settings.index);
    await expect(this.page).toHaveURL(/\/dashboard\/settings/);
  }

  async waitForReady() {
    await expect(
      this.page
        .getByRole("navigation", { name: "breadcrumb" })
        .getByText("Settings"),
    ).toBeVisible();
    await expect(this.page.locator("#user-edit-name")).toBeVisible();
  }
}
