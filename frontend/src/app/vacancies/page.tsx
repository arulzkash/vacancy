import type { Metadata } from "next";
import { VacanciesHero } from "@/features/vacancies/components/vacancies-hero";
import { VacancyList } from "@/features/vacancies/components/vacancy-list";

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
        <h2
          id="vacancies-heading"
          className="mb-6 text-xl font-semibold leading-8 sm:text-2xl"
        >
          Daftar Pekerjaan Terbaru
        </h2>

        <VacancyList />
      </section>
    </main>
  );
}
