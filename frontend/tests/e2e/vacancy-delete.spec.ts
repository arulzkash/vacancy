import { expect, type Page } from "@playwright/test";
import { test } from "./helpers/vacancy-create-fixture";
import { fillForm, title } from "./helpers/vacancy-form";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";

async function createVacancy(page: Page) {
  await page.goto("/vacancies/create");
  await fillForm(page);
  const created = page.waitForResponse(
    (response) =>
      response.url() === apiUrl &&
      response.request().method() === "POST" &&
      response.status() === 201,
  );
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  const { data } = await (await created).json();
  await expect(page).toHaveURL("/vacancies?created=1");
  return data.id as number;
}

function cardFor(page: Page, id: number) {
  return page
    .getByRole("article")
    .filter({ has: page.locator(`a[href="/vacancies/${id}/edit"]`) });
}

async function openDelete(page: Page, id: number) {
  await page.goto("/dashboard");
  await cardFor(page, id)
    .getByRole("button", { name: "Hapus", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Hapus lowongan?" });
  await expect(dialog).toContainText(title);
  return dialog;
}

test("cancel and Escape preserve the vacancy and restore focus on mobile", async ({
  page,
  request,
}) => {
  const id = await createVacancy(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = await openDelete(page, id);
  let deletes = 0;
  page.on("request", (request) => {
    if (request.method() === "DELETE") deletes++;
  });
  await expect(
    dialog.getByRole("button", { name: "Batal", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await dialog.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    cardFor(page, id).getByRole("button", { name: "Hapus", exact: true }),
  ).toBeFocused();
  await cardFor(page, id)
    .getByRole("button", { name: "Hapus", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(deletes).toBe(0);
  expect((await request.get(`${apiUrl}/${id}`)).status()).toBe(200);
});

test("confirmed deletion refreshes dashboard, public list and removes detail/edit", async ({
  page,
  request,
}) => {
  const id = await createVacancy(page);
  await page.goto(`/vacancies/${id}/edit`);
  await expect(
    page.getByRole("form", { name: "Simpan perubahan" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Batal", exact: true }).click();
  await cardFor(page, id)
    .getByRole("link", { name: title, exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await cardFor(page, id)
    .getByRole("button", { name: "Hapus", exact: true })
    .click();
  const deleted = page.waitForResponse(
    (response) =>
      response.url() === `${apiUrl}/${id}` &&
      response.request().method() === "DELETE",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hapus lowongan", exact: true })
    .click();
  expect((await deleted).status()).toBe(204);
  await expect(cardFor(page, id)).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("status")).toContainText(
    "berhasil dihapus",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  expect((await request.get(`${apiUrl}/${id}`)).status()).toBe(404);
  expect((await request.get(`${apiUrl}/${id}/edit`)).status()).toBe(404);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Lowongan Kerja", exact: true })
    .click();
  await expect(page.locator(`a[href="/vacancies/${id}"]`)).toHaveCount(0);
  await page.goto(`/vacancies/${id}`);
  await expect(
    page.getByRole("heading", {
      name: "Lowongan tidak ditemukan",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(`/vacancies/${id}/edit`);
  await expect(
    page.getByRole("heading", {
      name: "Lowongan tidak ditemukan",
      exact: true,
    }),
  ).toBeVisible();
});

for (const failure of ["network", "server"] as const) {
  test(`delete ${failure} failure keeps the card and retries without duplicate submits`, async ({
    page,
    request,
  }) => {
    const id = await createVacancy(page);
    const dialog = await openDelete(page, id);
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let calls = 0;
    await page.route(`${apiUrl}/${id}`, async (route) => {
      if (route.request().method() !== "DELETE") return route.continue();
      calls++;
      await gate;
      if (failure === "network") await route.abort();
      else
        await route.fulfill({ status: 500, json: { message: "Server error" } });
    });
    try {
      await dialog
        .getByRole("button", { name: "Hapus lowongan", exact: true })
        .dblclick();
      await expect(
        dialog.getByRole("button", { name: "Batal", exact: true }),
      ).toBeDisabled();
      await expect(dialog.getByRole("status")).toHaveText(
        "Menghapus lowongan…",
      );
      await page.keyboard.press("Escape");
      await expect(dialog).toBeVisible();
      expect(calls).toBe(1);
    } finally {
      release();
    }
    await expect(dialog.getByRole("alert")).toContainText("Coba lagi");
    expect((await request.get(`${apiUrl}/${id}`)).status()).toBe(200);
    await page.unroute(`${apiUrl}/${id}`);
    await dialog
      .getByRole("button", { name: "Hapus lowongan", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(cardFor(page, id)).toHaveCount(0);
  });
}

test("a vacancy removed elsewhere is reconciled on confirmation", async ({
  page,
  request,
}) => {
  const id = await createVacancy(page);
  const dialog = await openDelete(page, id);
  expect((await request.delete(`${apiUrl}/${id}`)).status()).toBe(204);
  await dialog
    .getByRole("button", { name: "Hapus lowongan", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(cardFor(page, id)).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("status")).toContainText(
    "berhasil dihapus",
  );
});
