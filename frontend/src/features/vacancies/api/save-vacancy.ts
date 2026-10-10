import { API_BASE_URL } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import type { vacancyPayload } from "../form-values";
import type { VacancyDetail, VacancyDetailResponse } from "../types";

export class VacancyValidationError extends ApiError {
  constructor(public readonly fields: Record<string, string[]>) {
    super("Periksa kembali isian yang ditandai.", 422);
  }
}

export async function saveVacancy(
  path: string,
  method: "POST" | "PUT",
  payload: ReturnType<typeof vacancyPayload>,
): Promise<VacancyDetail> {
  const response = await fetch(new URL(path, API_BASE_URL), {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 422) {
    const validation = await response.json();
    throw new VacancyValidationError(validation.errors ?? {});
  }

  if (!response.ok) {
    throw new ApiError(
      "Lowongan belum dapat disimpan. Silakan coba lagi.",
      response.status,
    );
  }

  const result: VacancyDetailResponse = await response.json();
  if (typeof result.data?.id !== "number") {
    throw new Error("Respons penyimpanan lowongan tidak sesuai format.");
  }
  return result.data;
}
