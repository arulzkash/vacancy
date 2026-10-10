import { API_BASE_URL } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export async function deleteVacancy(id: number): Promise<void> {
  const response = await fetch(new URL(`/api/vacancies/${id}`, API_BASE_URL), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  // A vacancy removed elsewhere is already in the requested state.
  if (response.status === 404) return;

  if (!response.ok) {
    throw new ApiError(
      "Lowongan belum berhasil dihapus. Coba lagi.",
      response.status,
    );
  }
}
