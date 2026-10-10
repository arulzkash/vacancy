import type { EmploymentType, ExperienceLevel, VacancyDetail } from "./types";
import { descriptionTemplate } from "./utils/description-content";

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
  description: descriptionTemplate,
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

export function vacancyPayload(values: VacancyFormValues) {
  return {
    title: values.title.trim(),
    position: values.position.trim(),
    employment_type: values.employment_type,
    candidate_count: Number(values.candidate_count),
    closing_date: dateInputToIso(values.closing_date) ?? "",
    location: values.location.trim(),
    is_remote: values.is_remote,
    description_html: values.description,
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

export function vacancyFormValues(vacancy: VacancyDetail): VacancyFormValues {
  return {
    title: vacancy.title,
    position: vacancy.position,
    employment_type: vacancy.employment_type,
    candidate_count: String(vacancy.candidate_count),
    closing_date: isoToDateInput(vacancy.closing_date),
    location: vacancy.location,
    is_remote: vacancy.is_remote,
    description: vacancy.description_html,
    salary_min: vacancy.salary_min === null ? "" : String(vacancy.salary_min),
    salary_max: vacancy.salary_max === null ? "" : String(vacancy.salary_max),
    show_salary: vacancy.show_salary,
    experience_level: vacancy.experience_level,
  };
}
