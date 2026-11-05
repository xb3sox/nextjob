/* oxlint-disable i18next/no-literal-string */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      text: "NextJob Assistant ready. Share a promotion, new skill, or project. I will propose a verified update for your profile.",
    },
  ]);

  const QUICK_PROMPTS = [
    "Promoted to Senior Staff Engineer",
    "Added Next.js 16 and AI SDK to stack",
    "AWS Solutions Architect certification",
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/nextjob/career/conversational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = (await res.json()) as { assistantReply: string };
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
            text: "Could not update career claims. Please ensure you are signed in.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendPrompt(prompt.trim());
  };

  return (
    <div className="fixed end-5 bottom-5 z-50">
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="NextJob Career Assistant"
          className="bg-background/95 border-border/80 flex w-80 flex-col overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md transition-all sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-foreground text-xs font-semibold">
                Career Copilot
              </span>
              <span className="text-muted-foreground/60 text-xs">•</span>
              <span className="text-muted-foreground font-mono text-[10px]">
                Esc to close
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
              aria-label="Close Assistant"
            >
              <Icons.X className="size-3.5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto p-4 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-background ms-6 font-medium"
                    : "bg-muted/40 border-border/60 text-foreground me-6 border"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="text-muted-foreground flex items-center gap-2 py-1 text-xs">
                <Icons.Brain className="text-foreground size-3.5 animate-pulse" />
                <span>Checking claims and proposing diff...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="border-border/40 border-t px-3 py-2">
              <div className="flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => void handleSendPrompt(p)}
                    className="border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer rounded-md border px-2 py-0.5 text-[10px] transition-colors"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="bg-muted/10 flex items-center gap-2 border-t p-2.5"
          >
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Promoted to Tech Lead..."
              className="bg-background h-8 text-xs"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 shrink-0 cursor-pointer px-2.5"
              disabled={isLoading || !prompt.trim()}
              aria-label="Send"
            >
              <Icons.SendHorizontal className="size-3.5" />
            </Button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-foreground text-background hover:bg-foreground/90 flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium shadow-md transition-all duration-150"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span>Copilot</span>
        </button>
      )}
    </div>
  );
};
