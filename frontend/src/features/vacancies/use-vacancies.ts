"use client";

import { useQuery } from "@tanstack/react-query";
import { getVacancies } from "./api";

export function useVacancies(search: string) {
  return useQuery({
    queryKey: ["vacancies", "list", search],
    queryFn: ({ signal }) => getVacancies(search, signal),
  });
}
