import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";
import type { VacancyListResponse } from "../../src/features/vacancies/types";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";
const developmentDatabase = resolve("../backend/database/database.sqlite");
const e2eDatabase = resolve("../backend/database/e2e.sqlite");
const seededTitles = [
  "Product Engineer",
  "Android Developer",
  "iOS Developer",
  "Code Reviewer",
];

function developmentChecksum() {
  if (!existsSync(developmentDatabase)) {
    return null;
  }

  return createHash("sha256")
    .update(readFileSync(developmentDatabase))
    .digest("hex");
}

// Hold a request until the test has checked its pending state, without sleeps.
function requestGate() {
  let release = () => {};
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });

  return { waiting, release };
}

let initialChecksum: string | null;

test.beforeAll(() => {
  initialChecksum = developmentChecksum();
});

test.afterAll(() => {
  expect(developmentChecksum()).toBe(initialChecksum);
});

test("backend uses a healthy persisted database separate from development", async ({ request }) => {
  const response = await request.get("http://127.0.0.1:8001/up", {
    headers: { Accept: "application/json" },
  });

  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ status: "up" });
  expect(e2eDatabase).not.toBe(developmentDatabase);
  expect(readFileSync(e2eDatabase).subarray(0, 16).toString()).toBe("SQLite format 3\0");
});

test("homepage redirects and renders seeded vacancies from the actual API", async ({ page }) => {
  const responsePromise = page.waitForResponse(apiUrl);

  await page.goto("/");
  await expect(page).toHaveURL(/\/vacancies$/);
  await expect(page).toHaveTitle("Lowongan Kerja | Dicoding Jobs");

  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();

  const payload: VacancyListResponse = await response.json();
  expect(payload.data.map((vacancy) => vacancy.title)).toEqual(seededTitles);
  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(seededTitles);

  const experienceLabels = [
    "1–3 tahun",
    "4–5 tahun",
    "1–3 tahun",
    "Kurang dari 1 tahun",
  ];
  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  for (const [index, vacancy] of payload.data.entries()) {
    const card = page.getByRole("article", { name: vacancy.title, exact: true });

    await expect(card.getByText(vacancy.company.name, { exact: true })).toBeVisible();
    await expect(card.getByText("Full-time", { exact: true })).toBeVisible();
    await expect(card.getByText(vacancy.location, { exact: true })).toBeVisible();
    await expect(card.getByText(experienceLabels[index], { exact: true })).toBeVisible();
    await expect(card.locator("time").nth(0)).toHaveAttribute("datetime", vacancy.created_at);
    await expect(card.locator("time").nth(0)).toHaveText(
      dateFormatter.format(new Date(vacancy.created_at)),
    );
    await expect(card.locator("time").nth(1)).toHaveAttribute("datetime", vacancy.closing_date);
    await expect(card.locator("time").nth(1)).toHaveText(
      dateFormatter.format(new Date(`${vacancy.closing_date}T00:00:00+07:00`)),
    );
  }

  // Detail navigation is not available yet, and list cards omit salary by design.
  await expect(page.getByRole("article").getByRole("link")).toHaveCount(0);
  await expect(page.getByRole("article").filter({ hasText: /Rp\s*[\d.]/ })).toHaveCount(0);
  const hiddenSalary = payload.data.find((vacancy) => vacancy.title === "Android Developer");
  expect(hiddenSalary?.show_salary).toBe(false);
  expect(hiddenSalary?.salary_min).toBeNull();
  expect(hiddenSalary?.salary_max).toBeNull();
});

test("loading state remains until the real API response arrives", async ({ page }) => {
  const gate = requestGate();

  await page.route(apiUrl, async (route) => {
    await gate.waiting;
    await route.continue();
  });

  try {
    await page.goto("/vacancies");
    await expect(page.getByRole("status")).toHaveText("Memuat daftar lowongan…");
    await expect(page.getByRole("article")).toHaveCount(0);
  } finally {
    gate.release();
  }

  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("empty API response shows an empty state", async ({ page }) => {
  await page.route(apiUrl, (route) => route.fulfill({ json: { data: [] } }));

  await page.goto("/vacancies");

  await expect(page.getByRole("status")).toHaveText("Belum ada lowongan tersedia.");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});

for (const failure of ["network", "server"] as const) {
  test(`${failure} failure can be retried against the actual API`, async ({ page }) => {
    await page.route(apiUrl, (route) => {
      return failure === "network"
        ? route.abort()
        : route.fulfill({ status: 500, json: { message: "Server error" } });
    });

    await page.goto("/vacancies");

    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Daftar lowongan belum dapat dimuat.",
    );
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Coba lagi", exact: true })).toBeEnabled();

    await page.unroute(apiUrl);
    const gate = requestGate();

    await page.route(apiUrl, async (route) => {
      await gate.waiting;
      await route.continue();
    });

    try {
      await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
      await expect(page.getByRole("status")).toHaveText("Memuat daftar lowongan…");
      await expect(page.getByRole("button", { name: "Coba lagi", exact: true })).toHaveCount(0);
    } finally {
      gate.release();
    }

    await expect(page.getByRole("heading", { level: 3 })).toHaveText(seededTitles);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Coba lagi", exact: true })).toHaveCount(0);
  });
}

test("publication dates cross UTC midnight correctly while closing dates stay calendar dates", async ({ page, request }) => {
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();
  const payload: VacancyListResponse = await response.json();
  const vacancy = {
    ...payload.data[0],
    created_at: "2026-10-09T18:30:00.000000Z",
    closing_date: "2026-10-11",
  };

  await page.route(apiUrl, (route) => route.fulfill({ json: { data: [vacancy] } }));
  await page.goto("/vacancies");

  const card = page.getByRole("article", { name: vacancy.title, exact: true });
  await expect(card.locator("time").nth(0)).toHaveText("10 Oktober 2026");
  await expect(card.locator("time").nth(1)).toHaveText("11 Oktober 2026");
});

test("mobile list remains readable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vacancies");

  await expect(page.getByRole("heading", { level: 3 })).toHaveText(seededTitles);

  for (const title of seededTitles) {
    const card = page.getByRole("article", { name: title, exact: true });
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeInViewport();
    await expect(card.getByText("Dicoding Indonesia", { exact: true })).toBeVisible();
  }

  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(hasOverflow).toBe(false);
});
