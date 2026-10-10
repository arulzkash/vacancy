import { useFormContext } from "react-hook-form";
import type { VacancyFormValues } from "../../create-form";

type RadioFieldProps = {
  name: "employment_type" | "experience_level";
  label: string;
  options: Record<string, string>;
};

export function RadioField({ name, label, options }: RadioFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<VacancyFormValues>();
  const error = errors[name]?.message;

  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 text-base leading-[22px]">
        {label}
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      </legend>
      <div className="space-y-3">
        {Object.entries(options).map(([value, text]) => (
          <label
            key={value}
            className="flex min-h-6 items-center gap-2 text-base leading-[22px]"
          >
            <input
              type="radio"
              value={value}
              className="size-5 appearance-none rounded-full border-2 border-zinc-300 bg-white checked:border-[6px] checked:border-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              {...register(name, { required: `${label} wajib dipilih.` })}
            />
            {text}
          </label>
        ))}
      </div>
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}
