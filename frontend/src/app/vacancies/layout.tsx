import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type VacanciesLayoutProps = {
  children: ReactNode;
};

export default function VacanciesLayout({
  children,
}: VacanciesLayoutProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-10 rounded-sm bg-white p-3 text-sm font-medium focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
