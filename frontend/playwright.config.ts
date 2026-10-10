import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const installedWindowsChannel = process.platform === "win32"
  ? existsSync(join(process.env.ProgramFiles ?? "C:/Program Files", "Google/Chrome/Application/chrome.exe"))
    ? "chrome"
    : existsSync(join(process.env["ProgramFiles(x86)"] ?? "C:/Program Files (x86)", "Microsoft/Edge/Application/msedge.exe"))
      ? "msedge"
      : undefined
  : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHANNEL ?? installedWindowsChannel ?? "chromium",
      },
    },
  ],
  webServer: [
    {
      command: "node scripts/start-e2e-backend.mjs",
      url: "http://127.0.0.1:8001/up",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8001",
        NEXT_E2E: "1",
      },
    },
  ],
});
