import { expect, test } from "@playwright/test";
import type { VacancyDetail, VacancyListResponse } from "../../src/features/vacancies/types";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";

for (const width of [1440, 768, 390]) {
  test(`all vacancy pages fit a ${width}px viewport`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await request.get(apiUrl);
    const payload: VacancyListResponse = await response.json();
    const vacancy = payload.data[0];
    const screens = [
      { path: "/vacancies", ready: () => page.getByRole("article").first() },
      { path: `/vacancies/${vacancy.id}`, ready: () => page.getByRole("region", { name: "Deskripsi lowongan" }) },
      { path: "/vacancies/create", ready: () => page.getByRole("textbox", { name: "Deskripsi", exact: true }) },
      { path: `/vacancies/${vacancy.id}/edit`, ready: () => page.getByRole("textbox", { name: "Deskripsi", exact: true }) },
      { path: "/dashboard", ready: () => page.getByRole("article").first() },
    ];

    for (const [index, screen] of screens.entries()) {
      await page.goto(screen.path);
      await expect(screen.ready()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, screen.path).toBe(false);
      await page.screenshot({ path: testInfo.outputPath(`screen-${index}.png`), fullPage: true });
    }
  });

  test(`long metadata and description images fit a ${width}px viewport`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await request.get(apiUrl);
    const payload: VacancyListResponse = await response.json();
    const vacancy: VacancyDetail = { ...payload.data[0], description_html: "" };
    vacancy.title = "ProductEngineer".repeat(12);
    vacancy.company.name = "Company".repeat(30);
    vacancy.location = "Location".repeat(25);
    vacancy.description_html = `<h2>Job Description</h2><p>${"Description".repeat(100)}</p><img src="/images/dicoding-company.png" width="2000" alt="Company illustration"><pre><code>${"code".repeat(100)}</code></pre>`;

    await page.route(`${apiUrl}*`, (route) => route.fulfill({ json: { data: [vacancy] } }));
    await page.goto("/vacancies");
    await expect(page.getByRole("heading", { name: vacancy.title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.unroute(`${apiUrl}*`);
    await page.route(`${apiUrl}/${vacancy.id}`, (route) => route.fulfill({ json: { data: vacancy } }));
    await page.goto(`/vacancies/${vacancy.id}`);
    await expect(page.getByRole("region", { name: "Deskripsi lowongan" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Company illustration" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
