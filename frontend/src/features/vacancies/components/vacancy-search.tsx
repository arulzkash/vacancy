"use client";

import { useEffect, useRef } from "react";
import type { FormEvent } from "react";

type VacancySearchProps = {
  keyword: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
};

export function VacancySearch({
  keyword,
  onChange,
  onSubmit,
}: VacancySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync with direct URL changes and browser navigation.
  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.value = keyword;
    }
  }, [keyword]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(inputRef.current?.value ?? "");
  }

  return (
    <form
      role="search"
      aria-label="Pencarian lowongan"
      onSubmit={handleSubmit}
      className="relative w-full sm:max-w-[350px]"
    >
      <label htmlFor="vacancy-search" className="sr-only">
        Cari judul lowongan
      </label>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>

      <input
        ref={inputRef}
        id="vacancy-search"
        name="search"
        type="search"
        defaultValue={keyword}
        maxLength={255}
        placeholder="Pekerjaan apa yang sedang kamu cari?"
        autoComplete="off"
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-11 w-full rounded-sm border border-line bg-white py-2 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </form>
  );
}
