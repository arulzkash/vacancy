import Image from "next/image";
import Link from "next/link";
import { DashboardIcon } from "./dashboard-icons";

export function DashboardSidebar() {
  return (
    <aside
      aria-label="Menu dashboard"
      className="border-b border-line md:border-b-0 md:border-r"
    >
      <Image
        src="/images/dashboard-jobs.png"
        alt="Jobs"
        width={252}
        height={92}
        className="h-auto w-[252px] max-w-full"
      />
      <Link
        href="/dashboard"
        aria-current="page"
        className="flex min-h-14 items-center gap-2 bg-zinc-100 px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <DashboardIcon name="jobs" />
        Lowongan Saya
      </Link>
    </aside>
  );
}
