export type CopyMethod =
  | "clipboard-api"
  | "exec-command"
  | "unsupported"
  | "failed";

export type CopyErrorCode =
  | "SECURITY_ERROR"
  | "PERMISSION_DENIED"
  | "INSECURE_CONTEXT"
  | "NO_BROWSER_SUPPORT"
  | "UNKNOWN";

export type CopyResult = {
  success: boolean;
  method: CopyMethod;
  code?: CopyErrorCode;
  error?: unknown;
};

export type CopyOptions = {
  clearAfter?: number;
  permissions?: "auto" | "none";
};
