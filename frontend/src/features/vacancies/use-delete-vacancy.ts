"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVacancy } from "./delete-api";

export function useDeleteVacancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVacancy,
    retry: false,
    onSuccess: async (_, id) => {
      const detailKey = ["vacancies", "detail", id];
      const editKey = ["vacancies", "edit", id];

      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: editKey }),
      ]);
      queryClient.removeQueries({ queryKey: detailKey });
      queryClient.removeQueries({ queryKey: editKey });
      await queryClient.invalidateQueries({ queryKey: ["vacancies", "list"] });
    },
  });
}
