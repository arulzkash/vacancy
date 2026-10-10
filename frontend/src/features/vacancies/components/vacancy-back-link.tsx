import Link from "next/link";

type VacancyBackLinkProps = {
  href: string;
};

export function VacancyBackLink({ href }: VacancyBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m10 5-7 7 7 7M3 12h18" />
      </svg>
      Kembali ke lowongan
    </Link>
  );
}
