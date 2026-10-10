"use client";

import { useEffect, useRef } from "react";
import type { Vacancy } from "../../types";
import { useDeleteVacancy } from "../../hooks/use-delete-vacancy";

interface VacancyDeleteDialogProps {
  vacancy: Vacancy;
  onCancel: () => void;
  onDeleted: () => void;
}

export function VacancyDeleteDialog({
  vacancy,
  onCancel,
  onDeleted,
}: VacancyDeleteDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submitting = useRef(false);
  const deletion = useDeleteVacancy();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      document.getElementById(`delete-vacancy-${vacancy.id}`)?.focus();
    };
  }, [vacancy.id]);

  async function confirmDelete() {
    if (submitting.current) return;
    submitting.current = true;

    try {
      await deletion.mutateAsync(vacancy.id);
      onDeleted();
    } catch {
      submitting.current = false;
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-vacancy-heading"
      aria-describedby="delete-vacancy-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting.current) onCancel();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-sm border border-line bg-white p-6 text-ink shadow-xl backdrop:bg-black/40"
    >
      <h2 id="delete-vacancy-heading" className="text-xl font-semibold">
        Hapus lowongan?
      </h2>
      <p
        id="delete-vacancy-description"
        className="mt-3 break-words text-sm leading-6 text-muted"
      >
        Lowongan “{vacancy.title}” akan dihapus permanen. Tindakan ini tidak
        dapat dibatalkan.
      </p>
      {deletion.isError && (
        <p role="alert" className="mt-4 text-sm text-rose-700">
          Lowongan belum berhasil dihapus. Coba lagi.
        </p>
      )}
      {deletion.isPending && (
        <p role="status" className="mt-4 text-sm text-muted">
          Menghapus lowongan…
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          autoFocus
          disabled={deletion.isPending}
          onClick={onCancel}
          className="min-h-10 rounded-sm bg-zinc-100 px-4 text-sm hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={deletion.isPending}
          onClick={() => void confirmDelete()}
          className="min-h-10 rounded-sm bg-rose-700 px-4 text-sm text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          Hapus lowongan
        </button>
      </div>
    </dialog>
  );
}
