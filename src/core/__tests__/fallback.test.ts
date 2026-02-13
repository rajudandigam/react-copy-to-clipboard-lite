import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyViaExecCommand } from "../fallback.js";

describe("copyViaExecCommand", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (typeof global.document !== "undefined") {
      document.body.innerHTML = "";
    }
  });

  it("returns ok: false with error when document is undefined (SSR)", () => {
    const doc = global.document;
    // @ts-expect-error simulate SSR
    delete global.document;

    const result = copyViaExecCommand("hello");

    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe("NO_DOCUMENT");

    global.document = doc;
  });

  it("returns ok: true and ignores selection cleanup errors in finally", () => {
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(global.document, "execCommand", {
      value: execCommand,
      configurable: true,
    });

    const removeAllRanges = vi.fn().mockImplementation(() => {
      throw new Error("selection cleanup failed");
    });
    Object.defineProperty(global.window, "getSelection", {
      value: vi.fn().mockReturnValue({ removeAllRanges }),
      configurable: true,
    });

    const result = copyViaExecCommand("hello");

    expect(result.ok).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});
