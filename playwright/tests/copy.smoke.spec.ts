import { test, expect } from "@playwright/test";

test.describe("Copy smoke", () => {
  test("Hook basic copy: clipboard has text and copied-state is true", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("hook-copy").click();

    if (browserName === "chromium") {
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toBe("hook-text");
    }

    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });

  test("clearAfter empties clipboard", async ({ page, context, browserName }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("hook-copy").click();

    if (browserName === "chromium") {
      let clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toBe("hook-text");
    }

    await page.waitForTimeout(1500);

    if (browserName === "chromium") {
      const clipboardAfter = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardAfter).toBe("");
    }

    await expect(page.getByTestId("copied-state")).toHaveText("false");
  });

  test("fallback works in insecure context", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "isSecureContext", {
        value: false,
        configurable: true,
      });
    });

    await page.goto("/");
    await page.getByTestId("hook-copy").click();

    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });

  test("rapid multiple clicks do not break copied state", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("hook-copy").click();
    await page.getByTestId("hook-copy").click();
    await page.getByTestId("hook-copy").click();

    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });

  test("reset button clears copied state", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("hook-copy").click();
    await expect(page.getByTestId("copied-state")).toHaveText("true");

    await page.getByTestId("reset-btn").click();
    await expect(page.getByTestId("copied-state")).toHaveText("false");
  });

  test("preventDefault blocks copy in browser", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Clipboard read unsupported in WebKit"
    );
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.goto("/");
    await page.getByTestId("prevent-copy").click();

    if (browserName === "chromium") {
      const text = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(text).not.toBe("blocked");
    }
  });

  test("root import (index) copy works", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Clipboard read unsupported in WebKit"
    );
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.goto("/");
    await page.getByTestId("index-copy").click();

    await expect(page.getByTestId("index-copy-result")).toHaveText("true");
    if (browserName === "chromium") {
      const text = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(text).toBe("from-index");
    }
  });

  test("<CopyToClipboard> works and child onClick fires", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("component-copy").click();

    if (browserName === "chromium") {
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toBe("component-text");
    }

    await expect(
      page.getByTestId("component-onclick-fired")
    ).toHaveText("yes");
  });

  test("copyAction works via form", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("action-input").fill("action-text");
    await page.getByTestId("action-copy").click();

    if (browserName === "chromium") {
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toBe("action-text");
    }

    await expect(page.getByTestId("action-result")).toHaveText("true");
  });

  test("action displays result metadata (success + method)", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("action-input").fill("meta-text");
    await page.getByTestId("action-copy").click();

    await expect(page.getByTestId("action-result")).toHaveText("true");
    await expect(page.getByTestId("action-method")).toBeVisible();
    const method = await page.getByTestId("action-method").textContent();
    expect(
      ["clipboard-api", "exec-command"].includes(method?.trim() ?? "")
    ).toBe(true);
  });

  test("multiline copy preserves newlines (Chromium)", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "Clipboard read only in Chromium"
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    await page.getByTestId("multiline-copy").click();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toBe("line one\nline two\nline three");
    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });

  test("copy from input field works", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("input-copy-field").fill("https://shared.link/abc");
    await page.getByTestId("input-copy-btn").click();

    if (browserName === "chromium") {
      const text = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(text).toBe("https://shared.link/abc");
    }
    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });

  test("clearAfter does not break initial success", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("clear-after-copy").click();

    await expect(page.getByTestId("copied-state")).toHaveText("true");
    await expect(page.getByTestId("clear-after-indicator")).toHaveText(
      /Copied.*clear/
    );
    if (browserName === "chromium") {
      const text = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(text).toBe("secret-api-key");
    }
  });

  test("custom component wrapper copies correctly", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("custom-component-button").click();

    if (browserName === "chromium") {
      const text = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(text).toBe("custom-component-text");
    }
  });

  test("error state displays when copy fails", async ({
    page,
    browserName,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        get: () => ({
          writeText: () => Promise.reject(new Error("denied")),
          readText: () => Promise.reject(new Error("denied")),
        }),
        configurable: true,
      });
      const origExec = document.execCommand;
      document.execCommand = function () {
        if (arguments[0] === "copy") throw new Error("exec copy failed");
        return origExec?.apply(document, arguments as never) ?? false;
      };
    });

    await page.goto("/");
    await page.getByTestId("hook-copy").click();

    await expect(page.getByTestId("error-state")).toBeVisible();
  });

  test("fallback works when navigator.clipboard is missing", async ({
    page,
    context,
    browserName,
  }) => {
    await page.addInitScript(() => {
      const real = navigator.clipboard;
      Object.defineProperty(navigator, "clipboard", {
        get: () => ({
          writeText: () => Promise.reject(new Error("mock")),
          readText: () => real.readText(),
        }),
        configurable: true,
      });
    });

    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await page.goto("/");

    await page.getByTestId("hook-copy").click();

    await expect(page.getByTestId("copied-state")).toHaveText("true");

    if (browserName === "chromium") {
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toBe("hook-text");
    }
  });

  test("copy succeeds without granted permissions (fallback when API throws)", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Clipboard read unsupported in WebKit"
    );
    await page.goto("/");
    await page.getByTestId("hook-copy").click();

    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });
});
