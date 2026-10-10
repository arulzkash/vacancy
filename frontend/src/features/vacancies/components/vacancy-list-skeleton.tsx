function JobCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[130px] gap-4 rounded-sm border border-line p-4"
    >
      <div className="size-20 shrink-0 rounded-sm bg-line sm:size-24" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 py-1">
        <div className="h-5 w-2/3 rounded-sm bg-line" />
        <div className="h-3 w-3/4 rounded-sm bg-line" />
        <div className="h-3 w-1/2 rounded-sm bg-line" />
      </div>
    </div>
  );
}

export function VacancyListSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Memuat daftar lowongan…
      </p>
      <div className="space-y-6 motion-safe:animate-pulse">
        {Array.from({ length: 4 }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
