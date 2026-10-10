import Image from "next/image";
import type { ReactNode } from "react";
import {
  CompanyIcon,
  ExperienceIcon,
  LocationIcon,
} from "@/components/icons/metadata-icons";
import { formatClosingDate, formatPublishedDate } from "@/lib/dates";
import { employmentTypeLabels, experienceLevelLabels } from "../labels";
import type { Vacancy } from "../types";

type JobCardProps = {
  vacancy: Vacancy;
};

type MetadataItemProps = {
  icon: ReactNode;
  children: ReactNode;
};

function MetadataItem({ icon, children }: MetadataItemProps) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}

export function JobCard({ vacancy }: JobCardProps) {
  const titleId = `vacancy-title-${vacancy.id}`;
  const locationLabel = vacancy.is_remote
    ? `${vacancy.location} (Remote)`
    : vacancy.location;

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-sm border border-line bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <Image
          src="/images/dicoding-company.png"
          alt=""
          width={96}
          height={96}
          className="size-20 shrink-0 rounded-sm sm:size-24"
        />

        <div className="min-w-0 py-0.5">
          <h3
            id={titleId}
            className="break-words text-base font-semibold leading-6"
          >
            {vacancy.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs leading-5 text-muted">
            <MetadataItem icon={<CompanyIcon />}>
              {vacancy.company.name}
            </MetadataItem>
            <span>{employmentTypeLabels[vacancy.employment_type]}</span>
          </div>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-2 text-xs leading-5 text-muted">
            <MetadataItem icon={<LocationIcon />}>
              {locationLabel}
            </MetadataItem>
            <MetadataItem icon={<ExperienceIcon />}>
              {experienceLevelLabels[vacancy.experience_level]}
            </MetadataItem>
          </div>
        </div>
      </div>

      <dl className="flex shrink-0 flex-col gap-2 border-t border-line pt-3 text-xs leading-5 text-muted sm:border-0 sm:pt-0 sm:text-right">
        <div className="flex flex-wrap gap-x-1 sm:justify-end">
          <dt>Dibuat pada</dt>
          <dd>
            <time dateTime={vacancy.created_at}>
              {formatPublishedDate(vacancy.created_at)}
            </time>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-1 sm:justify-end">
          <dt>Lamar sebelum</dt>
          <dd>
            <time dateTime={vacancy.closing_date}>
              {formatClosingDate(vacancy.closing_date)}
            </time>
          </dd>
        </div>
      </dl>
    </article>
  );
}
