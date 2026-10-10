import { useFormContext, useWatch } from "react-hook-form";
import type { VacancyFormValues } from "../../form-values";
import { formControlClass } from "./form-field";

export function VacancySalaryFields({
  requireMinimum = true,
}: {
  requireMinimum?: boolean;
}) {
  const {
    register,
    control,
    getValues,
    formState: { errors },
  } = useFormContext<VacancyFormValues>();

  const [showSalary, salaryMax] = useWatch({
    control,
    name: ["show_salary", "salary_max"],
  });
  const minimumRequired = requireMinimum || showSalary || salaryMax !== "";

  function validateSalary(name: "salary_min" | "salary_max", value: string) {
    if (value === "")
      return (
        name === "salary_max" || !minimumRequired || "Gaji minimum wajib diisi."
      );
    if (!Number.isSafeInteger(Number(value)) || Number(value) < 0)
      return "Gaji harus bilangan bulat nonnegatif.";
    if (
      name === "salary_max" &&
      Number(value) < Number(getValues("salary_min"))
    )
      return "Gaji maksimum tidak boleh di bawah minimum.";
    return true;
  }

  return (
    <div>
      <fieldset aria-describedby="salary-hint">
        <legend className="mb-2 text-base leading-[22px]">
          Rentang gaji per bulan{" "}
          {minimumRequired && (
            <span aria-hidden="true" className="text-red-600">
              *
            </span>
          )}
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_32px_1fr] sm:items-start">
          {(["salary_min", "salary_max"] as const).map((name, index) => (
            <div
              key={name}
              className={
                index === 0
                  ? "sm:col-start-1 sm:row-start-1"
                  : "sm:col-start-3 sm:row-start-1"
              }
            >
              <div className="flex">
                <span
                  aria-hidden="true"
                  className="flex min-h-12 w-[72px] shrink-0 items-center justify-center bg-zinc-100 text-base"
                >
                  Rp
                </span>
                <input
                  {...register(name, {
                    validate: (value) => validateSalary(name, value),
                  })}
                  id={name}
                  aria-label={
                    name === "salary_min" ? "Gaji minimum" : "Gaji maksimum"
                  }
                  aria-required={name === "salary_min" && minimumRequired}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={`salary-hint${errors[name] ? ` ${name}-error` : ""}`}
                  type="number"
                  min="0"
                  step="1"
                  placeholder={
                    name === "salary_min" ? "Minimum" : "Maksimum (opsional)"
                  }
                  className={`${formControlClass} min-w-0 rounded-l-none`}
                />
              </div>
              {errors[name] && (
                <p
                  id={`${name}-error`}
                  role="alert"
                  className="mt-2 text-sm text-red-700"
                >
                  {errors[name]?.message}
                </p>
              )}
            </div>
          ))}
          <span
            aria-hidden="true"
            className="hidden h-12 items-center justify-center sm:col-start-2 sm:row-start-1 sm:flex"
          >
            -
          </span>
        </div>
        <p id="salary-hint" className="mt-2 text-sm leading-5 text-muted">
          Anda tidak perlu mengisi kolom &quot;Maksimum&quot; jika yang
          dimasukkan adalah gaji pokok.
        </p>
      </fieldset>
      <label className="relative mt-3 flex min-h-6 items-center gap-2 text-base">
        <input
          {...register("show_salary")}
          type="checkbox"
          role="switch"
          className="peer absolute left-0 top-0.5 z-10 h-5 w-10 cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className="relative h-5 w-10 rounded-full bg-zinc-300 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-brand-navy peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:opacity-60"
        />
        Tampilkan gaji
      </label>
      {errors.show_salary && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {errors.show_salary.message}
        </p>
      )}
      <p className="mt-2 text-sm leading-5 text-muted">
        Gaji akan ditampilkan di lowongan pekerjaan dan dapat dilihat oleh
        kandidat.
      </p>
    </div>
  );
}
