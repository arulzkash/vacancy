import type { Metadata } from "next";
import { VacancyCreateForm } from "@/features/vacancies/components/form/vacancy-create-form";
import { VacancyCreateHero } from "@/features/vacancies/components/form/vacancy-create-hero";

export const metadata: Metadata = { title: "Buat Lowongan | Dicoding Jobs" };

export default function VacancyCreatePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <VacancyCreateHero />
      <VacancyCreateForm />
    </main>
  );
}
