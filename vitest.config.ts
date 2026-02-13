import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      reporter: ["text", "html"],
      exclude: ["dist/", "node_modules/", "vitest.config.ts"],
    },
  },
});
