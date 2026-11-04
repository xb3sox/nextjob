import { expect, test } from "@playwright/test";

import { e2eUser } from "../constants";
import {
  clearMailbox,
  extractMagicLink,
  extractOtp,
  waitForEmailHtml,
} from "../helpers/mailbox";
import { DashboardPage } from "../pages/dashboard.page";
import { LoginPage } from "../pages/login.page";

test.describe.configure({ mode: "serial" });

test.describe("sign in", () => {
  test("user can sign in with email and password", async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await login.goto();
    await login.waitForReady();
    await login.signIn(e2eUser.email, e2eUser.password);
    await dashboard.waitForReady();
  });

  test("user can sign in with a magic link", async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await clearMailbox();
    await login.goto();
    await login.waitForReady();
    await login.requestMagicLink(e2eUser.email);

    await expect(async () => {
      const html = await waitForEmailHtml(e2eUser.email, {
        subject: "magic link",
      });
      expect(html).toBeTruthy();

      const link = extractMagicLink(html!);
      expect(link).toBeTruthy();
      await page.goto(link!);
    }).toPass();

    await dashboard.waitForReady();
  });

  test("user can sign in with an email otp", async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await clearMailbox();
    await login.goto();
    await login.waitForReady();
    await login.requestEmailOtp(e2eUser.email);

    await expect(async () => {
      const html = await waitForEmailHtml(e2eUser.email, {
        subject: "login code",
      });
      expect(html).toBeTruthy();

      const otp = extractOtp(html!);
      expect(otp).toBeTruthy();
      await login.verifyEmailOtp(otp!);
    }).toPass();

    await dashboard.waitForReady();
  });
});
