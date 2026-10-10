export function vacancyListHref(search: string): string {
  const keyword = search.trim();

  if (keyword === "") {
    return "/vacancies";
  }

  return `/vacancies?${new URLSearchParams({ search: keyword })}`;
}

export function vacancyDetailHref(id: number, search: string): string {
  const keyword = search.trim();
  const path = `/vacancies/${id}`;

  if (keyword === "") {
    return path;
  }

  return `${path}?${new URLSearchParams({ search: keyword })}`;
}
