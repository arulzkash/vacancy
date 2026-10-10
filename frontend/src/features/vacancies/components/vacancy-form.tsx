"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { VacancyValidationError } from "../create-api";
import {
  apiFieldNames,
  vacancyFormDefaults,
  vacancyPayload,
  type VacancyFormValues,
} from "../create-form";
import { createExperienceLevelLabels } from "../labels";
import { VacancyDescriptionField } from "./form/vacancy-description-field";
import { RadioField } from "./form/radio-field";
import { VacancyInformationFields } from "./form/vacancy-information-fields";
import { VacancySalaryFields } from "./form/vacancy-salary-fields";

type VacancyFormProps = {
  initialValues?: VacancyFormValues;
  descriptionHint?: string;
  requireMinimumSalary?: boolean;
  submitLabel: string;
  successHref: string;
  onSave: (payload: ReturnType<typeof vacancyPayload>) => Promise<unknown>;
};

export function VacancyForm({
  initialValues = vacancyFormDefaults,
  descriptionHint,
  requireMinimumSalary = true,
  submitLabel,
  successHref,
  onSave,
}: VacancyFormProps) {
  const form = useForm<VacancyFormValues>({
    defaultValues: initialValues,
    shouldFocusError: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    clearErrors();

    try {
      await onSave(vacancyPayload(values));
      setSaved(true);
      router.replace(successHref);
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
      setSaving(false);
    }
  }

  const disabled = saving || saved;
  const busy = isSubmitting || disabled;

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(save, focusInvalidField)(event)}
        aria-label={submitLabel}
        className="mx-auto max-w-[640px] px-5 pb-16 pt-10"
      >
        <fieldset disabled={disabled} className="min-w-0 space-y-8">
          <VacancyInformationFields />
          <VacancyDescriptionField disabled={disabled} hint={descriptionHint} />
          <VacancySalaryFields requireMinimum={requireMinimumSalary} />
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
            className="h-10 min-w-40 whitespace-nowrap rounded-sm bg-brand-navy px-4 text-base text-white hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
          >
            {busy ? "Menyimpan…" : submitLabel}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-base text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Batal
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
