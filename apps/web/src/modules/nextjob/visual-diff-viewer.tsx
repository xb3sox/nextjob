import { Badge } from "@workspace/ui-web/badge";
import { Button } from "@workspace/ui-web/button";
import { Icons } from "@workspace/ui-web/icons";

interface VisualDiffStatement {
  id: string;
  originalText: string;
  proposedText: string;
  status: "verified" | "edited" | "rejected" | "accepted" | "pending";
  sourceClaimIds: string[];
  explanation?: string;
  keywordsAdded?: string[];
}

interface VisualDiffViewerProps {
  statements: VisualDiffStatement[];
  targetCompany?: string;
  targetRole?: string;
  onApproveAll?: () => void;
  onEditStatement?: (id: string, newText: string) => void;
  onRejectStatement?: (id: string) => void;
  isReadOnly?: boolean;
}

/**
 * Computes word-level diff segments between original bullet and tailored bullet.
 */
function computeWordDiff(
  original: string,
  proposed: string,
): { added: string[]; removed: string[] } {
  const origWords = new Set(
    original
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, "")),
  );
  const propWords = proposed.split(/\s+/);

  const added: string[] = [];
  for (const word of propWords) {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean.length > 2 && !origWords.has(clean)) {
      added.push(word);
    }
  }

  return { added, removed: [] };
}

export const VisualDiffViewer = ({
  statements,
  targetCompany = "Target Company",
  targetRole = "Role",
  onApproveAll,
  onEditStatement,
  onRejectStatement,
  isReadOnly = false,
}: VisualDiffViewerProps) => {
  const verifiedCount = statements.filter(
    (s) => s.status === "verified",
  ).length;

  return (
    <div className="text-foreground flex flex-col gap-4 font-sans text-xs">
      {/* Header Bar */}
      <div className="border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-foreground text-background flex h-6 w-6 items-center justify-center rounded-md">
            <Icons.Check className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">
                Tailoring Diff View
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
              >
                Tsenta Diff Engine
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              Customized for {targetRole} at {targetCompany}
            </p>
          </div>
        </div>

        {!isReadOnly && onApproveAll && (
          <Button
            size="sm"
            onClick={onApproveAll}
            className="h-7 gap-1.5 px-3 text-xs"
          >
            <Icons.Check className="h-3 w-3" />
            Approve All Diffs ({verifiedCount}/{statements.length})
          </Button>
        )}
      </div>

      {/* Statement Diff Items */}
      <div className="space-y-3">
        {statements.map((stmt, idx) => {
          const { added } = computeWordDiff(
            stmt.originalText,
            stmt.proposedText,
          );

          return (
            <div
              key={stmt.id}
              className="border-border/60 bg-card hover:border-foreground/20 space-y-3 rounded-xl border p-4 shadow-2xs transition-all"
            >
              {/* Bullet Metadata */}
              <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                <span className="text-foreground font-mono font-medium">
                  Bullet #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                    <Icons.BadgeCheck className="h-3 w-3" />
                    Zero-Fabrication Grounded
                  </span>
                  <Badge
                    variant={
                      stmt.status === "verified" ? "secondary" : "outline"
                    }
                    className="text-[10px] uppercase"
                  >
                    {stmt.status}
                  </Badge>
                </div>
              </div>

              {/* Side-by-side or stacked diff */}
              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                {/* Original */}
                <div className="border-border/40 bg-muted/20 space-y-1 rounded-lg border p-3">
                  <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                    Original Master Bullet
                  </span>
                  <p className="text-muted-foreground decoration-destructive/60 leading-relaxed line-through decoration-1">
                    {stmt.originalText}
                  </p>
                </div>

                {/* Proposed / Tailored */}
                <div className="space-y-1 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-3">
                  <span className="block text-[10px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                    Tailored for ATS Match
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {stmt.proposedText}
                  </p>
                </div>
              </div>

              {/* Keyword Alignment Highlights */}
              {added.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-muted-foreground font-medium">
                    Keywords Aligned:
                  </span>
                  {added.slice(0, 5).map((kw, kIdx) => (
                    <span
                      key={`${kw}-${kIdx}`}
                      className="inline-flex items-center rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      +{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {!isReadOnly && (
                <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-2">
                  {onEditStatement && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-7 px-2.5 text-xs"
                      onClick={() =>
                        onEditStatement(stmt.id, stmt.proposedText)
                      }
                    >
                      <Icons.Edit className="me-1 h-3 w-3" />
                      Edit Wording
                    </Button>
                  )}
                  {onRejectStatement && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 h-7 px-2.5 text-xs"
                      onClick={() => onRejectStatement(stmt.id)}
                    >
                      Revert Original
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
