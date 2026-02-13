/**
 * Indicates which strategy was used to attempt the copy operation.
 */
export type CopyMethod =
  | "clipboard-api"
  | "exec-command"
  | "unsupported"
  | "failed";

/**
 * Structured error codes for predictable failure handling.
 */
export type CopyErrorCode =
  | "SECURITY_ERROR"
  | "PERMISSION_DENIED"
  | "INSECURE_CONTEXT"
  | "NO_BROWSER_SUPPORT"
  | "UNKNOWN";

/**
 * Standardized result returned from copyToClipboard.
 * Never throws. Always resolves with this shape.
 */
export type CopyResult = {
  success: boolean;
  method: CopyMethod;
  code?: CopyErrorCode;
  error?: unknown;
};

/**
 * Options for copyToClipboard behavior.
 */
export type CopyOptions = {
  /**
   * If provided, clears the clipboard (best effort) after X milliseconds.
   * Does NOT attempt to restore previous clipboard contents.
   */
  clearAfter?: number;

  /**
   * Controls permission querying behavior.
   * - 'auto': attempt best-effort permission query
   * - 'none': skip permission logic entirely
   */
  permissions?: "auto" | "none";
};
