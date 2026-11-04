"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Streamdown } from "streamdown";

import { useTranslation } from "@workspace/i18n";
import { Bubble, BubbleContent } from "@workspace/ui-web/bubble";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@workspace/ui-web/input-group";
import { Marker, MarkerContent } from "@workspace/ui-web/marker";
import { Message, MessageContent } from "@workspace/ui-web/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui-web/message-scroller";

import { api } from "~/lib/api/client";

import type { KeyboardEvent } from "react";

const EXAMPLES = [
  {
    icon: Icons.Globe2,
    prompt: "ai.prompt.history",
  },
  {
    icon: Icons.GraduationCap,
    prompt: "ai.prompt.capitals",
  },
  {
    icon: Icons.Atom,
    prompt: "ai.prompt.quantum",
  },
  {
    icon: Icons.Brain,
    prompt: "ai.prompt.realWorld",
  },
] as const;

export const AIDemo = () => {
  const { t } = useTranslation("marketing");
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: api.ai.chat.$url().toString(),
    }),
  });

  const messagesToDisplay = messages.filter((message) =>
    ["assistant", "user"].includes(message.role),
  );

  const isLoading = ["submitted", "streaming"].includes(status);
  const isEmpty = !messagesToDisplay.length && !isLoading;

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    void sendMessage({ text: value });
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(input);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100svh-var(--banner-height,0px)-7.5rem)] w-full max-w-2xl flex-col gap-4 self-stretch">
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-4 py-2">
              {messagesToDisplay.map((message) => {
                const isUser = message.role === "user";

                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={isUser}
                  >
                    <Message align={isUser ? "end" : "start"}>
                      <MessageContent>
                        <Bubble variant={isUser ? "muted" : "ghost"}>
                          <BubbleContent>
                            {message.parts.map((part, i) => {
                              if (part.type !== "text") return null;

                              return isUser ? (
                                <span key={`${message.id}-${i}`}>
                                  {part.text}
                                </span>
                              ) : (
                                <div
                                  key={`${message.id}-${i}`}
                                  className="typeset typeset-chat"
                                >
                                  <Streamdown>{part.text}</Streamdown>
                                </div>
                              );
                            })}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
              {isLoading && (
                <MessageScrollerItem messageId="status">
                  <Marker role="status">
                    <MarkerContent className="shimmer text-base">
                      {t("ai.thinking")}
                    </MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {isEmpty && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {EXAMPLES.map((example) => (
            <Button
              onClick={() => submit(t(example.prompt))}
              key={example.prompt}
              variant="outline"
              className="text-muted-foreground h-auto grow flex-col items-start gap-2 py-3 text-left whitespace-normal"
            >
              <example.icon className="size-5 shrink-0" />
              {t(example.prompt)}
            </Button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="bg-background w-full"
      >
        <InputGroup>
          <InputGroupTextarea
            placeholder={t("ai.placeholder")}
            className="min-h-12 text-base"
            rows={3}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            value={input}
            autoFocus
            onChange={(event) => setInput(event.currentTarget.value)}
          />
          <InputGroupAddon align="block-end" className="justify-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={isLoading || !input.trim()}
              aria-label={t("ai.cta")}
            >
              <Icons.ArrowUp className="size-5" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
};
