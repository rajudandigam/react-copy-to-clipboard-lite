/**
 * Attempts to copy text using document.execCommand fallback.
 * Used when the Async Clipboard API is unavailable or fails.
 *
 * Returns a structured result and never throws.
 */
export function copyViaExecCommand(
  text: string
): { ok: boolean; error?: unknown } {
  if (typeof document === "undefined") {
    return { ok: false, error: new Error("NO_DOCUMENT") };
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;

  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  textarea.style.whiteSpace = "pre";

  document.body.appendChild(textarea);

  let ok = false;

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    ok = document.execCommand?.("copy") ?? false;
  } catch (error) {
    return { ok: false, error };
  } finally {
    try {
      window.getSelection?.()?.removeAllRanges?.();
    } catch {
      // ignore selection cleanup errors
    }

    if (textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }

  return { ok };
}
