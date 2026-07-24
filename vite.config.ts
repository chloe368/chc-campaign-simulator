import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the CHC Multichannel Campaign Simulator.
// Vitest uses the same config; tests run in jsdom-free node env by default.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
  test: {
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
  },
} as any);
