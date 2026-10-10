import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteShell({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
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
      {showFooter && <SiteFooter />}
    </>
  );
}
