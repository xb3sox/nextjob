import type { ApprovalDecision, ApprovalRequest } from '@nextjob/policy';
import type React from 'react';
import { useState } from 'react';

export interface ApprovalDialogProps {
  isOpen: boolean;
  request: ApprovalRequest | null;
  onDecision: (decision: ApprovalDecision, editedAnswer?: string) => void;
  onClose: () => void;
}

export function ApprovalDialog({
  isOpen,
  request,
  onDecision,
  onClose,
}: ApprovalDialogProps): React.ReactElement | null {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  if (!isOpen || !request) {
    return null;
  }

  const handleStartEdit = () => {
    setEditedText(request.proposedAnswer || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editedText.trim()) return;
    onDecision('edit', editedText.trim());
    setIsEditing(false);
  };

  const riskBadgeStyles =
    {
      sensitive: 'bg-red-950/80 text-red-400 border-red-800/60',
      high: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
      medium: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
      low: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
      unsupported: 'bg-zinc-900 text-zinc-400 border-zinc-700',
    }[request.riskLevel] || 'bg-zinc-900 text-zinc-300 border-zinc-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-desc"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded border ${riskBadgeStyles}`}
            >
              {request.riskLevel.toUpperCase()} Risk
            </span>
            <span className="text-xs text-zinc-400">Payload v{request.payloadVersion}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 rounded"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div>
            <h2
              id="approval-dialog-title"
              className="text-sm font-medium text-zinc-400 uppercase tracking-wider"
            >
              Application Question
            </h2>
            <p className="mt-1 text-base font-semibold text-zinc-100">{request.question}</p>
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Proposed Answer
            </span>
            {isEditing ? (
              <div className="mt-1.5 space-y-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 p-2.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  rows={3}
                  aria-label="Edit proposed answer"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editedText.trim()}
                    className="rounded bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-50"
                  >
                    Save & Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-200">
                {request.proposedAnswer || (
                  <span className="italic text-zinc-400">No answer proposed (requires input)</span>
                )}
              </div>
            )}
          </div>

          {/* Impact Statement */}
          <div className="rounded border border-amber-950/40 bg-amber-950/20 p-2.5">
            <p id="approval-dialog-desc" className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="font-semibold text-amber-400">Impact: </strong>
              {request.impactDescription}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="pt-4 border-t border-zinc-850 flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => onDecision('block')}
              className="rounded border border-red-900/60 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
            >
              Block Question
            </button>
            <button
              type="button"
              onClick={() => onDecision('reject')}
              className="rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-850 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleStartEdit}
              className="rounded border border-zinc-700 bg-zinc-850 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDecision('approve_always')}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-750 transition-colors"
            >
              Always Approve
            </button>
            <button
              type="button"
              onClick={() => onDecision('approve_once')}
              className="rounded bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white shadow transition-colors"
            >
              Approve Once
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
