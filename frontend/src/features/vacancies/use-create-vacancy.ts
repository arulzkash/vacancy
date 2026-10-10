"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVacancy } from "./create-api";

export function useCreateVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVacancy,
    retry: false,
    onSuccess: async (vacancy) => {
      queryClient.setQueryData(["vacancies", "detail", vacancy.id], vacancy);
      await queryClient.invalidateQueries({ queryKey: ["vacancies", "list"] });
    },
  });
}
