"use client";

import { useVacancySearch } from "../../hooks/use-vacancy-search";
import { VacancyList } from "./vacancy-list";
import { VacancySearch } from "./vacancy-search";
import { VacancyCreatedNotice } from "./vacancy-created-notice";

export function VacancyResults() {
  const { keyword, applySearch, scheduleSearch } = useVacancySearch();

  return (
    <>
      <VacancyCreatedNotice />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="vacancies-heading"
          className="text-xl font-semibold leading-8 sm:text-2xl"
        >
          {keyword === "" ? "Daftar Pekerjaan Terbaru" : "Hasil Pencarian"}
        </h2>

        <VacancySearch
          keyword={keyword}
          onChange={scheduleSearch}
          onSubmit={applySearch}
        />
      </div>

      <VacancyList search={keyword} />
    </>
  );
}
