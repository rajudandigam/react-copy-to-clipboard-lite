import type { CopyResult, CopyOptions } from "./types.js";
import { copyViaExecCommand } from "./fallback.js";

export type { CopyResult, CopyOptions } from "./types.js";

export async function copyToClipboard(
  text: string,
  _options?: CopyOptions
): Promise<CopyResult> {
  if (typeof window === "undefined") {
    return {
      success: false,
      method: "unsupported",
      code: "NO_BROWSER_SUPPORT",
    };
  }

  const clipboard = navigator.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return { success: true, method: "clipboard-api" };
    } catch {
      // Fall through to execCommand fallback
    }
  }

  if (typeof document !== "undefined" && document.queryCommandSupported?.("copy")) {
    const { ok, error } = copyViaExecCommand(text);
    if (ok) return { success: true, method: "exec-command" };
    return {
      success: false,
      method: "failed",
      error,
    };
  }

  return {
    success: false,
    method: "unsupported",
    code: "NO_BROWSER_SUPPORT",
  };
}
