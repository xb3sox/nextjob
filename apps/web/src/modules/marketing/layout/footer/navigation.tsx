"use client";

import { ConsentDialogLink } from "@c15t/nextjs";

import { useTranslation } from "@workspace/i18n";
import { isExternal } from "@workspace/shared/utils";
import { Icons } from "@workspace/ui-web/components/icons";

import { pathsConfig } from "~/config/paths";
import { TurboLink } from "~/modules/common/turbo-link";

const links = [
  {
    label: "common:product",
    items: [
      {
        title: "marketing:product.mobile.ios.title",
        href: "https://apps.apple.com/app/id6754278899",
      },
      {
        title: "marketing:product.mobile.android.title",
        href: "https://play.google.com/store/apps/details?id=com.turbostarter.core",
      },
      {
        title: "marketing:product.extension.chrome.title",
        href: "https://chromewebstore.google.com/detail/bcjmonmlfbnngpkllpnpmnjajaciaboo",
      },
      {
        title: "marketing:product.extension.firefox.title",
        href: "https://addons.mozilla.org/addon/turbostarter_",
      },
      {
        title: "marketing:product.extension.edge.title",
        href: "https://microsoftedge.microsoft.com/addons/detail/turbostarter/ianbflanmmoeleokihabnmmcahhfijig",
      },
    ],
  },
  {
    label: "resources",
    items: [
      {
        title: "marketing:contact.label",
        href: pathsConfig.marketing.contact,
      },
      {
        title: "marketing:roadmap.title",
        href: "https://github.com/orgs/turbostarter/projects/1",
      },
      {
        title: "marketing:docs.title",
        href: "https://www.turbostarter.dev/docs/web",
      },
      {
        title: "marketing:api.title",
        href: "#",
      },
    ],
  },
  {
    label: "about",
    items: [
      {
        title: "billing:pricing.label",
        href: pathsConfig.marketing.pricing,
      },
      {
        title: "marketing:blog.label",
        href: pathsConfig.marketing.blog.index,
      },
    ],
  },
  {
    label: "legal.label",
    items: [
      {
        title: "legal.privacy",
        href: pathsConfig.marketing.legal("privacy-policy"),
      },
      {
        title: "legal.cookiePolicy",
        href: pathsConfig.marketing.legal("cookie-policy"),
      },
      {
        title: "legal.terms",
        href: pathsConfig.marketing.legal("terms-and-conditions"),
      },
      {
        title: "legal.cookies",
        component: ConsentDialogLink,
      },
    ],
  },
] as const;

export const FooterNavigation = () => {
  const { t } = useTranslation(["common", "marketing", "billing"]);

  return (
    <div className="mt-1 grid w-full max-w-200 grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
      {links.map((link) => (
        <div className="flex w-full flex-col gap-5" key={link.label}>
          <span className="text-foreground text-sm font-medium">
            {t(link.label)}
          </span>
          <nav>
            <ul className="flex flex-col gap-3">
              {link.items.map((item) => (
                <li
                  key={item.title}
                  className="text-muted-foreground hover:text-foreground relative text-sm transition-colors"
                >
                  {"component" in item ? (
                    <item.component className="cursor-pointer">
                      {t(item.title)}
                    </item.component>
                  ) : (
                    <TurboLink href={item.href}>
                      {t(item.title)}
                      {isExternal(item.href) && (
                        <Icons.ArrowUpRight className="-mt-1 inline size-2.5" />
                      )}
                    </TurboLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ))}
    </div>
  );
};
