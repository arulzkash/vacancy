type VacancyListEmptyProps = {
  search: string;
};

export function VacancyListEmpty({ search }: VacancyListEmptyProps) {
  return (
    <p
      role="status"
      className="rounded-sm border border-line bg-surface px-6 py-12 text-center text-sm leading-6 text-muted"
    >
      {search === ""
        ? "Belum ada lowongan tersedia."
        : `Tidak ada lowongan yang cocok dengan “${search}”.`}
    </p>
  );
}
