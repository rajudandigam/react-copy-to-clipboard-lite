import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "../copy";

describe("copyToClipboard() core engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns unsupported in SSR environment", async () => {
    const originalWindow = global.window;
    // @ts-expect-error simulate SSR
    delete global.window;

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(false);
    expect(result.method).toBe("unsupported");

    global.window = originalWindow;
  });

  it("uses clipboard-api when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.success).toBe(true);
    expect(result.method).toBe("clipboard-api");
  });
});
