import { experienceLevelLabels } from "../labels";
import type { ExperienceLevel } from "../types";

type VacancyAdditionalInfoProps = {
  experience: ExperienceLevel;
  candidateCount: number;
};

export function VacancyAdditionalInfo({
  experience,
  candidateCount,
}: VacancyAdditionalInfoProps) {
  return (
    <section aria-labelledby="additional-info-heading">
      <h2
        id="additional-info-heading"
        className="text-xl font-semibold leading-7 text-ink"
      >
        Informasi Tambahan
      </h2>

      <dl className="mt-2 grid grid-cols-1 gap-6 text-base leading-[22px] sm:grid-cols-2 sm:gap-8">
        <div>
          <dt className="font-semibold">Pengalaman bekerja</dt>
          <dd className="mt-2">{experienceLevelLabels[experience]}</dd>
        </div>
        <div>
          <dt className="font-semibold">Kandidat yang dibutuhkan</dt>
          <dd className="mt-2">{candidateCount} kandidat</dd>
        </div>
      </dl>
    </section>
  );
}
