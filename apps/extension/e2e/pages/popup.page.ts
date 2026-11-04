import { expect, type Page } from "@playwright/test";

import { e2eUser } from "../constants";

export class PopupPage {
  constructor(
    private readonly page: Page,
    private readonly extensionId: string,
  ) {}

  main() {
    return this.page.getByRole("main");
  }

  async open() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async waitForReady() {
    const main = this.main();

    await expect(main).toBeVisible();
    await expect(main.getByRole("link", { name: "Learn more" })).toBeVisible();
    await expect(main.getByText(/Edit .+ and save to reload\./)).toBeVisible({
      timeout: 15_000,
    });
  }

  signInLink() {
    return this.page.getByRole("link", { name: "Sign in" });
  }

  userMenu() {
    return this.page.getByRole("button", { name: e2eUser.name });
  }
}
