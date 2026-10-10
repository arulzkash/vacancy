"use client";

import { ApiError } from "@/lib/api-error";
import { vacancyFormValues } from "../../form-values";
import { useUpdateVacancy, useVacancyForEdit } from "../../hooks/use-edit-vacancy";
import { VacancyForm } from "./vacancy-form";
import { VacancyNotFound } from "../vacancy-not-found";

export function VacancyEditForm({ id }: { id: number }) {
  const query = useVacancyForEdit(id);
  const mutation = useUpdateVacancy(id);

  if (query.isPending) {
    return (
      <p role="status" className="mx-auto max-w-[640px] px-5 py-10">
        Memuat form edit lowongan...
      </p>
    );
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return <VacancyNotFound backHref="/dashboard" />;
    }
    return (
      <div className="mx-auto max-w-[640px] px-5 py-10">
        <p role="alert">Lowongan yang akan diedit belum dapat dimuat.</p>
        <button
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
          className="mt-4 rounded-sm bg-brand-navy px-5 py-3 text-white disabled:opacity-60"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <VacancyForm
      key={id}
      initialValues={vacancyFormValues(query.data)}
      requireMinimumSalary={false}
      descriptionHint="Anda bisa mengubah deskripsi lowongan di atas."
      submitLabel="Simpan perubahan"
      successHref="/dashboard?updated=1"
      onSave={mutation.mutateAsync}
    />
  );
}
