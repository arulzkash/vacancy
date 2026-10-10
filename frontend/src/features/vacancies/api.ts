import { API_BASE_URL } from "@/lib/api";
import type { Vacancy, VacancyListResponse } from "./types";

export async function getVacancies(
  search: string,
  signal?: AbortSignal,
): Promise<Vacancy[]> {
  const url = new URL("/api/vacancies", API_BASE_URL);

  if (search !== "") {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url, {
    signal,
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Daftar lowongan belum dapat dimuat.");
  }

  const payload: VacancyListResponse = await response.json();

  if (!Array.isArray(payload.data)) {
    throw new Error("Respons daftar lowongan tidak sesuai format.");
  }

  return payload.data;
}
