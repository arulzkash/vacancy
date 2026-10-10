import type { ReactNode } from "react";

export const formControlClass =
  "min-h-12 w-full rounded-sm border border-line bg-white px-4 py-3 text-base leading-[22px] text-ink placeholder:text-muted focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink aria-invalid:border-red-600 disabled:bg-surface";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base leading-[22px]">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-sm leading-5 text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
