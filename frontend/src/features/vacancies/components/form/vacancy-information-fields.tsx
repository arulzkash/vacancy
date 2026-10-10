import { useFormContext } from "react-hook-form";
import { type VacancyFormValues } from "../../create-form";
import { createEmploymentTypeLabels } from "../../labels";
import { FormField, formControlClass } from "./form-field";
import { RadioField } from "./radio-field";
import { SuggestionInput } from "./suggestion-input";
import { VacancyClosingDateField } from "./vacancy-closing-date-field";

export function VacancyInformationFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<VacancyFormValues>();

  function fieldAccessibility(name: keyof VacancyFormValues, hasHint = false) {
    const descriptions = [
      hasHint ? `${name}-hint` : "",
      errors[name] ? `${name}-error` : "",
    ];
    return {
      id: name,
      "aria-required": true,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": descriptions.filter(Boolean).join(" ") || undefined,
    };
  }

  const textRules = {
    required: "Field ini wajib diisi.",
    maxLength: { value: 255, message: "Maksimal 255 karakter." },
    validate: (value: string) =>
      value.trim() !== "" || "Field ini wajib diisi.",
  };

  return (
    <>
      <FormField
        id="title"
        label="Judul lowongan"
        required
        hint="Contoh: Android Native Developer"
        error={errors.title?.message}
      >
        <input
          {...register("title", textRules)}
          {...fieldAccessibility("title", true)}
          className={formControlClass}
          placeholder="Masukkan judul lowongan"
        />
      </FormField>
      <FormField
        id="position"
        label="Posisi"
        required
        error={errors.position?.message}
      >
        <SuggestionInput
          {...register("position", textRules)}
          {...fieldAccessibility("position")}
          placeholder="Pilih posisi yang dicari"
          suggestions={[
            "Product Engineer",
            "Android Developer",
            "iOS Developer",
            "Frontend Engineer",
            "Backend Engineer",
            "Code Reviewer",
          ]}
        />
      </FormField>
      <RadioField
        name="employment_type"
        label="Tipe pekerjaan"
        options={createEmploymentTypeLabels}
      />
      <FormField
        id="candidate_count"
        label="Kandidat yang dibutuhkan"
        required
        error={errors.candidate_count?.message}
      >
        <input
          {...register("candidate_count", {
            required: "Jumlah kandidat wajib diisi.",
            validate: (value) =>
              (Number.isInteger(Number(value)) &&
                Number(value) >= 1 &&
                Number(value) <= 4294967295) ||
              "Jumlah kandidat harus bilangan bulat minimal 1.",
          })}
          {...fieldAccessibility("candidate_count")}
          type="number"
          min="1"
          step="1"
          className={formControlClass}
          placeholder="Masukkan jumlah kandidat yang dibutuhkan"
        />
      </FormField>
      <VacancyClosingDateField />
      <div>
        <FormField
          id="location"
          label="Lokasi"
          required
          error={errors.location?.message}
        >
          <SuggestionInput
            {...register("location", textRules)}
            {...fieldAccessibility("location")}
            placeholder="Pilih lokasi"
            suggestions={[
              "Bandung",
              "Jakarta",
              "Yogyakarta",
              "Surabaya",
              "Semarang",
              "Denpasar",
            ]}
          />
        </FormField>
        <label className="mt-3 flex min-h-6 items-center gap-2 text-base">
          <input
            type="checkbox"
            {...register("is_remote")}
            className="size-5 accent-brand-navy"
          />
          Bisa remote
        </label>
        {errors.is_remote && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {errors.is_remote.message}
          </p>
        )}
      </div>
    </>
  );
}
