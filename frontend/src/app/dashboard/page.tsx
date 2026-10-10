import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { DashboardSidebar } from "@/features/vacancies/components/dashboard/dashboard-sidebar";
import { DashboardVacancies } from "@/features/vacancies/components/dashboard/dashboard-vacancies";
import { DashboardSkeleton } from "@/features/vacancies/components/dashboard/dashboard-skeleton";

export const metadata: Metadata = { title: "Dashboard | Dicoding Jobs" };

export default function DashboardPage() {
  return (
    <SiteShell showFooter={false}>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto grid min-h-[calc(100svh-70px)] max-w-[1106px] grid-cols-1 px-5 md:grid-cols-[252px_minmax(0,1fr)] md:px-0"
      >
        <DashboardSidebar />
        <section
          aria-labelledby="dashboard-heading"
          className="min-w-0 py-8 md:pl-6 md:pt-8 md:pb-24"
        >
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardVacancies />
          </Suspense>
        </section>
      </main>
    </SiteShell>
  );
}
