import dayjs from "dayjs";
import * as z from "zod";

import { initializeServerI18n } from ".";
import { env } from "../env";
import { getValidationLocale } from "../utils";

type LayoutOrPageComponent<Params> = React.ComponentType<Params>;

interface PageParams {
  locale?: string;
}

/**
 * Initializes server i18n from the `[locale]` route param only.
 * Do not fall back to cookies — that makes Cache Components routes request-bound.
 */
export function withI18n<Params extends object>(
  Component: LayoutOrPageComponent<Params>,
) {
  return async function I18nServerComponentWrapper(props: Params) {
    const routeParams =
      props && typeof props === "object" && "params" in props
        ? await (
            props as Params & {
              params: Promise<PageParams>;
            }
          ).params
        : undefined;

    const i18n = await initializeServerI18n({
      locale: routeParams?.locale ?? env.DEFAULT_LOCALE,
      defaultLocale: env.DEFAULT_LOCALE,
    });
    dayjs.locale(i18n.language);
    z.config(getValidationLocale(i18n.language)());

    return <Component {...props} />;
  };
}
