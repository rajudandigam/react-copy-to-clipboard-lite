import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboardAction } from "../copyToClipboardAction";
import { copyToClipboard } from "../../core/copy.js";

vi.mock("../../core/copy.js", () => ({
  copyToClipboard: vi.fn(),
}));

describe("copyToClipboardAction", () => {
  beforeEach(() => {
    vi.mocked(copyToClipboard).mockReset();
  });

  it("reads text from FormData and calls copyToClipboard", async () => {
    const formData = new FormData();
    formData.set("text", "hello world");

    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    const result = await copyToClipboardAction(null, formData);

    expect(copyToClipboard).toHaveBeenCalledWith("hello world");
    expect(result).toEqual({ success: true, method: "clipboard-api" });
  });

  it("passes empty string when text is missing", async () => {
    const formData = new FormData();

    vi.mocked(copyToClipboard).mockResolvedValue({
      success: false,
      method: "unsupported",
      code: "NO_BROWSER_SUPPORT",
    });

    await copyToClipboardAction(null, formData);

    expect(copyToClipboard).toHaveBeenCalledWith("");
  });

  it("returns CopyResult from copyToClipboard", async () => {
    const formData = new FormData();
    formData.set("text", "hi");

    const resolved = {
      success: false as const,
      method: "failed" as const,
      code: "PERMISSION_DENIED" as const,
      error: new Error("denied"),
    };
    vi.mocked(copyToClipboard).mockResolvedValue(resolved);

    const result = await copyToClipboardAction(null, formData);

    expect(result).toEqual(resolved);
  });

  it("coerces non-string text to string", async () => {
    const formData = new FormData();
    formData.set("text", "123");

    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    await copyToClipboardAction(null, formData);

    expect(copyToClipboard).toHaveBeenCalledWith("123");
  });
});
