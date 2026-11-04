import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";

export interface CopyOptions {
  timeout?: number;
  onCopy?: (value: string) => void;
  onError?: (error: Error) => void;
}

export interface UseCopyState {
  copied: boolean;
  copy: (value: string) => Promise<void>;
}

export const useCopy = ({
  timeout = 3000,
  onCopy,
  onError,
}: CopyOptions = {}): UseCopyState => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => {
      setCopied(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [copied, timeout]);

  const copy = async (value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      setCopied(true);
      onCopy?.(value);
    } catch (error) {
      setCopied(false);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return { copied, copy };
};
