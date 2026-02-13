import { useState, useCallback } from "react";
import { copyToClipboard } from "../core/copy.js";
import type { CopyResult, CopyOptions } from "../core/types.js";

export type UseCopyToClipboardOptions = {
  timeout?: number;
  clearAfter?: number;
};

export function useCopyToClipboard(opts?: UseCopyToClipboardOptions): {
  copyToClipboard: (text: string, options?: CopyOptions) => Promise<CopyResult>;
  copied: boolean;
  error: unknown | null;
  reset: () => void;
} {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    async (text: string, options?: CopyOptions): Promise<CopyResult> => {
      const result = await copyToClipboard(text, {
        ...options,
        clearAfter: options?.clearAfter ?? opts?.clearAfter,
      });
      if (result.success) {
        setCopied(true);
        setError(null);
        const ms = opts?.timeout ?? 2000;
        if (ms > 0) setTimeout(() => setCopied(false), ms);
      } else {
        setError(result.error ?? new Error("Copy failed"));
      }
      return result;
    },
    [opts?.timeout, opts?.clearAfter]
  );

  return { copyToClipboard: copy, copied, error, reset };
}
