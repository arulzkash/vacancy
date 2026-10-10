import { expect, type Page } from "@playwright/test";
import { test } from "./helpers/vacancy-create-fixture";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";
const title = "Slice 5 E2E Frontend Engineer";
const description =
  'Build accessible products & collaborate.\nUse <script>alert("test")</script> as literal text.\n\nReview code with the team.';

async function fillForm(page: Page) {
  await page
    .getByRole("textbox", { name: "Judul lowongan", exact: true })
    .fill(title);
  await page
    .getByRole("combobox", { name: "Posisi", exact: true })
    .fill("Frontend Engineer");
  await page.getByRole("radio", { name: "Full-Time", exact: true }).check();
  await page
    .getByRole("spinbutton", { name: "Kandidat yang dibutuhkan", exact: true })
    .fill("2");
  await page.getByLabel("Aktif hingga").fill("01/11/2030");
  await page
    .getByRole("combobox", { name: "Lokasi", exact: true })
    .fill("Bandung");
  await page
    .getByRole("checkbox", { name: "Bisa remote", exact: true })
    .check();
  await page
    .getByRole("textbox", { name: "Deskripsi", exact: true })
    .fill(description);
  await page
    .getByRole("spinbutton", { name: "Gaji minimum", exact: true })
    .fill("5000000");
  await page
    .getByRole("spinbutton", { name: "Gaji maksimum", exact: true })
    .fill("8000000");
  await page
    .getByRole("switch", {
      name: "Tampilkan gaji",
      exact: true,
    })
    .check();
  await page.getByRole("radio", { name: "1-3 tahun", exact: true }).check();
}

test("recruiter creates a vacancy and a job seeker can find and open it", async ({
  page,
}) => {
  // Prime the unfiltered list cache before navigating through a search.
  await page.goto("/vacancies");
  await expect(page.getByRole("article")).toHaveCount(4);
  await page.getByRole("searchbox").fill("Android");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Buat lowongan", exact: true })
    .click();
  await expect(page).toHaveURL("/vacancies/create");
  await fillForm(page);

  const postResponse = page.waitForResponse(
    (response) =>
      response.url() === apiUrl && response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  const response = await postResponse;
  expect(response.status()).toBe(201);
  const payload = await response.json();
  expect(payload.data.description_html).toContain("&lt;script&gt;");
  expect(payload.data.salary_min).toBe(5000000);
  expect(payload.data.is_remote).toBe(true);

  await expect(page).toHaveURL("/vacancies?created=1");
  await expect(page.getByRole("status")).toHaveText(
    "Lowongan berhasil dibuat.",
  );
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.getByRole("article")).toHaveCount(5);
  await expect(page.getByRole("heading", { level: 3 }).first()).toHaveText(
    title,
  );

  await page.getByRole("searchbox").fill(title);
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  const content = page.getByRole("region", { name: "Deskripsi lowongan" });
  await expect(content).toContainText(
    'Use <script>alert("test")</script> as literal text.',
  );
  await expect(content.locator("script")).toHaveCount(0);
  await expect(page.getByText("2 kandidat", { exact: true })).toBeVisible();
});

test("client validation stops an empty form before sending a POST", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.url() === apiUrl && request.method() === "POST") posts += 1;
  });
  await page.goto("/vacancies/create");
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  await expect(page.locator("#title-error")).toHaveText(
    "Field ini wajib diisi.",
  );
  await expect(page.locator("#salary_min-error")).toHaveText(
    "Gaji minimum wajib diisi.",
  );
  await expect(
    page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
  ).toBeFocused();
  expect(posts).toBe(0);
});

test("server field errors map description_html to the textarea and preserve input", async ({
  page,
}) => {
  await page.route(apiUrl, (route) => {
    if (route.request().method() !== "POST") return route.continue();
    return route.fulfill({
      status: 422,
      json: {
        message: "Invalid data",
        errors: {
          title: ["Judul ditolak server."],
          description_html: ["Deskripsi ditolak server."],
        },
      },
    });
  });
  await page.goto("/vacancies/create");
  await fillForm(page);
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  await expect(page.locator("#title-error")).toHaveText(
    "Judul ditolak server.",
  );
  await expect(page.locator("#description-error")).toHaveText(
    "Deskripsi ditolak server.",
  );
  await expect(
    page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
  ).toHaveValue(title);
  await expect(
    page.getByRole("textbox", { name: "Deskripsi", exact: true }),
  ).toHaveValue(description);
  await expect(
    page.getByRole("button", { name: "Buat lowongan", exact: true }),
  ).toBeEnabled();
  await expect(page).toHaveURL("/vacancies/create");
});

