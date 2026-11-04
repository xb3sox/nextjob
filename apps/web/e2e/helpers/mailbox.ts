import { mailpitUrl } from "../constants";

interface MailpitSearchResponse {
  messages: { ID: string; Subject: string }[];
}

interface MailpitMessageResponse {
  HTML: string;
  Text: string;
  Subject: string;
}

const mailpitApi = (path: string) => `${mailpitUrl}/api/v1${path}`;

export const clearMailbox = async () => {
  await fetch(mailpitApi("/messages"), { method: "DELETE" });
};

const searchMessages = async (email: string) => {
  const query = encodeURIComponent(`to:"${email}"`);
  const response = await fetch(mailpitApi(`/search?query=${query}&limit=1`));

  if (!response.ok) {
    throw new Error(`Mailpit search failed: ${response.status}`);
  }

  const data = (await response.json()) as MailpitSearchResponse;
  return data.messages;
};

const getMessage = async (id: string) => {
  const response = await fetch(mailpitApi(`/message/${id}`));

  if (!response.ok) {
    throw new Error(`Mailpit message fetch failed: ${response.status}`);
  }

  return (await response.json()) as MailpitMessageResponse;
};

export const waitForEmailHtml = async (
  email: string,
  options?: { subject?: string },
) => {
  const messages = await searchMessages(email);
  const message = messages.at(0);

  if (!message) {
    return null;
  }

  if (options?.subject && !message.Subject.includes(options.subject)) {
    return null;
  }

  const full = await getMessage(message.ID);
  return full.HTML;
};

export const extractMagicLink = (html: string) => {
  const hrefMatch = html.match(
    /href="([^"]*\/api\/auth\/magic-link\/verify[^"]*)"/,
  );
  if (hrefMatch?.[1]) {
    return hrefMatch[1].replace(/&amp;/g, "&");
  }

  const textMatch = html.match(
    /https?:\/\/[^\s<"]+\/api\/auth\/magic-link\/verify[^\s<"]*/,
  );
  return textMatch?.[0] ?? null;
};

export const extractOtp = (html: string) => {
  const match = html.match(/\b(\d{6})\b/);
  return match?.[1] ?? null;
};
