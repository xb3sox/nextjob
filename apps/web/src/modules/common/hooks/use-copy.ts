import { useCallback, useEffect, useRef, useState } from "react";

type CopyFn = (text: string) => Promise<void>;

export interface CopyOptions {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: Error) => void;
}

export function useCopy({ timeout = 3000, onCopy, onError }: CopyOptions = {}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (copied) {
      timeoutId = setTimeout(() => {
        setCopied(false);
      }, timeout);
    }
    return () => clearTimeout(timeoutId);
  }, [copied, timeout]);

  const copy: CopyFn = useCallback(
    async (text) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
        onError?.(new Error("Clipboard API not available"));
        return;
      }

      try {
        if (!copied) {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onCopy?.();
          timeoutRef.current = window.setTimeout(
            () => setCopied(false),
            timeout,
          );
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [timeout, onCopy, onError, copied],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return {
    copied,
    copy,
  };
}
