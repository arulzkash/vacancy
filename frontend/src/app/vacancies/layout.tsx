import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";

export default function VacanciesLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
