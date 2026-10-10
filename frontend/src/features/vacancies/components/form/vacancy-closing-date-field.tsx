import { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  dateInputToIso,
  isoToDateInput,
  todayInJakarta,
  type VacancyFormValues,
} from "../../create-form";
import { FormField, formControlClass } from "./form-field";

export function VacancyClosingDateField() {
  const picker = useRef<HTMLInputElement>(null);
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<VacancyFormValues>();
  const value = useWatch({ control, name: "closing_date" });
  return (
    <FormField
      id="closing_date"
      label="Aktif hingga"
      required
      error={errors.closing_date?.message}
    >
      <div className="relative">
        <input
          {...register("closing_date", {
            required: "Tanggal aktif wajib diisi.",
            validate: (text) => {
              const date = dateInputToIso(text);
              if (!date)
                return "Gunakan tanggal yang valid dengan format dd/mm/yyyy.";
              return (
                date >= todayInJakarta() ||
                "Tanggal tidak boleh sebelum hari ini (WIB)."
              );
            },
          })}
          id="closing_date"
          placeholder="dd/mm/yyyy"
          aria-required="true"
          aria-invalid={Boolean(errors.closing_date)}
          aria-describedby={
            errors.closing_date ? "closing_date-error" : undefined
          }
          className={`${formControlClass} pr-12`}
        />
        <input
          ref={picker}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          min={todayInJakarta()}
          value={dateInputToIso(value) ?? ""}
          onChange={(event) =>
            setValue("closing_date", isoToDateInput(event.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          className="pointer-events-none absolute right-3 top-3 size-px opacity-0"
        />
        <button
          type="button"
          aria-label="Pilih tanggal aktif"
          onClick={() => picker.current?.showPicker()}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="5" width="18" height="16" rx="1" />
            <path d="M7 3v4M17 3v4M3 11h18" />
          </svg>
        </button>
      </div>
    </FormField>
  );
}
