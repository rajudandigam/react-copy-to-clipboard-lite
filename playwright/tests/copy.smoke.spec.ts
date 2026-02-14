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
