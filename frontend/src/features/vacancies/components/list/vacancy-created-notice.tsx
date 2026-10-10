"use client";

import { useSearchParams } from "next/navigation";

export function VacancyCreatedNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("created") !== "1") return null;

  return (
    <p
      role="status"
      className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      Lowongan berhasil dibuat.
    </p>
  );
}
