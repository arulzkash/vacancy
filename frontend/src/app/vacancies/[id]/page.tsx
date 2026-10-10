import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VacancyDetail } from "@/features/vacancies/components/vacancy-detail";
import { vacancyListHref } from "@/features/vacancies/links";

export const metadata: Metadata = {
  title: "Detail Lowongan | Dicoding Jobs",
};

type VacancyDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string | string[] }>;
};

export default async function VacancyDetailPage({
  params,
  searchParams,
}: VacancyDetailPageProps) {
  const [route, query] = await Promise.all([params, searchParams]);
  const id = Number(route.id);

  if (!/^\d+$/.test(route.id) || !Number.isSafeInteger(id) || id < 1) {
    notFound();
  }

  const search = Array.isArray(query.search)
    ? query.search[0] ?? ""
    : query.search ?? "";

  return (
    <main id="main-content" tabIndex={-1}>
      <VacancyDetail id={id} backHref={vacancyListHref(search)} />
    </main>
  );
}
