import { expect } from "@playwright/test";
import { test } from "./helpers/vacancy-create-fixture";
import { fillForm, title } from "./helpers/vacancy-form";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";

async function createHiddenVacancy(page: import("@playwright/test").Page) {
  await page.goto("/vacancies/create");
  await fillForm(page);
  await page
    .getByRole("switch", { name: "Tampilkan gaji", exact: true })
    .uncheck();
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

async function openEdit(page: import("@playwright/test").Page, id: number) {
  await page.goto(`/vacancies/${id}/edit`);
  await expect(
    page.getByRole("form", { name: "Simpan perubahan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Deskripsi", exact: true }),
  ).toBeVisible();
}

const saveButton = { name: "Simpan perubahan", exact: true };

test("dashboard edit prefills all fields, preserves hidden salaries, and updates list and cached detail", async ({
  page,
  request,
}) => {
  const id = await createHiddenVacancy(page);
  // Prime the public detail cache before updating it.
  await page.goto(`/vacancies/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  const card = page
    .getByRole("article")
    .filter({ has: page.locator(`a[href="/vacancies/${id}/edit"]`) });
  await card.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(page).toHaveURL(`/vacancies/${id}/edit`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Edit lowongan pekerjaan",
  );
  await expect(
    page
      .getByRole("navigation")
      .getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
  ).toHaveValue(title);
  await expect(
    page.getByRole("combobox", { name: "Posisi", exact: true }),
  ).toHaveValue("Frontend Engineer");
  await expect(
    page.getByRole("radio", { name: "Full-Time", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("spinbutton", {
      name: "Kandidat yang dibutuhkan",
      exact: true,
    }),
  ).toHaveValue("2");
  await expect(page.getByLabel("Aktif hingga")).toHaveValue("01/11/2030");
  await expect(
    page.getByRole("combobox", { name: "Lokasi", exact: true }),
  ).toHaveValue("Bandung");
  await expect(
    page.getByRole("checkbox", { name: "Bisa remote", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "1-3 tahun", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("spinbutton", { name: "Gaji minimum", exact: true }),
  ).toHaveValue("5000000");
  await expect(
    page.getByRole("spinbutton", { name: "Gaji maksimum", exact: true }),
  ).toHaveValue("8000000");
  await expect(
    page.getByRole("switch", { name: "Tampilkan gaji", exact: true }),
  ).not.toBeChecked();

  await page
    .getByRole("textbox", { name: "Judul lowongan", exact: true })
    .fill("Slice 8 Updated Engineer");
  const editor = page.getByRole("textbox", { name: "Deskripsi", exact: true });
  await editor.fill("Updated responsibilities");
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Tebal", exact: true }).click();
  const updated = page.waitForResponse(
    (response) =>
      response.url() === `${apiUrl}/${id}` &&
      response.request().method() === "PUT",
  );
  await page.getByRole("button", saveButton).click();
  expect((await updated).status()).toBe(200);
  await expect(page).toHaveURL("/dashboard?updated=1");
  await expect(page.getByRole("status")).toHaveText(
    "Lowongan berhasil diperbarui.",
  );
  await expect(
    page.getByRole("heading", {
      name: "Slice 8 Updated Engineer",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Slice 8 Updated Engineer", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Slice 8 Updated Engineer",
  );
  await expect(
    page.locator("strong", { hasText: "Updated responsibilities" }),
  ).toBeVisible();
  const publicDetail = await (await request.get(`${apiUrl}/${id}`)).json();
  expect(publicDetail.data.salary_min).toBeNull();
  const editData = await (await request.get(`${apiUrl}/${id}/edit`)).json();
  expect(editData.data.salary_min).toBe(5000000);
  expect(editData.data.salary_max).toBe(8000000);
  await page.goto("/vacancies?search=Slice%208%20Updated");
  await expect(
    page.getByRole("heading", {
      name: "Slice 8 Updated Engineer",
      exact: true,
    }),
  ).toBeVisible();
});

test("edit 422 preserves entered values and rich formatting, then retries successfully", async ({
  page,
}) => {
  const id = await createHiddenVacancy(page);
  await openEdit(page, id);
  const editor = page.getByRole("textbox", { name: "Deskripsi", exact: true });
  await editor.fill("Keep this description");
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Tebal", exact: true }).click();
  await page.route(`${apiUrl}/${id}`, (route) =>
    route.fulfill({
      status: 422,
      json: {
        errors: {
          title: ["Judul ditolak server."],
          description_html: ["Periksa deskripsi."],
        },
      },
    }),
  );
  await page.getByRole("button", saveButton).click();
  await expect(
    page.getByText("Judul ditolak server.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Periksa deskripsi.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
  ).toHaveValue(title);
  await expect(editor.locator("strong")).toHaveText("Keep this description");
  await page.unroute(`${apiUrl}/${id}`);
  await page.getByRole("button", saveButton).click();
  await expect(page).toHaveURL("/dashboard?updated=1");
});

for (const failure of ["network", "server"] as const) {
  test(`failed ${failure} update preserves the form and prevents duplicate submits`, async ({
    page,
  }) => {
    const id = await createHiddenVacancy(page);
    await openEdit(page, id);
    await page
      .getByRole("textbox", { name: "Judul lowongan", exact: true })
      .fill("Unsaved change");
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let calls = 0;
    await page.route(`${apiUrl}/${id}`, async (route) => {
      calls++;
      await gate;
      if (failure === "network") await route.abort();
      else
        await route.fulfill({ status: 500, json: { message: "Server error" } });
    });
    await page.getByRole("button", saveButton).dblclick();
    try {
      await expect(
        page.getByRole("button", { name: "Menyimpan…", exact: true }),
      ).toBeDisabled();
      await expect(
        page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
      ).toBeDisabled();
      expect(calls).toBe(1);
    } finally {
      release();
    }
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Isian Anda tetap tersimpan",
    );
    await expect(
      page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
    ).toHaveValue("Unsaved change");
    await expect(page.getByRole("button", saveButton)).toBeEnabled();
    await page.unroute(`${apiUrl}/${id}`);
    await page.getByRole("link", { name: "Batal", exact: true }).click();
    await expect(page).toHaveURL("/dashboard");
  });
}

test("client validation and cancel leave the vacancy unchanged", async ({
  page,
  request,
}) => {
  const id = await createHiddenVacancy(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await openEdit(page, id);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page
    .getByRole("textbox", { name: "Judul lowongan", exact: true })
    .fill("");
  await page.getByRole("textbox", { name: "Deskripsi", exact: true }).fill("");
  await page.getByRole("button", saveButton).click();
  await expect(
    page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("textbox", { name: "Deskripsi", exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("link", { name: "Batal", exact: true }).click();
  await expect(page).toHaveURL("/dashboard");
  const { data } = await (await request.get(`${apiUrl}/${id}`)).json();
  expect(data.title).toBe(title);
});

test("edit loading, fetch retry, and missing IDs have clear states", async ({
  page,
}) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`${apiUrl}/1/edit`, async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/vacancies/1/edit");
  try {
    await expect(
      page.getByRole("status", { name: "", exact: true }),
    ).toContainText("Memuat form edit");
  } finally {
    release();
  }
  await expect(
    page.getByRole("form", { name: "Simpan perubahan" }),
  ).toBeVisible();
  await page.unroute(`${apiUrl}/1/edit`);
  await page.route(`${apiUrl}/1/edit`, (route) =>
    route.fulfill({ status: 500, json: {} }),
  );
  await page.reload();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "belum dapat dimuat",
  );
  await page.unroute(`${apiUrl}/1/edit`);
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await expect(
    page.getByRole("form", { name: "Simpan perubahan" }),
  ).toBeVisible();
  await page.goto("/vacancies/999999/edit");
  await expect(
    page.getByRole("heading", {
      name: "Lowongan tidak ditemukan",
      exact: true,
    }),
  ).toBeVisible();
});
