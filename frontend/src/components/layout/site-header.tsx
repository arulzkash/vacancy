import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex min-h-[70px] max-w-[1440px] items-center gap-8 px-5 sm:gap-10 sm:px-10 lg:px-[60px]"
      >
        <Link
          href="/vacancies"
          aria-label="Dicoding Jobs — halaman lowongan"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/images/dicoding-jobs.svg"
            alt="Dicoding Jobs"
            width={81}
            height={32}
          />
        </Link>

        <Link
          href="/vacancies"
          aria-current="page"
          className="flex min-h-[70px] items-center border-b-2 border-ink text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Lowongan Kerja
        </Link>
      </nav>
    </header>
  );
}
