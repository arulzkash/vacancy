import { API_BASE_URL } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import type {
  Vacancy,
  VacancyDetail,
  VacancyDetailResponse,
  VacancyListResponse,
} from "./types";

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

export async function getVacancy(
  id: number,
  signal?: AbortSignal,
): Promise<VacancyDetail> {
  const response = await fetch(new URL(`/api/vacancies/${id}`, API_BASE_URL), {
    signal,
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError("Detail lowongan belum dapat dimuat.", response.status);
  }

  const payload: VacancyDetailResponse = await response.json();

  if (
    payload.data?.id !== id ||
    typeof payload.data.description_html !== "string"
  ) {
    throw new Error("Respons detail lowongan tidak sesuai format.");
  }

  return payload.data;
}
