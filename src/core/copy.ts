import type {
  CopyResult,
  CopyOptions,
  CopyErrorCode,
} from "./types.js";
import { copyViaExecCommand } from "./fallback.js";

export type { CopyResult, CopyOptions } from "./types.js";

/**
 * Maps an unknown error to a CopyErrorCode.
 * Only interprets the error object; insecure context is handled at the call site.
 */
function mapError(error: unknown): CopyErrorCode {
  if (error instanceof DOMException) {
    if (error.name === "SecurityError") return "SECURITY_ERROR";
    if (error.name === "NotAllowedError") return "PERMISSION_DENIED";
  }
  return "UNKNOWN";
}

export async function copyToClipboard(
  text: string,
  options: CopyOptions = {}
): Promise<CopyResult> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      success: false,
      method: "unsupported",
      code: "NO_BROWSER_SUPPORT",
    };
  }

  const isSecure = window.isSecureContext === true;

  let skipClipboardAPI = false;
  if (
    isSecure &&
    options.permissions !== "none" &&
    navigator.permissions?.query
  ) {
    try {
      const status = await navigator.permissions.query({
        name: "clipboard-write" as PermissionName,
      });
      if (status.state === "denied") skipClipboardAPI = true;
    } catch {
      // ignore
    }
  }

  // Tier 1: Async Clipboard API (secure context only)
  if (
    !skipClipboardAPI &&
    navigator.clipboard?.writeText &&
    isSecure
  ) {
    try {
      await navigator.clipboard.writeText(text);

      if (options.clearAfter != null && options.clearAfter > 0) {
        setTimeout(() => {
          navigator.clipboard?.writeText?.("").catch(() => {});
        }, options.clearAfter);
      }

      return { success: true, method: "clipboard-api" };
    } catch {
      // Fall through to Tier 3
    }
  }

  // Tier 2: execCommand support check → Tier 3: textarea fallback
  if (document.queryCommandSupported?.("copy")) {
    const { ok, error } = copyViaExecCommand(text);

    if (ok) {
      return { success: true, method: "exec-command" };
    }

    return {
      success: false,
      method: "failed",
      code: mapError(error),
      error,
    };
  }

  return {
    success: false,
    method: "unsupported",
    code: isSecure ? "NO_BROWSER_SUPPORT" : "INSECURE_CONTEXT",
  };
}
