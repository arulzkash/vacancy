"use client";

import { useVacancies } from "../use-vacancies";
import { JobCard } from "./job-card";
import { VacancyListEmpty } from "./vacancy-list-empty";
import { VacancyListError } from "./vacancy-list-error";
import { VacancyListSkeleton } from "./vacancy-list-skeleton";

export function VacancyList() {
  const { data, isPending, isError, isFetching, refetch } = useVacancies();

  function handleRetry() {
    void refetch();
  }

  if (isPending) {
    return <VacancyListSkeleton />;
  }

  if (isError && data === undefined) {
    return (
      <VacancyListError onRetry={handleRetry} isRetrying={isFetching} />
    );
  }

  const vacancies = data ?? [];

  return (
    <div className="space-y-6">
      {isError && (
        <VacancyListError onRetry={handleRetry} isRetrying={isFetching} />
      )}

      {vacancies.length === 0 ? (
        <VacancyListEmpty />
      ) : (
        <ul aria-label="Daftar lowongan" className="space-y-6">
          {vacancies.map((vacancy) => (
            <li key={vacancy.id}>
              <JobCard vacancy={vacancy} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
