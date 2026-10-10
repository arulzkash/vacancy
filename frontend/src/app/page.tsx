import { BackendStatus } from "@/components/backend-status";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <p className="text-sm font-medium text-zinc-500">Dicoding Jobs</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Fondasi aplikasi lowongan
        </h1>
        <p className="mt-4 leading-7 text-zinc-600">
          Laravel, Next.js, dan SQLite sudah disiapkan. Fitur lowongan akan
          ditambahkan pada tahap berikutnya.
        </p>
      </header>
      <BackendStatus />
    </main>
  );
}
