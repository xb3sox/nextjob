"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@workspace/ui-web/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui-web/card";
import { Switch } from "@workspace/ui-web/switch";

interface AutomationModeCardProps {
  initialMode?: "review_first" | "auto_apply";
  initialCap?: number;
  initialThreshold?: number;
  onUpdate?: (settings: {
    automationMode: "review_first" | "auto_apply";
    dailyApplicationCap: number;
    autoApplyMinMatchScore: number;
  }) => void;
}

export const AutomationModeCard = ({
  initialMode = "review_first",
  initialCap = 15,
  initialThreshold = 85,
  onUpdate,
}: AutomationModeCardProps) => {
  const [mode, setMode] = useState<"review_first" | "auto_apply">(initialMode);
  const [cap, setCap] = useState(initialCap);
  const [threshold, setThreshold] = useState(initialThreshold);
  const [isSaved, setIsSaved] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const triggerSavedFeedback = () => {
    setIsSaved(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setIsSaved(false), 2000);
  };

  const isAutoApply = mode === "auto_apply";

  const handleToggle = (checked: boolean) => {
    const nextMode = checked ? "auto_apply" : "review_first";
    setMode(nextMode);
    onUpdate?.({
      automationMode: nextMode,
      dailyApplicationCap: cap,
      autoApplyMinMatchScore: threshold,
    });
    triggerSavedFeedback();
  };

  const handleCapChange = (newCap: number) => {
    setCap(newCap);
    onUpdate?.({
      automationMode: mode,
      dailyApplicationCap: newCap,
      autoApplyMinMatchScore: threshold,
    });
    triggerSavedFeedback();
  };

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    onUpdate?.({
      automationMode: mode,
      dailyApplicationCap: cap,
      autoApplyMinMatchScore: newThreshold,
    });
    triggerSavedFeedback();
  };

  return (
    <Card className="border-border/60 from-card to-muted/20 rounded-2xl bg-gradient-to-b shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground text-sm font-bold">
              Application Mode
            </CardTitle>
            <Badge
              variant="outline"
              className={
                isAutoApply
                  ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground border-border text-[10px]"
              }
            >
              {isAutoApply ? "Autonomous Auto-Apply" : "Review Mode (Default)"}
            </Badge>
            {isSaved && (
              <span className="text-[11px] font-medium text-emerald-600 transition-opacity dark:text-emerald-400">
                ✓ Saved
              </span>
            )}
          </div>
          <CardDescription className="text-xs">
            {isAutoApply
              ? "Agent automatically submits when job matches your threshold."
              : "Agent prepares tailored applications and waits for your 1-click review."}
          </CardDescription>
        </div>

        <Switch
          checked={isAutoApply}
          onCheckedChange={handleToggle}
          aria-label="Toggle autonomous auto-apply"
        />
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0 text-xs">
        {/* Sliders / controls */}
        <div className="border-border/40 grid grid-cols-1 gap-4 border-t pt-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">
                Daily Application Cap:
              </span>
              <span className="text-foreground font-mono font-bold">
                {cap} apps / day
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[5, 15, 30, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={cap === val}
                  onClick={() => handleCapChange(val)}
                  className={`flex-1 cursor-pointer rounded-md border py-1 font-mono text-xs font-medium transition-all ${
                    cap === val
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">
                Min Match Score:
              </span>
              <span className="text-foreground font-mono font-bold">
                {threshold}%+ match
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[75, 80, 85, 90].map((val) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={threshold === val}
                  onClick={() => handleThresholdChange(val)}
                  className={`flex-1 cursor-pointer rounded-md border py-1 font-mono text-xs font-medium transition-all ${
                    threshold === val
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Supported ATS feeds */}
        <div className="bg-background/80 border-border/50 text-muted-foreground flex items-center justify-between rounded-xl border px-3 py-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500/80" />
            <span>Supported Job Feeds</span>
          </div>
          <span className="text-foreground font-mono font-semibold">
            Remotive • Greenhouse • Lever
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
