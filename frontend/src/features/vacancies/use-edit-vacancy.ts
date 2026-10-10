"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { getVacancyForEdit } from "./api";
import { updateVacancy } from "./create-api";
import type { vacancyPayload } from "./create-form";

export function useVacancyForEdit(id: number) {
  return useQuery({
    queryKey: ["vacancies", "edit", id],
    queryFn: ({ signal }) => getVacancyForEdit(id, signal),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 1,
  });
}

export function useUpdateVacancy(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReturnType<typeof vacancyPayload>) =>
      updateVacancy(id, payload),
    retry: false,
    onSuccess: async (vacancy) => {
      queryClient.setQueryData(["vacancies", "detail", id], vacancy);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vacancies", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["vacancies", "edit", id] }),
      ]);
    },
  });
}
