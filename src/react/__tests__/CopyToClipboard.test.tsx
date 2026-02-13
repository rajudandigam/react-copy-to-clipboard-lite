import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyToClipboard } from "../CopyToClipboard";
import { copyToClipboard } from "../../core/copy.js";

vi.mock("../../core/copy.js", () => ({
  copyToClipboard: vi.fn(),
}));

const mockCopy = vi.mocked(copyToClipboard);

describe("CopyToClipboard", () => {
  beforeEach(() => {
    mockCopy.mockReset();
  });

  it("renders child and calls copyToClipboard with text when clicked", async () => {
    mockCopy.mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hello">
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(mockCopy).toHaveBeenCalledWith("hello", { clearAfter: undefined });
  });

  it("forwards clearAfter to copyToClipboard", async () => {
    mockCopy.mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hi" clearAfter={1000}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(mockCopy).toHaveBeenCalledWith("hi", { clearAfter: 1000 });
  });

  it("calls child onClick before copy (order)", async () => {
    const callOrder: string[] = [];
    const childOnClick = vi.fn(() => callOrder.push("child"));
    mockCopy.mockImplementation(async () => {
      callOrder.push("copy");
      return { success: true, method: "clipboard-api" };
    });

    render(
      <CopyToClipboard text="hello">
        <button type="button" onClick={childOnClick}>
          Copy
        </button>
      </CopyToClipboard>
    );

    await fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await Promise.resolve();

    expect(callOrder).toEqual(["child", "copy"]);
  });

  it("does not call copyToClipboard when child calls preventDefault", () => {
    mockCopy.mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hello">
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
        >
          Copy
        </button>
      </CopyToClipboard>
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(mockCopy).not.toHaveBeenCalled();
  });

  it("works when child has no onClick", async () => {
    mockCopy.mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hello">
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(mockCopy).toHaveBeenCalledWith("hello", { clearAfter: undefined });
  });

  it("calls onSuccess when copy succeeds", async () => {
    const result = { success: true as const, method: "clipboard-api" as const };
    mockCopy.mockResolvedValue(result);

    const onSuccess = vi.fn();
    render(
      <CopyToClipboard text="hello" onSuccess={onSuccess}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(result);
    });
  });

  it("calls onError when copy fails", async () => {
    const result = {
      success: false as const,
      method: "failed" as const,
      error: new Error("denied"),
    };
    mockCopy.mockResolvedValue(result);

    const onError = vi.fn();
    render(
      <CopyToClipboard text="hello" onError={onError}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(result);
    });
  });

  it("calls onCopyResult with result in all cases", async () => {
    const result = { success: true as const, method: "exec-command" as const };
    mockCopy.mockResolvedValue(result);

    const onCopyResult = vi.fn();
    render(
      <CopyToClipboard text="hello" onCopyResult={onCopyResult}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(onCopyResult).toHaveBeenCalledWith(result);
    });
  });

  it("calls both onCopyResult and onSuccess when copy succeeds", async () => {
    const result = { success: true as const, method: "clipboard-api" as const };
    mockCopy.mockResolvedValue(result);

    const onCopyResult = vi.fn();
    const onSuccess = vi.fn();
    render(
      <CopyToClipboard
        text="hello"
        onCopyResult={onCopyResult}
        onSuccess={onSuccess}
      >
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(onCopyResult).toHaveBeenCalledWith(result);
      expect(onSuccess).toHaveBeenCalledWith(result);
    });
  });
});
