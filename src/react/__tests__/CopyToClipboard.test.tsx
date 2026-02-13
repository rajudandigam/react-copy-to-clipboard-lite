import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyToClipboard } from "../CopyToClipboard";
import { copyToClipboard } from "../../core/copy.js";

vi.mock("../../core/copy.js", () => ({
  copyToClipboard: vi.fn(),
}));

describe("CopyToClipboard", () => {
  beforeEach(() => {
    vi.mocked(copyToClipboard).mockReset();
  });

  it("renders child and calls copyToClipboard with text when clicked", async () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hello">
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(copyToClipboard).toHaveBeenCalledWith("hello", { clearAfter: undefined });
  });

  it("forwards clearAfter to copyToClipboard", async () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hi" clearAfter={1000}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(copyToClipboard).toHaveBeenCalledWith("hi", { clearAfter: 1000 });
  });

  it("calls child onClick before copy", async () => {
    const childOnClick = vi.fn();
    vi.mocked(copyToClipboard).mockResolvedValue({
      success: true,
      method: "clipboard-api",
    });

    render(
      <CopyToClipboard text="hello">
        <button type="button" onClick={childOnClick}>
          Copy
        </button>
      </CopyToClipboard>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(childOnClick).toHaveBeenCalled();
    expect(copyToClipboard).toHaveBeenCalled();
  });

  it("does not call copyToClipboard when child calls preventDefault", () => {
    vi.mocked(copyToClipboard).mockResolvedValue({
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

    expect(copyToClipboard).not.toHaveBeenCalled();
  });

  it("calls onSuccess when copy succeeds", async () => {
    const result = { success: true as const, method: "clipboard-api" as const };
    vi.mocked(copyToClipboard).mockResolvedValue(result);

    const onSuccess = vi.fn();
    render(
      <CopyToClipboard text="hello" onSuccess={onSuccess}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(onSuccess).toHaveBeenCalledWith(result);
  });

  it("calls onError when copy fails", async () => {
    const result = {
      success: false as const,
      method: "failed" as const,
      error: new Error("denied"),
    };
    vi.mocked(copyToClipboard).mockResolvedValue(result);

    const onError = vi.fn();
    render(
      <CopyToClipboard text="hello" onError={onError}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(onError).toHaveBeenCalledWith(result);
  });

  it("calls onCopyResult with result in all cases", async () => {
    const result = { success: true as const, method: "exec-command" as const };
    vi.mocked(copyToClipboard).mockResolvedValue(result);

    const onCopyResult = vi.fn();
    render(
      <CopyToClipboard text="hello" onCopyResult={onCopyResult}>
        <button type="button">Copy</button>
      </CopyToClipboard>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });

    expect(onCopyResult).toHaveBeenCalledWith(result);
  });
});
