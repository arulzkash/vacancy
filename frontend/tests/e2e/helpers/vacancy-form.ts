import type { Page } from "@playwright/test";

export const title = "Slice 5 E2E Frontend Engineer";
export const description =
  'Build accessible products & collaborate.\nUse <script>alert("test")</script> as literal text.\n\nReview code with the team.';

export async function fillForm(page: Page) {
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
