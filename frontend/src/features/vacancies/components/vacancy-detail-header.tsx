import Image from "next/image";
import {
  CompanyIcon,
  EmployeesIcon,
  LocationIcon,
} from "@/components/icons/metadata-icons";
import type { Vacancy } from "../types";
import { VacancyBackLink } from "./vacancy-back-link";

type VacancyDetailHeaderProps = {
  vacancy: Vacancy;
  backHref: string;
};

export function VacancyDetailHeader({
  vacancy,
  backHref,
}: VacancyDetailHeaderProps) {
  const location = vacancy.is_remote
    ? `${vacancy.location} (Remote)`
    : vacancy.location;

  return (
    <header className="border-b border-line">
      <div className="mx-auto w-full max-w-[1150px] px-5 pb-6 pt-4 sm:relative sm:min-h-[152px] sm:pt-8">
        <div className="mb-3 sm:absolute sm:right-5 sm:top-4 sm:mb-0">
          <VacancyBackLink href={backHref} />
        </div>

        <div className="flex min-w-0 gap-4 sm:pr-48">
          <Image
            src="/images/dicoding-company.png"
            alt=""
            width={96}
            height={96}
            className="size-20 shrink-0 rounded-sm sm:size-24"
          />

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold leading-8 text-ink">
              {vacancy.title}
            </h1>
            <p className="mt-2 break-words text-sm leading-5 text-muted">
              Sektor bisnis: {vacancy.company.business_sector}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs leading-4 text-muted">
              <span className="inline-flex items-center gap-1">
                <CompanyIcon className="size-3.5 shrink-0" />
                <span className="break-words">{vacancy.company.name}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <LocationIcon className="size-3.5 shrink-0" />
                <span className="break-words">{location}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <EmployeesIcon className="size-3.5 shrink-0" />
                <span className="break-words">
                  {vacancy.company.employee_range} Karyawan
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
