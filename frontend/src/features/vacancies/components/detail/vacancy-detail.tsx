"use client";

import { ApiError } from "@/lib/api-error";
import { employmentTypeLabels } from "../../labels";
import { useVacancy } from "../../hooks/use-vacancy";
import { VacancyAdditionalInfo } from "./vacancy-additional-info";
import { VacancyBackLink } from "../vacancy-back-link";
import { VacancyDescription } from "./vacancy-description";
import { VacancyDetailError } from "./vacancy-detail-error";
import { VacancyDetailHeader } from "./vacancy-detail-header";
import { VacancyDetailSkeleton } from "./vacancy-detail-skeleton";
import { VacancyNotFound } from "../vacancy-not-found";

type VacancyDetailProps = {
  id: number;
  backHref: string;
};

export function VacancyDetail({ id, backHref }: VacancyDetailProps) {
  const { data, error, isPending, isError, isFetching, refetch } = useVacancy(id);

  if (isPending) {
    return <VacancyDetailSkeleton />;
  }

  if (error instanceof ApiError && error.status === 404) {
    return <VacancyNotFound backHref={backHref} />;
  }

  if (isError && data === undefined) {
    return (
      <section className="mx-auto max-w-[770px] px-5 py-11">
        <VacancyBackLink href={backHref} />
        <div className="mt-6">
          <VacancyDetailError
            isRetrying={isFetching}
            onRetry={() => void refetch()}
          />
        </div>
      </section>
    );
  }

  if (data === undefined) {
    return null;
  }

  return (
    <>
      <VacancyDetailHeader vacancy={data} backHref={backHref} />

      <div className="mx-auto w-full max-w-[770px] px-5 pb-16 pt-8">
        {isError && (
          <div className="mb-6">
            <VacancyDetailError
              hasPreviousData
              isRetrying={isFetching}
              onRetry={() => void refetch()}
            />
          </div>
        )}

        <span className="inline-flex min-h-[30px] items-center rounded-[32px] border border-[#60a5fa] bg-[#eff6ff] px-4 py-1 text-sm leading-5 text-[#3b82f6]">
          {employmentTypeLabels[data.employment_type]}
        </span>

        <div className="mt-8 space-y-10">
          <VacancyDescription html={data.description_html} />
          <VacancyAdditionalInfo
            experience={data.experience_level}
            candidateCount={data.candidate_count}
          />
        </div>
      </div>
    </>
  );
}
