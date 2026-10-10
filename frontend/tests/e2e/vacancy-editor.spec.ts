import { expect } from "@playwright/test";
import { test } from "./helpers/vacancy-create-fixture";
import { fillForm, title } from "./helpers/vacancy-form";

const apiUrl = "http://127.0.0.1:8001/api/vacancies";

test("rich formatting is saved through the API and rendered on detail", async ({
  page,
}) => {
  await page.goto("/vacancies/create");
  await page.route("https://example.com/team.png", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jh3sAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await fillForm(page);
  const editor = page.getByRole("textbox", { name: "Deskripsi", exact: true });
  await editor.fill("Deskripsi Pekerjaan");
  await editor.press("Control+a");
  await page
    .getByRole("combobox", { name: "Format paragraf" })
    .selectOption("2");
  await editor.press("Control+End");
  await editor.press("Enter");
  await page.getByRole("button", { name: "Tebal", exact: true }).click();
  await page.getByRole("button", { name: "Miring", exact: true }).click();
  await page.getByRole("button", { name: "Garis bawah", exact: true }).click();
  await editor.pressSequentially("Build accessible products");
  for (const name of ["Tebal", "Miring", "Garis bawah"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  await editor.press("Enter");
  await page
    .getByRole("button", { name: "Daftar bullet", exact: true })
    .click();
  await editor.pressSequentially("Review code");
  await editor.press("Enter");
  await editor.pressSequentially("Collaborate with the team");
  await editor.press("Enter");
  await editor.press("Enter");
  await page.getByRole("button", { name: "Tautan", exact: true }).click();
  await page
    .getByLabel("URL tautan", { exact: true })
    .fill("https://example.com/guide");
  await page.getByRole("button", { name: "Terapkan tautan" }).click();
  await editor.press("Control+End");
  await editor.press("Enter");
  await page.getByRole("button", { name: "Blok kode", exact: true }).click();
  await editor.pressSequentially("const accessible = true;");
  await editor.press("Enter");
  await editor.press("Enter");
  await editor.press("Enter");
  await page.getByRole("button", { name: "Gambar melalui URL" }).click();
  await page
    .getByLabel("URL gambar", { exact: true })
    .fill("https://example.com/team.png");
  await page.getByLabel("Teks alternatif").fill("Tim produk");
  await page
    .getByRole("button", { name: "Sisipkan gambar", exact: true })
    .click();
  await expect(
    editor.locator("h2").filter({ hasText: "Deskripsi Pekerjaan" }),
  ).toHaveText("Deskripsi Pekerjaan");
  await expect(editor.locator("strong em u")).toHaveText(
    "Build accessible products",
  );
  await expect(editor.locator("ul li")).toHaveCount(2);

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
  await expect(page).toHaveURL("/vacancies?created=1");
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page).toHaveURL(`/vacancies/${data.id}`);
  const content = page.getByRole("region", { name: "Deskripsi lowongan" });
  await expect(
    content.locator("h2").filter({ hasText: "Deskripsi Pekerjaan" }),
  ).toHaveText("Deskripsi Pekerjaan");
  await expect(content.locator("strong em u")).toHaveText(
    "Build accessible products",
  );
  await expect(content.locator("ul li")).toHaveCount(2);
  await expect(content.locator("pre code")).toContainText(
    "const accessible = true;",
  );
  await expect(content.getByRole("link")).toHaveAttribute(
    "href",
    "https://example.com/guide",
  );
  await expect(
    content.getByRole("img", { name: "Tim produk" }),
  ).toHaveAttribute("src", "https://example.com/team.png");
});

test("formatting stays editable after a server field error", async ({
  page,
}) => {
  await page.route(apiUrl, (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 422,
          json: { errors: { description_html: ["Deskripsi ditolak server."] } },
        })
      : route.continue(),
  );
  await page.goto("/vacancies/create");
  await fillForm(page);
  const editor = page.getByRole("textbox", { name: "Deskripsi", exact: true });
  await editor.fill("Formatted content");
  await editor.press("Control+a");
  await page.getByRole("button", { name: "Tebal", exact: true }).click();
  await page
    .getByRole("button", { name: "Buat lowongan", exact: true })
    .click();
  await expect(page.locator("#description-error")).toHaveText(
    "Deskripsi ditolak server.",
  );
  await expect(editor.locator("strong")).toHaveText("Formatted content");
  await expect(editor).toHaveAttribute("contenteditable", "true");
  await editor.press("End");
  await editor.pressSequentially(" edited");
  await expect(editor).toContainText("Formatted content edited");
});

test("unsafe URLs are rejected without inserting links or images", async ({
  page,
}) => {
  await page.goto("/vacancies/create");
  const editor = page.getByRole("textbox", { name: "Deskripsi", exact: true });
  await editor.fill("Read the guide");
  await editor.press("Control+a");
  for (const [tool, label, action] of [
    ["Tautan", "URL tautan", "Terapkan tautan"],
    ["Gambar melalui URL", "URL gambar", "Sisipkan gambar"],
  ]) {
    await page.getByRole("button", { name: tool, exact: true }).click();
    for (const url of [
      "javascript:alert(1)",
      "data:image/svg+xml,test",
      "//example.com/image.png",
      "https://user:pass@example.com/image.png",
    ]) {
      await page.getByLabel(label, { exact: true }).fill(url);
      await page.getByRole("button", { name: action, exact: true }).click();
      await expect(page.locator("#editor-url-error")).toBeVisible();
      await expect(editor.locator("a, img")).toHaveCount(0);
    }
    await page
      .getByRole("group", {
        name: tool === "Tautan" ? "Sunting tautan" : "Sisipkan gambar",
      })
      .getByRole("button", { name: "Batal", exact: true })
      .click();
  }
});

test("ordered list, inline code, code block and link removal controls work", async ({
  page,
}) => {
  await page.goto("/vacancies/create");
  const editor = page.getByRole("textbox", { name: "Deskripsi", exact: true });
  await editor.fill("Review code");
  await editor.press("Control+a");
  await page
    .getByRole("button", { name: "Daftar bernomor", exact: true })
    .click();
  await expect(
    editor.locator("ol li").filter({ hasText: "Review code" }),
  ).toHaveText("Review code");
  await page
    .getByRole("button", { name: "Daftar bernomor", exact: true })
    .click();
  await page.getByRole("button", { name: "Kode inline", exact: true }).click();
  await expect(editor.locator("code")).toHaveText("Review code");
  await page.getByRole("button", { name: "Kode inline", exact: true }).click();
  await editor.press("Control+End");
  await page.getByRole("button", { name: "Blok kode", exact: true }).click();
  await editor.pressSequentially("const ready = true;");
  await expect(editor.locator("pre code")).toHaveText("const ready = true;");
  await page.getByRole("button", { name: "Blok kode", exact: true }).click();
  await editor.fill("Review code");
  await editor.press("Control+a");
  await page.getByRole("button", { name: "Tautan", exact: true }).click();
  await page
    .getByLabel("URL tautan", { exact: true })
    .fill("https://example.com");
  await page.getByRole("button", { name: "Terapkan tautan" }).click();
  await expect(editor.locator("a")).toHaveText("Review code");
  await page.getByRole("button", { name: "Tautan", exact: true }).click();
  await page.getByRole("button", { name: "Hapus tautan" }).click();
  await expect(editor.locator("a")).toHaveCount(0);
});
