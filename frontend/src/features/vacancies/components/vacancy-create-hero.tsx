import Image from "next/image";

export function VacancyCreateHero() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex min-h-[262px] max-w-[1150px] flex-col justify-center px-5 py-12">
        <h1 className="flex flex-wrap items-center gap-x-4 gap-y-4 text-3xl font-semibold leading-[48px] sm:text-[40px] sm:leading-[56px]">
          Buat lowongan pekerjaan
          <Image
            src="/images/vacancies-hero.png"
            alt=""
            width={203}
            height={61}
            className="h-[61px] w-[203px] rounded-full"
          />
        </h1>
        <p className="mt-4 text-base leading-[22px] text-white">
          Dicoding Jobs menghubungkan industri dengan talenta yang tepat.
          <br />
          Mencari tim baru tidak harus melelahkan dan boros biaya.
        </p>
      </div>
    </section>
  );
}
