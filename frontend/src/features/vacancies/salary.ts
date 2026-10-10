import type { Vacancy } from "./types";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function formatVacancySalary(
  vacancy: Pick<Vacancy, "show_salary" | "salary_min" | "salary_max">,
): string | null {
  if (!vacancy.show_salary || vacancy.salary_min === null) return null;

  const minimum = `Rp${rupiahFormatter.format(vacancy.salary_min)}`;

  if (vacancy.salary_max === null) return `${minimum} per bulan`;

  const maximum = `Rp${rupiahFormatter.format(vacancy.salary_max)}`;
  return `${minimum} - ${maximum} per bulan`;
}
