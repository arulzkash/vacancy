import type { vacancyPayload } from "../form-values";
import type { VacancyDetail } from "../types";
import { saveVacancy } from "./save-vacancy";

export async function updateVacancy(
  id: number,
  payload: ReturnType<typeof vacancyPayload>,
): Promise<VacancyDetail> {
  return saveVacancy(`/api/vacancies/${id}`, "PUT", payload);
}

