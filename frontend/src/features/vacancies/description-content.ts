export const descriptionTemplate = [
  "<h2>Deskripsi Pekerjaan</h2>",
  "<p>Sebagai [Posisi Lowongan], Anda akan berpartisipasi dalam proses pembangunan aplikasi yang sedang dibangun dalam perusahaan [Nama Perusahaan]. Anda juga diharapkan mampu bekerja dalam tim.</p>",
  "<h2>Tanggung Jawab</h2>",
  "<ul><li><p>Membuat atau memodifikasi program yang sudah ada.</p></li><li><p>Bertanggung jawab dalam mengelola program.</p></li></ul>",
].join("");

export function hasDescriptionText(html: string): boolean {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script, style").forEach((node) => node.remove());
  return /[^\s\p{Z}\p{Cf}]/u.test(document.body.textContent ?? "");
}

export function safeEditorUrl(value: string): string | null {
  const text = value.trim();
  if (!/^https?:\/\//i.test(text) || /[\u0000-\u0020\u007f]/.test(text))
    return null;
  try {
    const url = new URL(text);
    return url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
