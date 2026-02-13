import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "../copy";

describe("copyToClipboard() core engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const g = global as unknown as {
      navigator?: { clipboard?: unknown; permissions?: unknown };
      document?: { execCommand?: unknown; queryCommandSupported?: unknown };
    };
    if (g.navigator) {
      delete g.navigator.clipboard;
      delete g.navigator.permissions;
    }
    if (g.document) {
      delete g.document.execCommand;
      delete g.document.queryCommandSupported;
    }
  });

  it("returns unsupported in SSR environment", async () => {
    const originalWindow = global.window;
    const originalDocument = global.document;

    // @ts-expect-error simulate SSR
    delete global.window;
    // @ts-expect-error simulate SSR
    delete global.document;

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(false);
    expect(result.method).toBe("unsupported");

    global.window = originalWindow;
    global.document = originalDocument;
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

  it("falls back to execCommand when clipboard API fails", async () => {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")),
      },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(global.document, "execCommand", {
      value: execCommand,
      configurable: true,
    });
    Object.defineProperty(global.document, "queryCommandSupported", {
      value: vi.fn().mockImplementation((cmd: string) => cmd === "copy"),
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(true);
    expect(result.method).toBe("exec-command");
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("skips clipboard API when permission is denied", async () => {
    const writeText = vi.fn();
    const query = vi.fn().mockResolvedValue({ state: "denied" });

    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    Object.defineProperty(global.navigator, "permissions", {
      value: { query },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    Object.defineProperty(global.document, "queryCommandSupported", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
    });

    Object.defineProperty(global.document, "execCommand", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(writeText).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.method).toBe("exec-command");
  });

  it("continues to clipboard or fallback when permissions.query throws", async () => {
    const query = vi.fn().mockRejectedValue(new Error("Permission query unsupported"));

    Object.defineProperty(global.navigator, "permissions", {
      value: { query },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(true);
    expect(result.method).toBe("clipboard-api");
  });

  it("does not query permissions when permissions option is 'none'", async () => {
    const query = vi.fn();

    Object.defineProperty(global.navigator, "permissions", {
      value: { query },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });

    await copyToClipboard("hello", { permissions: "none" });

    expect(query).not.toHaveBeenCalled();
  });

  it("returns unsupported when queryCommandSupported is false", async () => {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("fail")),
      },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    Object.defineProperty(global.document, "queryCommandSupported", {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(false);
    expect(result.method).toBe("unsupported");
    expect(result.code).toBe("NO_BROWSER_SUPPORT");
  });

  it("returns failed when fallback execCommand fails", async () => {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("fail")),
      },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    Object.defineProperty(global.document, "queryCommandSupported", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
    });

    Object.defineProperty(global.document, "execCommand", {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(false);
    expect(result.method).toBe("failed");
  });

  it("maps NotAllowedError from fallback to PERMISSION_DENIED", async () => {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("fail")),
      },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    Object.defineProperty(global.document, "queryCommandSupported", {
      value: vi.fn().mockReturnValue(true),
      configurable: true,
    });

    Object.defineProperty(global.document, "execCommand", {
      value: vi.fn().mockImplementation(() => {
        throw new DOMException("denied", "NotAllowedError");
      }),
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(false);
    expect(result.method).toBe("failed");
    expect(result.code).toBe("PERMISSION_DENIED");
  });

  it("returns INSECURE_CONTEXT when no support and insecure context", async () => {
    Object.defineProperty(global.window, "isSecureContext", {
      value: false,
      configurable: true,
    });

    Object.defineProperty(global.document, "queryCommandSupported", {
      value: vi.fn().mockReturnValue(false),
      configurable: true,
    });

    const result = await copyToClipboard("hello");

    expect(result.success).toBe(false);
    expect(result.code).toBe("INSECURE_CONTEXT");
  });

  it("schedules clearAfter and calls writeText('') after timeout", async () => {
    vi.useFakeTimers();

    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    Object.defineProperty(global.window, "isSecureContext", {
      value: true,
      configurable: true,
    });

    const result = await copyToClipboard("hello", { clearAfter: 1000 });

    expect(result.success).toBe(true);
    expect(result.method).toBe("clipboard-api");
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(writeText).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    expect(writeText).toHaveBeenCalledWith("");
    expect(writeText).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
