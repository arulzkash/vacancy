"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const searchDelay = 300;

export function useVacancySearch() {
  const searchParams = useSearchParams();
  const keyword = (searchParams.get("search") ?? "").trim();
  const pendingSearch = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel pending typing when the URL changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (pendingSearch.current !== null) {
        clearTimeout(pendingSearch.current);
      }
    };
  }, [keyword]);

  function applySearch(value: string) {
    if (pendingSearch.current !== null) {
      clearTimeout(pendingSearch.current);
      pendingSearch.current = null;
    }

    const search = value.trim();
    const url = new URL(window.location.href);

    if (search === "") {
      url.searchParams.delete("search");
    } else {
      url.searchParams.set("search", search);
    }

    // Next.js synchronizes native history updates with useSearchParams.
    // Replace avoids adding a history entry after every typing pause.
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function scheduleSearch(value: string) {
    if (pendingSearch.current !== null) {
      clearTimeout(pendingSearch.current);
    }

    pendingSearch.current = setTimeout(() => applySearch(value), searchDelay);
  }

  return { keyword, applySearch, scheduleSearch };
}
