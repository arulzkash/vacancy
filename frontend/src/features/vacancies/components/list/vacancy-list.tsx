"use client";

import { useVacancies } from "../../hooks/use-vacancies";
import { vacancyDetailHref } from "../../utils/links";
import { JobCard } from "./job-card";
import { VacancyListEmpty } from "./vacancy-list-empty";
import { VacancyListError } from "./vacancy-list-error";
import { VacancyListSkeleton } from "./vacancy-list-skeleton";

type VacancyListProps = {
  search: string;
};

export function VacancyList({ search }: VacancyListProps) {
  const { data, isPending, isError, isFetching, refetch } = useVacancies(search);

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
        <VacancyListEmpty search={search} />
      ) : (
        <ul aria-label="Daftar lowongan" className="space-y-6">
          {vacancies.map((vacancy) => (
            <li key={vacancy.id}>
              <JobCard
                vacancy={vacancy}
                href={vacancyDetailHref(vacancy.id, search)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
