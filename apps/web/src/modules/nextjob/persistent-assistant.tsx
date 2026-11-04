"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";
import { Input } from "@workspace/ui-web/input";

export const PersistentCareerAssistant = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "assistant" | "user"; text: string }>
  >([
    {
      role: "assistant",
      text: "NextJob Career Assistant ready. Tell me about a promotion, new skill, or certification—I will propose a structured change for your explicit approval in My Career.",
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/nextjob/career/conversational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          assistantReply: string;
        };
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.assistantReply },
        ]);
        router.refresh();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Could not process career update. Please verify you are signed in.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-5 bottom-5 z-50">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="NextJob AI Career Assistant"
          className="bg-background border-border flex w-80 flex-col rounded-xl border shadow-xl sm:w-96"
        >
          <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Icons.Brain className="text-primary size-4" />
              <span className="text-xs font-bold">
                {"NextJob Career Assistant"}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {"Approval-Gated"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Career Assistant"
            >
              <Icons.X className="size-3.5" />
            </Button>
          </div>

          <div className="flex max-h-72 flex-col gap-2.5 overflow-y-auto p-4 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2.5 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-6"
                    : "bg-muted mr-6"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t p-3"
          >
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "I was promoted to Information Manager"'
              className="h-8 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              className="h-8"
              disabled={isLoading}
              aria-label="Send message to Career Assistant"
            >
              <Icons.SendHorizontal className="size-3.5" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg"
          size="sm"
        >
          <Icons.Brain className="size-4" />
          <span>{"Career AI Assistant"}</span>
        </Button>
      )}
    </div>
  );
};
