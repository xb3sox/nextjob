import type { Page } from "@playwright/test";

/**
 * Auto-dismiss the c15t consent banner when it would intercept clicks.
 * Cache Components keeps overlays more sticky across navigations, so auth
 * flows need this for reliable submit clicks.
 */
export const installConsentBannerHandler = async (page: Page) => {
  await page.addLocatorHandler(
    page.getByTestId("consent-banner-root"),
    async () => {
      await page.getByRole("button", { name: "Accept All" }).click();
    },
  );
};
