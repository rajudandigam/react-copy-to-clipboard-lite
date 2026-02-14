import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    exclude: ["**/node_modules/**", "**/dist/**", "playwright/**"],
    testTimeout: 10000,
    threads: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "dist/**",
        "node_modules/**",
        "**/*.d.ts",
        "vitest.config.ts",
        "demo/**",
        "playwright/**",
        "src/core.ts",
        "src/index.ts",
        "src/react.ts",
        "src/react/actions.ts",
      ],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95,
      },
    },
  },
});
