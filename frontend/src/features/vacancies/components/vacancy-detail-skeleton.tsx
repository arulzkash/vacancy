export function VacancyDetailSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Memuat detail lowongan…
      </p>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="border-b border-line">
          <div className="mx-auto flex max-w-[1150px] gap-4 px-5 py-8">
            <div className="size-24 shrink-0 rounded-sm bg-line" />
            <div className="flex min-w-0 flex-1 flex-col gap-4 py-1">
              <div className="h-7 w-2/3 rounded-sm bg-line" />
              <div className="h-4 w-1/3 rounded-sm bg-line" />
              <div className="h-4 w-1/2 rounded-sm bg-line" />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[770px] space-y-8 px-5 py-11">
          <div className="h-[30px] w-24 rounded-full bg-line" />
          <div className="h-7 w-44 rounded-sm bg-line" />
          <div className="space-y-3">
            <div className="h-4 rounded-sm bg-line" />
            <div className="h-4 rounded-sm bg-line" />
            <div className="h-4 w-3/4 rounded-sm bg-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
