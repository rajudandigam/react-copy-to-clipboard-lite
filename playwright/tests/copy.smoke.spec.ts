import { test, expect } from "@playwright/test";

test.describe("Copy smoke", () => {
  test("Hook basic copy: clipboard has text and copied-state is true", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    await page.getByTestId("hook-copy").click();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toBe("hook-text");

    await expect(page.getByTestId("copied-state")).toHaveText("true");
  });
});
