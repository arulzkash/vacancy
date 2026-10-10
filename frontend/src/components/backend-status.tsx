"use client";

import { useQuery } from "@tanstack/react-query";
import { checkBackendHealth } from "@/lib/api";

export function BackendStatus() {
  const { isPending, isError, refetch } = useQuery({
    queryKey: ["backend-health"],
    queryFn: ({ signal }) => checkBackendHealth(signal),
  });

  return (
    <section
      aria-label="Status koneksi backend"
      className="rounded-xl border border-zinc-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold">Koneksi aplikasi</h2>
      <p role="status" className="mt-2 text-sm text-zinc-600">
        {isPending
          ? "Memeriksa koneksi backend…"
          : isError
            ? "Backend belum dapat dihubungi."
            : "Backend terhubung. SQLite siap digunakan."}
      </p>
      {isError && (
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Coba lagi
        </button>
      )}
    </section>
  );
}
