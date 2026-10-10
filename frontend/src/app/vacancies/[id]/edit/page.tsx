import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VacancyCreateHero } from "@/features/vacancies/components/vacancy-create-hero";
import { VacancyEditForm } from "@/features/vacancies/components/vacancy-edit-form";

export const metadata: Metadata = { title: "Edit Lowongan | Dicoding Jobs" };

export default async function VacancyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: routeId } = await params;
  const id = Number(routeId);
  if (!/^\d+$/.test(routeId) || !Number.isSafeInteger(id) || id < 1) {
    notFound();
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <VacancyCreateHero editing />
      <VacancyEditForm id={id} />
    </main>
  );
}
