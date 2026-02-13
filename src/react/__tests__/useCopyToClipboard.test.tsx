import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("1. Initial state", () => {
    it("has copied false and error null", () => {
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: true,
        method: "clipboard-api",
      });

      const { result } = renderHook(() => useCopyToClipboard());

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.copy).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });

  describe("2. Successful copy", () => {
    it("sets copied to true and error to null", async () => {
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: true,
        method: "clipboard-api",
      });

      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        await result.current.copy("hello");
      });

      expect(result.current.copied).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  describe("3. Timeout behavior", () => {
    it("resets copied after timeout (fake timers)", async () => {
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

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.copied).toBe(false);
    });
  });

  describe("4. reset()", () => {
    it("clears copied and error", async () => {
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

    it("clears active timer so copied does not flip later", async () => {
      vi.useFakeTimers();
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: true,
        method: "clipboard-api",
      });

      const { result } = renderHook(() => useCopyToClipboard({ timeout: 2000 }));

      await act(async () => {
        await result.current.copy("hello");
      });
      expect(result.current.copied).toBe(true);

      act(() => {
        result.current.reset();
      });
      expect(result.current.copied).toBe(false);

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copied).toBe(false);
    });

    it("clears previous timer when copy is called again before timeout", async () => {
      vi.useFakeTimers();
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: true,
        method: "clipboard-api",
      });

      const { result } = renderHook(() => useCopyToClipboard({ timeout: 2000 }));

      await act(async () => {
        await result.current.copy("first");
      });
      expect(result.current.copied).toBe(true);

      await act(async () => {
        await result.current.copy("second");
      });
      expect(result.current.copied).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.copied).toBe(false);
    });
  });

  describe("5. Failure case", () => {
    it("sets error when copyToClipboard returns success: false", async () => {
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

    it("sets error from result.code when result.error is missing", async () => {
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: false,
        method: "unsupported",
        code: "NO_BROWSER_SUPPORT",
      });

      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        await result.current.copy("hello");
      });

      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBe("NO_BROWSER_SUPPORT");
    });
  });

  describe("6. Unmount safety", () => {
    it("does not update state after unmount when copy resolves late", async () => {
      let resolveCopy: (value: { success: true; method: "clipboard-api" }) => void;
      const copyPromise = new Promise<{ success: true; method: "clipboard-api" }>(
        (r) => {
          resolveCopy = r;
        }
      );
      vi.mocked(copyToClipboard).mockReturnValue(copyPromise);

      const { result, unmount } = renderHook(() => useCopyToClipboard());

      const copyPromiseResult = result.current.copy("hello");
      unmount();

      act(() => {
        resolveCopy!({ success: true, method: "clipboard-api" });
      });
      await copyPromiseResult;

      expect(result.current.copied).toBe(false);
    });

    it("clears timer on unmount so no timer runs after unmount", async () => {
      vi.useFakeTimers();
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: true,
        method: "clipboard-api",
      });

      const { result, unmount } = renderHook(() =>
        useCopyToClipboard({ timeout: 1000 })
      );

      await act(async () => {
        await result.current.copy("hello");
      });
      expect(result.current.copied).toBe(true);

      unmount();

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    });
  });

  describe("options and return value", () => {
    it("forwards clearAfter and permissions to copyToClipboard", async () => {
      vi.mocked(copyToClipboard).mockResolvedValue({
        success: true,
        method: "clipboard-api",
      });

      const { result } = renderHook(() =>
        useCopyToClipboard({ clearAfter: 500, permissions: "none" })
      );

      await act(async () => {
        await result.current.copy("hello");
      });

      expect(copyToClipboard).toHaveBeenCalledWith("hello", {
        clearAfter: 500,
        permissions: "none",
      });
    });

    it("copy() returns the CopyResult from copyToClipboard", async () => {
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
});
