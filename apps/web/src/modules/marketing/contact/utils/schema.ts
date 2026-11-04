import * as z from "zod";

export const MAX_NAME_LENGTH = 100;
export const MAX_MESSAGE_LENGTH = 4000;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(MAX_NAME_LENGTH),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(MAX_MESSAGE_LENGTH),
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;
