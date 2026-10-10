"use client";

import { useQuery } from "@tanstack/react-query";
import { getVacancies } from "./api";

export function useVacancies() {
  return useQuery({
    queryKey: ["vacancies", "list"],
    queryFn: ({ signal }) => getVacancies(signal),
  });
}
