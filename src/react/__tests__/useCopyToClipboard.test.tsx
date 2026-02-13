import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyToClipboard } from "../useCopyToClipboard";
import { copyToClipboard } from "../../core/copy.js";

vi.mock("../../core/copy.js", () => ({
  copyToClipboard: vi.fn(),
}));

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    vi.mocked(copyToClipboard).mockReset();
  });

  it("returns copy, copied, error, reset", () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current).toHaveProperty("copy");
    expect(result.current).toHaveProperty("copied");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("reset");
    expect(typeof result.current.copy).toBe("function");
    expect(typeof result.current.reset).toBe("function");
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("sets copied to true on success and forwards options to engine", async () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    const { result } = renderHook(() =>
      useCopyToClipboard({ timeout: 2000, clearAfter: 500, permissions: "none" })
    );

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(copyToClipboard).toHaveBeenCalledWith("hello", {
      clearAfter: 500,
      permissions: "none",
    });
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("sets error on failure", async () => {
    const err = new Error("copy failed");
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: false,
      method: "failed",
      error: err,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(err);
  });

  it("reset clears copied and error", async () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("resets copied after timeout", async () => {
    vi.useFakeTimers();
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 1000 }));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });

  it("copy override options merge with hook options", async () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    const { result } = renderHook(() =>
      useCopyToClipboard({ clearAfter: 100, permissions: "auto" })
    );

    await act(async () => {
      await result.current.copy("hello", { permissions: "none" });
    });

    expect(copyToClipboard).toHaveBeenCalledWith("hello", {
      clearAfter: 100,
      permissions: "none",
    });
  });

  it("returns result from copyToClipboard", async () => {
    const resolved = {
      success: true,
      method: "exec-command" as const,
    };
    vi.mocked(copyToClipboard).mockResolvedValue(resolved);

    const { result } = renderHook(() => useCopyToClipboard());

    let returned: Awaited<ReturnType<typeof result.current.copy>> | undefined;
    await act(async () => {
      returned = await result.current.copy("hi");
    });

    expect(returned).toEqual(resolved);
  });
});
