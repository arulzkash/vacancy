"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const isCreatePage = usePathname() === "/vacancies/create";
  return (
    <footer
      className={
        isCreatePage
          ? "w-full border-t border-line"
          : "mx-auto w-full max-w-[1160px] px-5"
      }
    >
      <div
        className={
          isCreatePage
            ? "mx-auto max-w-[1150px] px-5 py-12 sm:pb-24 sm:pt-16"
            : "border-t border-line py-12 sm:pb-24 sm:pt-16"
        }
      >
        <Image
          src="/images/dicoding.svg"
          alt="Dicoding"
          width={138}
          height={34}
        />

        <address className="mt-6 max-w-sm text-base leading-7 text-muted not-italic">
          Dicoding Space
          <br />
          Jl. Batik Kumeli No.50, Sukaluyu,
          <br />
          Kec. Cibeunying Kaler, Kota Bandung Jawa
          <br />
          Barat 40123
        </address>
      </div>
    </footer>
  );
}
