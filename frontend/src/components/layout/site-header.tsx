"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isRecruiterPage =
    pathname === "/dashboard" ||
    pathname === "/vacancies/create" ||
    /^\/vacancies\/\d+\/edit$/.test(pathname);
  return (
    <header className="border-b border-line bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex min-h-[70px] max-w-[1440px] items-center gap-4 px-5 sm:gap-10 sm:px-10 lg:px-[60px]"
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
          aria-current={isRecruiterPage ? undefined : "page"}
          className={`flex min-h-[70px] items-center border-b-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 ${isRecruiterPage ? "border-transparent" : "border-ink"}`}
        >
          Lowongan Kerja
        </Link>
        <Link
          href="/dashboard"
          aria-current={isRecruiterPage ? "page" : undefined}
          className={`flex min-h-[70px] items-center border-b-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 ${isRecruiterPage ? "border-ink" : "border-transparent"}`}
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
