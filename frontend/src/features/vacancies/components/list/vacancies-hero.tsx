import Image from "next/image";

export function VacanciesHero() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto min-h-[262px] max-w-[1150px] px-5 py-12">
        <p className="text-lg font-medium text-accent">Dicoding Jobs</p>

        <h1 className="mt-4 text-3xl font-semibold leading-[1.5] tracking-tight sm:text-[40px] sm:leading-[64px]">
          <span className="block">Temukan lowongan yang</span>
          <span className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span>cocok untuk kamu</span>
            <Image
              src="/images/vacancies-hero.png"
              alt=""
              width={203}
              height={61}
              loading="eager"
              className="h-auto w-[203px] rounded-full"
            />
          </span>
        </h1>
      </div>
    </section>
  );
}
