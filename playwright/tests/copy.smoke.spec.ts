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
});
