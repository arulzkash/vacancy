export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Memuat lowongan saya">
      <span className="sr-only">Memuat lowongan saya...</span>
      <div aria-hidden="true" className="space-y-6">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex min-h-36 animate-pulse gap-4 rounded-sm border border-line p-4"
          >
            <div className="size-16 shrink-0 rounded-sm bg-zinc-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 bg-zinc-200" />
              <div className="h-4 w-full bg-zinc-100" />
              <div className="h-8 w-32 bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
