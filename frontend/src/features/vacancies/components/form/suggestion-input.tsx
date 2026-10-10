import type { InputHTMLAttributes, Ref } from "react";
import { formControlClass } from "./form-field";

type SuggestionInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  suggestions: string[];
  ref?: Ref<HTMLInputElement>;
};

export function SuggestionInput({
  id,
  suggestions,
  ref,
  ...props
}: SuggestionInputProps) {
  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        id={id}
        list={`${id}-options`}
        autoComplete="off"
        className={`${formControlClass} pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0`}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-4 size-4 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
      <datalist id={`${id}-options`}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
}
