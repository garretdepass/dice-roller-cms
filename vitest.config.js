import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: "src/setupTests.js",
    environment: "jsdom",
    globals: true,
    exclude: [".netlify/**", "node_modules/**", "dist/**"],
  },
});
