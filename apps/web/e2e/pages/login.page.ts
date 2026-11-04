import { expect, type Page } from "@playwright/test";

import { pathsConfig } from "~/config/paths";

import { installConsentBannerHandler } from "../helpers/consent";

const LOGIN_TABS = {
  password: "Password",
  magicLink: "Magic link",
  emailOtp: "OTP",
} as const;

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await installConsentBannerHandler(this.page);
    await this.page.goto(pathsConfig.auth.login);
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  async waitForReady() {
    await expect(
      this.page.getByRole("heading", { name: "Welcome back! 👋" }),
    ).toBeVisible();
  }

  async selectTab(tab: keyof typeof LOGIN_TABS) {
    await this.page.getByRole("tab", { name: LOGIN_TABS[tab] }).click();
  }

  async signIn(email: string, password: string) {
    await this.selectTab("password");
    await this.page.locator("#password-login-email").fill(email);
    await this.page.locator("#password-login-password").fill(password);
    await this.page
      .locator("#password-login-form button[type='submit']")
      .click();
  }

  async requestMagicLink(email: string) {
    await this.selectTab("magicLink");
    await this.page.locator("#magic-link-login-email").fill(email);
    await this.page
      .locator("#magic-link-login-form button[type='submit']")
      .click();
    await expect(
      this.page.getByRole("heading", { name: "Success!" }),
    ).toBeVisible();
  }

  async requestEmailOtp(email: string) {
    await this.selectTab("emailOtp");
    await this.page.locator("#email-otp-login-email").fill(email);
    await this.page
      .locator("#email-otp-login-form button[type='submit']")
      .click();
    await expect(
      this.page.getByText(/We sent a 6-digit code to/),
    ).toBeVisible();
  }

  async verifyEmailOtp(otp: string) {
    const otpInput = this.page.locator('input[autocomplete="one-time-code"]');
    await otpInput.fill(otp);
  }
}
