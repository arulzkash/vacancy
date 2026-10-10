import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

const developmentDatabase = resolve("../backend/database/database.sqlite");
const e2eDatabase = resolve("../backend/database/e2e.sqlite");

function developmentChecksum() {
  return existsSync(developmentDatabase)
    ? createHash("sha256").update(readFileSync(developmentDatabase)).digest("hex")
    : null;
}

let initialChecksum: string | null;
test.beforeAll(() => {
  initialChecksum = developmentChecksum();
});
test.afterAll(() => {
  expect(developmentChecksum()).toBe(initialChecksum);
});

test("frontend connects to the actual Laravel backend", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Dicoding Jobs");
  await expect(page.getByRole("heading", { name: "Fondasi aplikasi lowongan" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Backend terhubung. SQLite siap digunakan.");
});

test("backend uses a persisted database separate from development", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:8001/up", {
    headers: { Accept: "application/json" },
  });
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ status: "up" });
  expect(e2eDatabase).not.toBe(developmentDatabase);
  expect(readFileSync(e2eDatabase).subarray(0, 16).toString()).toBe("SQLite format 3\0");
});

test("failed connection can be retried", async ({ page }) => {
  await page.route("**/up", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("Backend belum dapat dihubungi.");
  await page.unroute("**/up");
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.getByRole("status")).toHaveText("Backend terhubung. SQLite siap digunakan.");
});
