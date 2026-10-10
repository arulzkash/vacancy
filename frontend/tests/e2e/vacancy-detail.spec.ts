import { test, expect } from "@playwright/test";
import type {
  Vacancy,
  VacancyDetailResponse,
  VacancyListResponse,
} from "../../src/features/vacancies/types";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";
const developerTitles = ["Android Developer", "iOS Developer"];
let vacancy: Vacancy;

function requestGate() {
  let release = () => {};
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });

  return { waiting, release };
}

test.beforeAll(async ({ request }) => {
  const response = await request.get(apiUrl);
  expect(response.ok()).toBeTruthy();

  const payload: VacancyListResponse = await response.json();
  const androidVacancy = payload.data.find((item) => item.title === "Android Developer");

  if (!androidVacancy) {
    throw new Error("The E2E database must contain the Android Developer sample.");
  }

  vacancy = androidVacancy;
});

test("list, search, detail, and back link work together with the actual API", async ({ page }) => {
  await page.goto("/vacancies");
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.getByRole("searchbox", { name: "Cari judul lowongan" }).fill("Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);

  const detailResponse = page.waitForResponse(`${apiUrl}/${vacancy.id}`);
  await page.getByRole("link", { name: vacancy.title, exact: true }).click();
  await expect(page).toHaveURL(`/vacancies/${vacancy.id}?search=Developer`);
  await expect(page).toHaveTitle("Detail Lowongan | Dicoding Jobs");

  const response = await detailResponse;
  expect(response.ok()).toBeTruthy();
  const payload: VacancyDetailResponse = await response.json();
  expect(payload.data.id).toBe(vacancy.id);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(payload.data.title);
  await expect(page.getByText(`Sektor bisnis: ${payload.data.company.business_sector}`)).toBeVisible();
  await expect(page.getByText(payload.data.company.name, { exact: true })).toBeVisible();
  await expect(page.getByText(`${payload.data.company.employee_range} Karyawan`)).toBeVisible();
  await expect(page.getByText("4–5 tahun", { exact: true })).toBeVisible();
  await expect(page.getByText(`${payload.data.candidate_count} kandidat`, { exact: true })).toBeVisible();

  await expect(page.getByText(/^Gaji:/)).toHaveCount(0);

  const description = page.getByRole("region", { name: "Deskripsi lowongan" });
  const expectedText = await page.evaluate((html) => {
    return new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
  }, payload.data.description_html);
  await expect(description).toHaveText(expectedText);

  // A short description should not retain the height of the full Figma example.
  const info = await page.getByRole("region", { name: "Informasi Tambahan" }).boundingBox();
  const footer = await page.getByRole("contentinfo").boundingBox();
  expect(info).not.toBeNull();
  expect(footer).not.toBeNull();
  expect(footer!.y - (info!.y + info!.height)).toBeGreaterThanOrEqual(0);
  expect(footer!.y - (info!.y + info!.height)).toBeLessThan(160);

  await page.getByRole("link", { name: "Kembali ke lowongan", exact: true }).click();
  await expect(page).toHaveURL("/vacancies?search=Developer");
  await expect(page.getByRole("searchbox")).toHaveValue("Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
});

test("browser back also restores the search results after opening a card", async ({ page }) => {
  await page.goto("/vacancies?search=Developer");
  await page.getByRole("link", { name: "iOS Developer", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("iOS Developer");

  await page.goBack();

  await expect(page).toHaveURL("/vacancies?search=Developer");
  await expect(page.getByRole("searchbox")).toHaveValue("Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
});

test("a direct detail URL and reload load the requested vacancy", async ({ page }) => {
  await page.goto(`/vacancies/${vacancy.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(vacancy.title);
  await expect(page.getByRole("link", { name: "Kembali ke lowongan", exact: true }))
    .toHaveAttribute("href", "/vacancies");

  await page.reload();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(vacancy.title);
  await expect(page.getByRole("region", { name: "Deskripsi lowongan" })).toBeVisible();
});

test("detail loading remains visible until the actual API response arrives", async ({ page }) => {
  const gate = requestGate();
  await page.route(`${apiUrl}/${vacancy.id}`, async (route) => {
    await gate.waiting;
    await route.continue();
  });

  try {
    await page.goto(`/vacancies/${vacancy.id}`);
    await expect(page.getByRole("status")).toHaveText("Memuat detail lowongan…");
    await expect(page.getByRole("heading", { name: vacancy.title, exact: true })).toHaveCount(0);
  } finally {
    gate.release();
  }

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(vacancy.title);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("a missing vacancy shows not-found without retrying and keeps the search back link", async ({ page }) => {
  const missingUrl = `${apiUrl}/999999`;
  const responses: number[] = [];
  // Strict Mode can cancel the initial request; count completed responses only.
  page.on("response", (response) => {
    if (response.url() === missingUrl) {
      responses.push(response.status());
    }
  });
  const responsePromise = page.waitForResponse(missingUrl);

  await page.goto("/vacancies/999999?search=Developer");

  expect((await responsePromise).status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lowongan tidak ditemukan");
  await expect(page.getByRole("button", { name: "Coba lagi", exact: true })).toHaveCount(0);
  expect(responses).toEqual([404]);

  await page.getByRole("link", { name: "Kembali ke lowongan", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("Developer");
  await expect(page.getByRole("heading", { level: 3 })).toHaveText(developerTitles);
});

test("an invalid detail ID returns a page 404 without requesting a vacancy", async ({ page }) => {
  const detailRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith(`${apiUrl}/`)) {
      detailRequests.push(request.url());
    }
  });

  const response = await page.goto("/vacancies/abc");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lowongan tidak ditemukan");
  expect(detailRequests).toEqual([]);
});

for (const failure of ["network", "server"] as const) {
  test(`detail ${failure} failure recovers through retry with the actual API`, async ({ page }) => {
    const detailUrl = `${apiUrl}/${vacancy.id}`;
    await page.route(detailUrl, (route) => {
      return failure === "network"
        ? route.abort()
        : route.fulfill({ status: 500, json: { message: "Server error" } });
    });
    await page.goto(`/vacancies/${vacancy.id}?search=Developer`);
    await expect(page.getByRole("main").getByRole("alert"))
      .toHaveText("Detail lowongan belum dapat dimuat.");

    await page.unroute(detailUrl);
    const responsePromise = page.waitForResponse(detailUrl);
    await page.getByRole("button", { name: "Coba lagi", exact: true }).click();

    expect((await responsePromise).ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(vacancy.title);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Kembali ke lowongan", exact: true }))
      .toHaveAttribute("href", "/vacancies?search=Developer");
  });
}

test("description headings and rich text come entirely from the API HTML", async ({ page }) => {
  await page.route(`${apiUrl}/${vacancy.id}`, async (route) => {
    const response = await route.fetch();
    expect(response.ok()).toBeTruthy();
    const payload: VacancyDetailResponse = await response.json();
    payload.data.description_html = [
      "<h2>Deskripsi Pekerjaan</h2>",
      "<p>Bangun <strong>produk pembelajaran</strong> bersama tim.</p>",
      "<h3>Tanggung Jawab</h3>",
      "<ul><li>Mengembangkan fitur.</li><li>Meninjau kode.</li></ul>",
      '<p><a href="https://www.dicoding.com">Profil perusahaan</a></p>',
    ].join("");
    await route.fulfill({ response, json: payload });
  });

  await page.goto(`/vacancies/${vacancy.id}`);

  const description = page.getByRole("region", { name: "Deskripsi lowongan" });
  await expect(description.getByRole("heading", { name: "Deskripsi Pekerjaan", exact: true }))
    .toHaveCount(1);
  await expect(description.getByRole("heading", { name: "Tanggung Jawab", exact: true }))
    .toBeVisible();
  await expect(description.locator("strong")).toHaveText("produk pembelajaran");
  await expect(description.getByRole("listitem")).toHaveText([
    "Mengembangkan fitur.",
    "Meninjau kode.",
  ]);
  await expect(description.getByRole("link", { name: "Profil perusahaan" }))
    .toHaveAttribute("href", "https://www.dicoding.com");
  await expect(description.getByRole("heading", { name: "Job Description", exact: true }))
    .toHaveCount(0);
});

test("mobile detail metadata and description remain readable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/vacancies/${vacancy.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(vacancy.title);
  await expect(page.getByText(`Sektor bisnis: ${vacancy.company.business_sector}`)).toBeVisible();
  await expect(page.getByText(`${vacancy.company.employee_range} Karyawan`)).toBeVisible();

  const description = page.getByRole("region", { name: "Deskripsi lowongan" });
  await description.scrollIntoViewIfNeeded();
  await expect(description).toBeInViewport();
  const info = page.getByRole("region", { name: "Informasi Tambahan" });
  await info.scrollIntoViewIfNeeded();
  await expect(info).toBeInViewport();

  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  expect(hasOverflow).toBe(false);
});
