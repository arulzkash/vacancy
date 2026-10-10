"use client";

import { useSearchParams } from "next/navigation";

import Link from "next/link";
import { useVacancies } from "../../use-vacancies";
import { VacancyListError } from "../vacancy-list-error";
import { DashboardIcon } from "./dashboard-icons";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardVacancyCard } from "./dashboard-vacancy-card";

export function DashboardVacancies() {
  const updated = useSearchParams().get("updated") === "1";
  const query = useVacancies("");
  return (
    <>
      {updated && (
        <p
          role="status"
          className="mb-6 rounded-sm bg-green-50 p-4 text-sm text-green-800"
        >
          Lowongan berhasil diperbarui.
        </p>
      )}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 id="dashboard-heading" className="text-2xl font-semibold leading-8">
          Lowongan Saya
        </h1>
        <Link
          href="/vacancies/create"
          className="inline-flex min-h-9 items-center gap-2 rounded-sm bg-brand-navy px-3 text-sm text-white hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <DashboardIcon name="plus" className="size-4" />
          Buat lowongan
        </Link>
      </div>
      {query.isPending ? (
        <DashboardSkeleton />
      ) : query.isError ? (
        <VacancyListError
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : query.data.length === 0 ? (
        <div
          role="status"
          className="rounded-sm border border-line bg-surface p-6"
        >
          <p className="font-medium">Belum ada lowongan.</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Buat lowongan pertama Anda melalui tombol di atas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {query.data.map((vacancy) => (
            <DashboardVacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      )}
    </>
  );
}
