/* oxlint-disable react/set-state-in-effect */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui-web/card";
import { Icons } from "@workspace/ui-web/icons";
import { Input } from "@workspace/ui-web/input";

import { pathsConfig } from "~/config/paths";

interface MessageItem {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  proposedClaim?: {
    category: string;
    title: string;
    description: string;
  };
}

const CAREER_PROMPTS = [
  {
    icon: Icons.Brain,
    title: "Audit Career Profile",
    prompt:
      "Audit my verified career claims for gaps in Staff or Lead Engineer requirements.",
  },
  {
    icon: Icons.TrendingUp,
    title: "Add Promotion / Achievement",
    prompt:
      "I was promoted to Staff Software Engineer and led migration of 14 microservices to Next.js.",
  },
  {
    icon: Icons.Atom,
    title: "Add New Skill",
    prompt:
      "I built production AI agent systems with Next.js 16, TypeScript, and Vercel AI SDK.",
  },
  {
    icon: Icons.Key,
    title: "Target Role Alignment",
    prompt:
      "Refine my professional summary to target remote high-growth fintech companies.",
  },
] as const;

export const CareerCopilotWorkspace = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content:
        "Welcome to your NextJob Career Copilot. I analyze your verified career graph, suggest quantitative enhancements, and ensure zero-fabrication alignment across every job application.",
      timestamp: "",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [graphStats, setGraphStats] = useState({
    verifiedClaims: 0,
    completeness: 0,
    activeApplications: 0,
  });

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load real career stats
  const loadStats = useCallback(async () => {
    try {
      const [careerRes, appRes] = await Promise.all([
        fetch("/api/nextjob/career"),
        fetch("/api/nextjob/applications"),
      ]);
      if (careerRes.ok) {
        const rawCareer = (await careerRes.json()) as {
          claims?: { verificationStatus: string }[];
        };
        const verified = (rawCareer.claims || []).filter(
          (c) => c.verificationStatus === "verified",
        ).length;
        const total = (rawCareer.claims || []).length;
        const completeness =
          total > 0 ? Math.round((verified / total) * 100) : 100;
        let appCount = 0;
        if (appRes.ok) {
          const rawApps = (await appRes.json()) as {
            applications?: unknown[];
          };
          appCount = rawApps.applications?.length ?? 0;
        }
        setGraphStats({
          verifiedClaims: verified,
          completeness,
          activeApplications: appCount,
        });
      }
    } catch {
      // Fallback gracefully
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: MessageItem = {
      id: `user-${crypto.randomUUID()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/nextjob/career/conversational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          assistantReply: string;
          proposedUpdate?: {
            category: string;
            title: string;
            description: string;
          };
        };

        const assistantMessage: MessageItem = {
          id: `assistant-${crypto.randomUUID()}`,
          role: "assistant",
          content: data.assistantReply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          proposedClaim: data.proposedUpdate,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        router.refresh();
        void loadStats();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-err-${crypto.randomUUID()}`,
            role: "assistant",
            content:
              "Unable to update career claims. Please check your connection or authentication status.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${crypto.randomUUID()}`,
          role: "assistant",
          content: "Network error processing career update.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSendPrompt(inputPrompt);
  };

  return (
    <div className="bg-background flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Main Conversation Column */}
      <div className="border-border/50 flex flex-1 flex-col border-e">
        {/* Workspace Top Header */}
        <div className="border-border/50 flex h-14 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-lg">
              <Icons.Brain className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-foreground text-sm leading-none font-semibold tracking-tight">
                Career Copilot
              </h1>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Cryptographically Grounded Career Intelligence
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/20 bg-emerald-500/5 font-mono text-xs text-emerald-600 dark:text-emerald-400"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Zero-Fabrication Guard Active
          </Badge>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-br-none"
                    : "bg-muted/40 border-border/50 text-foreground rounded-bl-none border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.proposedClaim && (
                  <div className="border-border/60 bg-background/80 mt-3 rounded-lg border p-3 text-xs">
                    <div className="text-muted-foreground mb-1 flex items-center justify-between">
                      <span className="text-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Proposed Career Fact
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {msg.proposedClaim.category}
                      </Badge>
                    </div>
                    <p className="text-foreground font-medium">
                      {msg.proposedClaim.title}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {msg.proposedClaim.description}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          router.push(pathsConfig.dashboard.user.career)
                        }
                      >
                        <Icons.Check className="me-1 h-3 w-3" />
                        Inspect in Career Graph
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-muted-foreground mt-1 px-1 text-[10px]">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Icons.Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>
                Analyzing career claims against zero-fabrication rules...
              </span>
            </div>
          )}

          <div ref={scrollAnchorRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="border-border/40 bg-muted/10 border-t px-6 py-2">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-muted-foreground shrink-0 text-[11px] font-medium">
              Suggestions:
            </span>
            {CAREER_PROMPTS.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => handleSendPrompt(item.prompt)}
                disabled={isLoading}
                className="border-border/60 bg-background text-foreground/80 hover:text-foreground hover:bg-muted inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
              >
                <item.icon className="text-muted-foreground h-3 w-3" />
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-border/50 bg-background border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Copilot to audit claims, add a milestone, or align with a target role..."
              className="bg-muted/20 h-10 flex-1 text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="h-10 gap-1.5 px-4 text-xs font-medium"
            >
              <Icons.SendHorizontal className="h-3.5 w-3.5" />
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Right Column: Career Overview & Health */}
      <div className="hidden w-80 flex-col gap-4 overflow-y-auto p-5 lg:flex">
        <Card className="border-border/60 bg-muted/10 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Career Graph Health
            </CardTitle>
            <CardDescription className="text-xs">
              Verified Facts & Completeness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Profile Completeness
              </span>
              <span className="text-foreground font-mono text-xs font-bold">
                {graphStats.completeness}%
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${graphStats.completeness}%` }}
              />
            </div>

            <div className="border-border/40 grid grid-cols-2 gap-2 border-t pt-2 text-center">
              <div className="bg-background border-border/50 rounded-lg border p-2">
                <span className="text-foreground block font-mono text-base font-bold">
                  {graphStats.verifiedClaims}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  Verified Claims
                </span>
              </div>
              <div className="bg-background border-border/50 rounded-lg border p-2">
                <span className="text-foreground block font-mono text-base font-bold">
                  {graphStats.activeApplications}
                </span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  Active Apps
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/10 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Safety & Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 p-4 pt-1 text-xs">
            <div className="flex items-start gap-2">
              <Icons.BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong className="text-foreground">
                  Zero-Fabrication Guarantee:
                </strong>{" "}
                Every AI-tailored resume bullet requires 100% semantic
                entailment to a verified claim.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Icons.Key className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong className="text-foreground">SHA-256 Receipts:</strong>{" "}
                Every application is hashed and cryptographically sealed upon
                submission.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-auto space-y-2">
          <Button
            variant="outline"
            className="h-9 w-full justify-start text-xs"
            onClick={() => router.push(pathsConfig.dashboard.user.career)}
          >
            <Icons.BookOpen className="me-2 h-3.5 w-3.5" />
            View Full Career Graph
          </Button>
          <Button
            variant="outline"
            className="h-9 w-full justify-start text-xs"
            onClick={() => window.open("/api/nextjob/privacy/export", "_blank")}
          >
            <Icons.Download className="me-2 h-3.5 w-3.5" />
            Export My Data (GDPR Portability)
          </Button>
        </div>
      </div>
    </div>
  );
};
