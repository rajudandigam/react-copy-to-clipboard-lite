import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "react-copy-to-clipboard-lite/react",
        replacement: path.resolve(__dirname, "../dist/react.mjs"),
      },
      {
        find: "react-copy-to-clipboard-lite",
        replacement: path.resolve(__dirname, "../dist/index.mjs"),
      },
    ],
  },
  server: {
    port: 5173,
  },
});
