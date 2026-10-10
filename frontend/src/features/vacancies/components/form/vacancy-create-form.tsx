"use client";

import { useCreateVacancy } from "../../hooks/use-create-vacancy";
import { VacancyForm } from "./vacancy-form";

export function VacancyCreateForm() {
  const mutation = useCreateVacancy();

  return (
    <VacancyForm
      submitLabel="Buat lowongan"
      successHref="/vacancies?created=1"
      onSave={mutation.mutateAsync}
    />
  );
}
