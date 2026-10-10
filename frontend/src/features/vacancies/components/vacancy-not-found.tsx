import { VacancyBackLink } from "./vacancy-back-link";

type VacancyNotFoundProps = {
  backHref: string;
};

export function VacancyNotFound({ backHref }: VacancyNotFoundProps) {
  return (
    <section className="mx-auto w-full max-w-[770px] px-5 py-16">
      <h1 className="text-2xl font-semibold leading-8">
        Lowongan tidak ditemukan
      </h1>
      <p className="mb-4 mt-3 text-base leading-[22px] text-muted">
        Lowongan yang kamu cari tidak tersedia.
      </p>
      <VacancyBackLink href={backHref} />
    </section>
  );
}
