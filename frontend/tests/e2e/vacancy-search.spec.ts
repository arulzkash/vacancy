import { test, expect } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";
const developerTitles = ["Android Developer", "iOS Developer"];

function requestGate() {
  let release = () => {};
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });

  return { waiting, release };
}

test("typing debounces requests for 300 ms and only sends the latest keyword", async ({ page }) => {
  await page.goto("/vacancies");
  await expect(page.getByRole("article")).toHaveCount(4);

  const clockTime = new Date("2026-10-10T12:00:00Z");
  await page.clock.install({ time: clockTime });
  await page.clock.pauseAt(clockTime);

  const requestedKeywords: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());

    if (url.pathname === "/api/vacancies") {
      requestedKeywords.push(url.searchParams.get("search") ?? "");
    }
  });

  const input = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await input.fill("De");
  await page.clock.runFor(200);
  await input.fill("Developer");
  await page.clock.runFor(299);

  expect(requestedKeywords).toEqual([]);
  await expect(page).toHaveURL(/\/vacancies$/);
  await expect(page.getByRole("heading", { name: "Daftar Pekerjaan Terbaru" })).toBeVisible();

  await page.clock.runFor(1);

  await expect(page).toHaveURL(/\/vacancies\?search=Developer$/);
  await expect.poll(() => requestedKeywords).toEqual(["Developer"]);
  // Restore timers so TanStack Query can notify React after the network response.
  await page.clock.resume();
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
  await expect(page.getByRole("heading", { name: "Hasil Pencarian", exact: true })).toBeVisible();
  expect(requestedKeywords).toEqual(["Developer"]);
  await expect(input).toBeFocused();
});

test("search trims spaces, ignores capitalization, and clearing restores all vacancies", async ({ page }) => {
  await page.goto("/vacancies");
  await expect(page.getByRole("article")).toHaveCount(4);

  const input = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await input.fill("  dEvElOpEr  ");

  await expect(page).toHaveURL(/\/vacancies\?search=dEvElOpEr$/);
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);

  await input.fill("");

  await expect(page).toHaveURL(/\/vacancies$/);
  await expect(page.getByRole("heading", { name: "Daftar Pekerjaan Terbaru" })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(4);
});

test("direct search URLs and reloads restore the keyword and matching cards", async ({ page }) => {
  await page.goto("/vacancies?search=Developer");

  const input = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await expect(input).toHaveValue("Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);

  await page.reload();

  await expect(input).toHaveValue("Developer");
  await expect(page.getByRole("heading", { name: "Hasil Pencarian", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
});

test("no matching title has a clear search empty state", async ({ page }) => {
  await page.goto("/vacancies?search=Designer");

  await expect(page.getByRole("status")).toHaveText(
    "Tidak ada lowongan yang cocok dengan “Designer”.",
  );
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Hasil Pencarian", exact: true })).toBeVisible();
});

test("browser back restores the search field and results after list navigation", async ({ page }) => {
  await page.goto("/vacancies?search=Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);

  await page.getByRole("navigation").getByRole("link", { name: "Lowongan Kerja" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(4);

  await page.goBack();

  await expect(page.getByRole("searchbox")).toHaveValue("Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
});

test("Enter applies the current search and preserves other URL parameters", async ({ page }) => {
  await page.goto("/vacancies?source=review");
  await expect(page.getByRole("article")).toHaveCount(4);

  const input = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await input.fill("Android");
  await input.press("Enter");

  await expect(page).toHaveURL(/\/vacancies\?source=review&search=Android$/);
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(["Android Developer"]);
});

test("retry keeps the active search keyword", async ({ page }) => {
  const searchUrl = `${apiUrl}?search=Developer`;
  await page.route(searchUrl, (route) => {
    return route.fulfill({ status: 500, json: { message: "Server error" } });
  });

  await page.goto("/vacancies?search=Developer");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Daftar lowongan belum dapat dimuat.",
  );

  await page.unroute(searchUrl);
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();

  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
  await expect(page).toHaveURL(/search=Developer$/);
  await expect(page.getByRole("searchbox")).toHaveValue("Developer");
});

test("a delayed older search cannot replace the newest keyword results", async ({ page }) => {
  const olderUrl = `${apiUrl}?search=Developer`;
  const olderStarted = requestGate();
  const releaseOlder = requestGate();
  const olderFinished = requestGate();

  await page.route(olderUrl, async (route) => {
    const response = await route.fetch();
    olderStarted.release();
    await releaseOlder.waiting;

    try {
      await route.fulfill({ response });
    } finally {
      olderFinished.release();
    }
  });

  await page.goto("/vacancies");
  await expect(page.getByRole("article")).toHaveCount(4);

  const input = page.getByRole("searchbox", { name: "Cari judul lowongan" });
  await input.fill("Developer");
  await olderStarted.waiting;

  const cancelledRequest = page.waitForEvent("requestfailed", {
    predicate: (request) => request.url() === olderUrl,
  });

  try {
    await input.fill("Android");
    await expect(page).toHaveURL(/search=Android$/);
    await expect(page.getByRole("heading", { level: 3 })).toHaveText(["Android Developer"]);

    const request = await cancelledRequest;
    expect(request.failure()?.errorText).toContain("ERR_ABORTED");
  } finally {
    releaseOlder.release();
    await olderFinished.waiting;
  }

  await expect(page.getByRole("heading", { level: 3 })).toHaveText(["Android Developer"]);
  await expect(input).toHaveValue("Android");
});
