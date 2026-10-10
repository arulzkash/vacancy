"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { getVacancy } from "./api";

export function useVacancy(id: number) {
  return useQuery({
    queryKey: ["vacancies", "detail", id],
    queryFn: ({ signal }) => getVacancy(id, signal),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
