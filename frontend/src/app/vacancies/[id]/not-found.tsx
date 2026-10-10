import { VacancyNotFound } from "@/features/vacancies/components/vacancy-not-found";

export default function VacancyDetailNotFound() {
  return (
    <main id="main-content" tabIndex={-1}>
      <VacancyNotFound backHref="/vacancies" />
    </main>
  );
}
