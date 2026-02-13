import type { CopyResult, CopyOptions } from "./types.js";

export type { CopyResult, CopyOptions } from "./types.js";

export async function copy(
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
      // Fallback tiers would go here
    }
  }

  return {
    success: false,
    method: "unsupported",
    code: "NO_BROWSER_SUPPORT",
  };
}
