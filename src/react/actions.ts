import { copyToClipboard } from "../core/copy.js";
import type { CopyResult } from "../core/types.js";

export async function copyToClipboardAction(
  _prevState: CopyResult | null,
  formData: FormData
): Promise<CopyResult> {
  const text = formData.get("text");
  const str = typeof text === "string" ? text : text ? String(text) : "";
  return copyToClipboard(str);
}
