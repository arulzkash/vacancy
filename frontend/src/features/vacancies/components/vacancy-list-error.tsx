type VacancyListErrorProps = {
  onRetry: () => void;
  isRetrying: boolean;
};

export function VacancyListError({
  onRetry,
  isRetrying,
}: VacancyListErrorProps) {
  return (
    <div className="rounded-sm border border-line bg-surface p-6">
      <p role="alert" className="text-sm leading-6 text-muted">
        Daftar lowongan belum dapat dimuat.
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-4 min-h-11 rounded-sm bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-brand-navy focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
      >
        {isRetrying ? "Mencoba lagi…" : "Coba lagi"}
      </button>
    </div>
  );
}
