import Image from "next/image";
import Link from "next/link";
import { formatClosingDate, formatPublishedDate } from "@/lib/dates";
import type { Vacancy } from "../../types";
import { DashboardIcon } from "./dashboard-icons";

export function DashboardVacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const titleId = `dashboard-vacancy-${vacancy.id}`;
  return (
    <article
      aria-labelledby={titleId}
      className="flex gap-4 rounded-sm border border-line bg-white p-4"
    >
      <Image
        src="/images/jobs-company.svg"
        alt=""
        width={64}
        height={64}
        className="size-16 shrink-0 rounded-sm"
      />
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="break-words text-base font-medium leading-6"
        >
          <Link
            href={`/vacancies/${vacancy.id}`}
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {vacancy.title}
          </Link>
        </h2>
        <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-5 text-muted">
          <div className="flex flex-wrap items-center gap-1">
            <DashboardIcon name="created" className="size-4" />
            <dt>Dibuat:</dt>
            <dd>
              <time dateTime={vacancy.created_at}>
                {formatPublishedDate(vacancy.created_at)}
              </time>
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <DashboardIcon name="active" className="size-4" />
            <dt>Aktif hingga:</dt>
            <dd>
              <time dateTime={vacancy.closing_date}>
                {formatClosingDate(vacancy.closing_date)}
              </time>
            </dd>
          </div>
        </dl>
        <div
          className="mt-6 flex gap-3"
          aria-label={`Aksi untuk ${vacancy.title}`}
        >
          <button
            type="button"
            disabled
            title="Fitur edit belum tersedia"
            className="inline-flex min-h-9 items-center gap-2 rounded-sm bg-zinc-100 px-3 text-sm text-zinc-600 disabled:cursor-not-allowed"
          >
            <DashboardIcon name="edit" className="size-4 text-zinc-700" />
            Edit
          </button>
          <button
            type="button"
            disabled
            title="Fitur hapus belum tersedia"
            className="inline-flex min-h-9 items-center gap-2 rounded-sm bg-rose-100 px-3 text-sm text-rose-700 disabled:cursor-not-allowed"
          >
            <DashboardIcon name="delete" className="size-4" />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}
