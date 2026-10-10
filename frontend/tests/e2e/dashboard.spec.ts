import { expect, test } from "@playwright/test";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";

test("dashboard renders API vacancies in order with dates and edit navigation", async ({
  page,
  request,
}) => {
  const response = await request.get(apiUrl);
  expect(response.ok()).toBe(true);
  const { data } = await response.json();
  await page.goto("/vacancies");
  const navigation = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(
    navigation.getByRole("link", { name: "Buat lowongan" }),
  ).toHaveCount(0);
  await navigation
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(page).toHaveURL("/dashboard");
  await expect(page).toHaveTitle("Dashboard | Dicoding Jobs");
  await expect(
    navigation.getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Lowongan Saya",
  );
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(data.length);
  for (const [index, vacancy] of data.entries()) {
    const card = cards.nth(index);
    await expect(card.getByRole("heading")).toHaveText(vacancy.title);
    await expect(card.locator("time").first()).toHaveAttribute(
      "datetime",
      vacancy.created_at,
    );
    await expect(card.locator("time").last()).toHaveAttribute(
      "datetime",
      vacancy.closing_date,
    );
    await expect(
      card.getByRole("link", { name: "Edit", exact: true }),
    ).toHaveAttribute("href", `/vacancies/${vacancy.id}/edit`);
    await expect(
      card.getByRole("button", { name: "Hapus", exact: true }),
    ).toBeEnabled();
  }
  await cards
    .first()
    .getByRole("link", { name: data[0].title, exact: true })
    .click();
  await expect(page).toHaveURL(`/vacancies/${data[0].id}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    data[0].title,
  );
});

test("dashboard loading stays visible while the actual API request is pending", async ({
  page,
}) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(apiUrl, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/dashboard");
  try {
    await expect(
      page.getByRole("status", { name: "Memuat lowongan saya" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Buat lowongan", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.getByRole("article")).toHaveCount(4);
});

test("empty dashboard still lets the recruiter open create and cancel", async ({
  page,
}) => {
  await page.route(apiUrl, (route) => route.fulfill({ json: { data: [] } }));
  await page.goto("/dashboard");
  await expect(page.getByRole("status")).toContainText("Belum ada lowongan.");
  await page.getByRole("link", { name: "Buat lowongan", exact: true }).click();
  await expect(page).toHaveURL("/vacancies/create");
  await expect(
    page
      .getByRole("navigation", { name: "Navigasi utama" })
      .getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Batal", exact: true }).click();
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("status")).toContainText("Belum ada lowongan.");
});

for (const failure of ["network", "server"] as const) {
  test(`dashboard recovers from ${failure} failure with actual API retry`, async ({
    page,
  }) => {
    await page.route(apiUrl, (route) =>
      failure === "network"
        ? route.abort()
        : route.fulfill({ status: 500, json: { message: "Server error" } }),
    );
    await page.goto("/dashboard");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Daftar lowongan belum dapat dimuat.",
    );
    await page.unroute(apiUrl);
    await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(4);
  });
}

test("dashboard supports direct URLs, reload, and mobile without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "Buat lowongan", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  const firstCard = page.getByRole("article").first();
  await expect(
    firstCard.getByRole("button", { name: "Hapus", exact: true }),
  ).toBeVisible();
});
