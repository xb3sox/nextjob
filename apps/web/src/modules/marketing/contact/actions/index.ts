"use server";

import { EmailTemplate } from "@workspace/email";
import { sendEmail } from "@workspace/email/server";
import { logger } from "@workspace/shared/logger";

import { getTranslation } from "~/lib/i18n";

import env from "../../../../../env.config";
import { contactFormSchema } from "../utils/schema";

export const sendContactForm = async (data: unknown) => {
  const { t } = await getTranslation({ ns: "common" });

  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t("error.invalid") };
  }

  try {
    await sendEmail({
      to: env.CONTACT_EMAIL,
      template: EmailTemplate.CONTACT_FORM,
      variables: parsed.data,
    });
    return { error: null };
  } catch (error) {
    logger.error(error);
    return { error: t("error.general") };
  }
};
