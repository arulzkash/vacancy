import { expect, test } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";

for (const scenario of [
  {
    name: "visible range",
    show: true,
    min: 3800000,
    max: 6000000,
    text: "Rp3.800.000 - Rp6.000.000 per bulan",
  },
  {
    name: "zero base salary",
    show: true,
    min: 0,
    max: null,
    text: "Rp0 per bulan",
  },
  {
    name: "hidden values",
    show: false,
    min: 3800000,
    max: 6000000,
    text: null,
  },
  { name: "missing minimum", show: true, min: null, max: null, text: null },
]) {
  test(`salary display handles ${scenario.name} in list and detail on mobile`, async ({
    page,
    request,
  }) => {
    const response = await request.get(apiUrl);
    const { data } = await response.json();
    const vacancy = {
      ...data[0],
      show_salary: scenario.show,
      salary_min: scenario.min,
      salary_max: scenario.max,
    };
    await page.route(apiUrl, (route) =>
      route.fulfill({ json: { data: [vacancy] } }),
    );
    await page.route(`${apiUrl}/${vacancy.id}`, async (route) => {
      const detail = await (await route.fetch()).json();
      await route.fulfill({ json: { data: { ...detail.data, ...vacancy } } });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/vacancies");
    const card = page.getByRole("article", {
      name: vacancy.title,
      exact: true,
    });
    await expect(card).toBeVisible();
    if (scenario.text) {
      await expect(
        card.getByText(scenario.text, { exact: true }),
      ).toBeVisible();
    } else {
      await expect(card).not.toContainText("per bulan");
      await expect(card).not.toContainText("Gaji:");
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await card.getByRole("link", { name: vacancy.title, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      vacancy.title,
    );
    if (scenario.text) {
      await expect(
        page.getByText(`Gaji: ${scenario.text}`, { exact: true }),
      ).toBeVisible();
    } else {
      await expect(page.getByText(/^Gaji:/)).toHaveCount(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}
