import type { EmploymentType, ExperienceLevel } from "./types";

export type VacancyFormValues = {
  title: string;
  position: string;
  employment_type: EmploymentType | "";
  candidate_count: string;
  closing_date: string;
  location: string;
  is_remote: boolean;
  description: string;
  salary_min: string;
  salary_max: string;
  show_salary: boolean;
  experience_level: ExperienceLevel | "";
};

export const vacancyFormDefaults: VacancyFormValues = {
  title: "",
  position: "",
  employment_type: "",
  candidate_count: "",
  closing_date: "",
  location: "",
  is_remote: false,
  description:
    "Deskripsi Pekerjaan\nSebagai [Posisi Lowongan], Anda akan berpartisipasi dalam proses pembangunan aplikasi yang sedang dibangun dalam perusahaan [Nama Perusahaan]. Anda juga diharapkan mampu bekerja dalam tim.\n\nTanggung Jawab\n• Membuat atau memodifikasi program yang sudah ada.\n• Bertanggung jawab dalam mengelola program.",
  salary_min: "",
  salary_max: "",
  show_salary: false,
  experience_level: "",
};

export function todayInJakarta(): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)?.value)
    .join("-");
}

export function textToDescriptionHtml(text: string): string {
  const escaped = text.trim().replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

  return escaped
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function vacancyPayload(values: VacancyFormValues) {
  return {
    title: values.title.trim(),
    position: values.position.trim(),
    employment_type: values.employment_type,
    candidate_count: Number(values.candidate_count),
    closing_date: dateInputToIso(values.closing_date) ?? "",
    location: values.location.trim(),
    is_remote: values.is_remote,
    description_html: textToDescriptionHtml(values.description),
    salary_min: values.salary_min === "" ? null : Number(values.salary_min),
    salary_max: values.salary_max === "" ? null : Number(values.salary_max),
    show_salary: values.show_salary,
    experience_level: values.experience_level,
  };
}

export const apiFieldNames: Record<string, keyof VacancyFormValues> = {
  title: "title",
  position: "position",
  employment_type: "employment_type",
  candidate_count: "candidate_count",
  closing_date: "closing_date",
  location: "location",
  is_remote: "is_remote",
  description_html: "description",
  salary_min: "salary_min",
  salary_max: "salary_max",
  show_salary: "show_salary",
  experience_level: "experience_level",
};

export function dateInputToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso
    ? null
    : iso;
}

export function isoToDateInput(value: string): string {
  return value ? value.split("-").reverse().join("/") : "";
}
