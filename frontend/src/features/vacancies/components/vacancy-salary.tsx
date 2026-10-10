import { SalaryIcon } from "@/components/icons/metadata-icons";
import { formatVacancySalary } from "../salary";
import type { Vacancy } from "../types";

type VacancySalaryProps = {
  vacancy: Vacancy;
  variant: "card" | "detail";
};

export function VacancySalary({ vacancy, variant }: VacancySalaryProps) {
  const salary = formatVacancySalary(vacancy);
  if (salary === null) return null;

  if (variant === "detail") {
    return (
      <p className="mt-2 break-words text-sm leading-5 text-muted">
        Gaji: {salary}
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-xs leading-5 text-muted">
      <SalaryIcon className="size-4 shrink-0" />
      <span className="sr-only">Gaji: </span>
      <span className="min-w-0 break-words">{salary}</span>
    </p>
  );
}
