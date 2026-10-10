type VacancyDetailErrorProps = {
  hasPreviousData?: boolean;
  isRetrying: boolean;
  onRetry: () => void;
};

export function VacancyDetailError({
  hasPreviousData = false,
  isRetrying,
  onRetry,
}: VacancyDetailErrorProps) {
  return (
    <div>
      <p role="alert" className="text-base leading-[22px] text-muted">
        {hasPreviousData
          ? "Detail terbaru belum dapat dimuat. Informasi sebelumnya masih ditampilkan."
          : "Detail lowongan belum dapat dimuat."}
      </p>
      <button
        type="button"
        disabled={isRetrying}
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-sm bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-brand-navy focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
      >
        {isRetrying ? "Memuat ulang…" : "Coba lagi"}
      </button>
    </div>
  );
}
