import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { Hono } from "hono";

import { enforceAuth } from "../../middleware";

import type { UIMessage } from "ai";

export const aiRouter = new Hono().post("/chat", enforceAuth, async (c) => {
  const { messages }: { messages: UIMessage[] } = await c.req.json();

  const result = streamText({
    model: openai.responses("gpt-4.1-nano"),
    messages: await convertToModelMessages(messages),
  });

  const stream = toUIMessageStream({
    stream: result.stream,
    originalMessages: messages,
  });

  return createUIMessageStreamResponse({ stream });
});
