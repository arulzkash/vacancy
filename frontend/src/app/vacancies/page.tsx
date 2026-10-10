import type { Metadata } from "next";
import { Suspense } from "react";
import { VacanciesHero } from "@/features/vacancies/components/list/vacancies-hero";
import { VacancyResults } from "@/features/vacancies/components/list/vacancy-results";
import { VacancyListSkeleton } from "@/features/vacancies/components/list/vacancy-list-skeleton";

export const metadata: Metadata = {
  title: "Lowongan Kerja | Dicoding Jobs",
};

export default function VacanciesPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <VacanciesHero />

      <section
        aria-labelledby="vacancies-heading"
        className="mx-auto w-full max-w-[768px] px-5 py-12"
      >
        <Suspense fallback={<VacancyListSkeleton />}>
          <VacancyResults />
        </Suspense>
      </section>
    </main>
  );
}