for (const failure of ["network", "server"] as const) {
  test(`${failure} failure keeps the form editable for another attempt`, async ({
    page,
  }) => {
    await page.route(apiUrl, (route) => {
      if (route.request().method() !== "POST") return route.continue();
      return failure === "network"
        ? route.abort()
        : route.fulfill({ status: 500, json: { message: "Server error" } });
    });
    await page.goto("/vacancies/create");
    await fillForm(page);
    await page
      .getByRole("button", { name: "Buat lowongan", exact: true })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Lowongan belum dapat disimpan.",
    );
    await expect(
      page.getByRole("textbox", { name: "Deskripsi", exact: true }),
    ).toHaveValue(description);
    await expect(
      page.getByRole("button", { name: "Buat lowongan", exact: true }),
    ).toBeEnabled();
  });
}

test("a pending submission disables the form and sends only one POST", async ({
  page,
}) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let posts = 0;
  await page.route(apiUrl, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    posts += 1;
    await gate;
    await route.continue();
  });
  await page.goto("/vacancies/create");
  await fillForm(page);
  try {
    await page
      .getByRole("button", { name: "Buat lowongan", exact: true })
      .dblclick();
    await expect(
      page.getByRole("button", { name: "Menyimpan…", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("textbox", { name: "Judul lowongan", exact: true }),
    ).toBeDisabled();
    expect(posts).toBe(1);
  } finally {
    release();
  }
  await expect(page).toHaveURL("/vacancies?created=1");
});

test("salary validation rejects an inverted range without losing the values", async ({
  page,
}) => {
  await page.goto("/vacancies/create");
  await fillForm(page);
  await page
    .getByRole("spinbutton", { name: "Gaji maksimum", exact: true })
    .fill("4000000");
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  await expect(page.locator("#salary_max-error")).toHaveText(
    "Gaji maksimum tidak boleh di bawah minimum.",
  );
  await expect(
    page.getByRole("spinbutton", { name: "Gaji maksimum", exact: true }),
  ).toHaveValue("4000000");
});

test("create form remains usable on mobile without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vacancies/create");
  await fillForm(page);
  await expect(
    page.getByRole("button", { name: "Buat lowongan", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("a visible base salary can be created without a maximum", async ({
  page,
}) => {
  await page.goto("/vacancies/create");
  await fillForm(page);
  await page
    .getByRole("spinbutton", { name: "Gaji maksimum", exact: true })
    .fill("");
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === apiUrl && response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const { data } = await response.json();
  expect(data.salary_min).toBe(5000000);
  expect(data.salary_max).toBeNull();
  expect(data.closing_date).toBe("2030-11-01");
  await expect(page).toHaveURL("/vacancies?created=1");
});

test("invalid calendar dates and a cleared description are rejected before POST", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.url() === apiUrl && request.method() === "POST") posts += 1;
  });
  await page.goto("/vacancies/create");
  await expect(
    page.getByRole("textbox", { name: "Deskripsi", exact: true }),
  ).toHaveValue(/Deskripsi Pekerjaan/);
  await page.getByRole("button", { name: "Pilih tanggal aktif" }).click();
  await page.keyboard.press("Escape");
  await page.locator('input[type="date"]').fill("2030-12-05");
  await expect(page.getByLabel("Aktif hingga")).toHaveValue("05/12/2030");
  await fillForm(page);
  await page.getByLabel("Aktif hingga").fill("31/02/2030");
  await page.getByRole("textbox", { name: "Deskripsi", exact: true }).fill("");
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  await expect(page.locator("#closing_date-error")).toHaveText(
    "Gunakan tanggal yang valid dengan format dd/mm/yyyy.",
  );
  await expect(page.locator("#description-error")).toHaveText(
    "Deskripsi wajib diisi.",
  );
  expect(posts).toBe(0);
});
