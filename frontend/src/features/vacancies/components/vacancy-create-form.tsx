"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { VacancyValidationError } from "../create-api";
import {
  apiFieldNames,
  vacancyFormDefaults,
  vacancyPayload,
  type VacancyFormValues,
} from "../create-form";
import { createExperienceLevelLabels } from "../labels";
import { useCreateVacancy } from "../use-create-vacancy";
import { VacancyDescriptionField } from "./form/vacancy-description-field";
import { RadioField } from "./form/radio-field";
import { VacancyInformationFields } from "./form/vacancy-information-fields";
import { VacancySalaryFields } from "./form/vacancy-salary-fields";

export function VacancyCreateForm() {
  const form = useForm<VacancyFormValues>({
    defaultValues: vacancyFormDefaults,
    shouldFocusError: false,
  });
  const mutation = useCreateVacancy();
  const router = useRouter();
  const submitting = useRef(false);
  const {
    handleSubmit,
    setError,
    clearErrors,
    setFocus,
    formState: { errors, isSubmitting },
  } = form;

  function focusInvalidField(fieldErrors: FieldErrors<VacancyFormValues>) {
    const firstField = Object.values(apiFieldNames).find(
      (name) => fieldErrors[name],
    );
    if (firstField) {
      setFocus(firstField);
    }
  }

  async function save(values: VacancyFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    clearErrors();

    try {
      await mutation.mutateAsync(vacancyPayload(values));
      router.replace("/vacancies?created=1");
    } catch (error) {
      if (error instanceof VacancyValidationError) {
        let focusFirstField = true;
        for (const [apiName, messages] of Object.entries(error.fields)) {
          const name = apiFieldNames[apiName];
          if (name && messages[0]) {
            setError(
              name,
              { type: "server", message: messages[0] },
              { shouldFocus: focusFirstField },
            );
            focusFirstField = false;
          }
        }
        setError("root", { message: "Periksa kembali isian yang ditandai." });
      } else {
        setError("root", {
          message:
            "Lowongan belum dapat disimpan. Isian Anda tetap tersimpan. Silakan coba lagi.",
        });
      }
      submitting.current = false;
    }
  }

  const busy = isSubmitting || mutation.isPending || mutation.isSuccess;

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(save, focusInvalidField)(event)}
        aria-label="Buat lowongan"
        className="mx-auto max-w-[640px] px-5 pb-16 pt-10"
      >
        <fieldset
          disabled={mutation.isPending || mutation.isSuccess}
          className="min-w-0 space-y-8"
        >
          <VacancyInformationFields />
          <VacancyDescriptionField
            disabled={mutation.isPending || mutation.isSuccess}
          />
          <VacancySalaryFields />
          <RadioField
            name="experience_level"
            label="Minimum pengalaman bekerja"
            options={createExperienceLevelLabels}
          />
        </fieldset>

        {errors.root && (
          <p role="alert" className="mt-6 text-sm leading-5 text-red-700">
            {errors.root.message}
          </p>
        )}
        <div className="mt-20 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="h-10 w-40 rounded-sm bg-brand-navy px-4 text-base text-white hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
          >
            {busy ? "Menyimpan…" : "Buat lowongan"}
          </button>
          <Link
            href="/vacancies"
            className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-base text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Batal
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
