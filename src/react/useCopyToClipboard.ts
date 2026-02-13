import { useState, useRef, useEffect, useCallback } from "react";
import { copyToClipboard } from "../core/copy.js";
import type { CopyOptions, CopyResult } from "../core/types.js";

export type UseCopyToClipboardOptions = {
  timeout?: number;
} & CopyOptions;

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): {
  copy: (text: string, override?: CopyOptions) => Promise<CopyResult>;
  copied: boolean;
  error: unknown | null;
  reset: () => void;
} {
  const { timeout = 2000, clearAfter, permissions = "auto" } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const timerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const reset = useCallback(() => {
    if (!mountedRef.current) return;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    async (text: string, override?: CopyOptions): Promise<CopyResult> => {
      const result = await copyToClipboard(text, {
        clearAfter,
        permissions,
        ...override,
      });

      if (!mountedRef.current) return result;

      if (result.success) {
        setCopied(true);
        setError(null);

        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        timerRef.current = globalThis.setTimeout(() => {
          timerRef.current = null;
          if (mountedRef.current) {
            setCopied(false);
          }
        }, timeout);
      } else {
        setError(result.error ?? result.code ?? null);
      }

      return result;
    },
    [timeout, clearAfter, permissions]
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { copy, copied, error, reset };
}
