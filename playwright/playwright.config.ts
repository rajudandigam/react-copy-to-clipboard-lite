import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  retries: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  webServer: {
    command: "npm run dev:test-app",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    headless: true,
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
