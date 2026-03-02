import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  globalTeardown: "./tests/global-teardown",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun --bun next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:8000",
    },
  },
});
