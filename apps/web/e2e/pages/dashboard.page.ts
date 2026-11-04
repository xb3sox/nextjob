import { expect, type Page } from "@playwright/test";

import { pathsConfig } from "~/config/paths";

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(pathsConfig.dashboard.user.index);
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async waitForReady() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(
      this.page
        .getByRole("navigation", { name: "breadcrumb" })
        .getByRole("link", { name: "Home" }),
    ).toBeVisible();
  }
}
