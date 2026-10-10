export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function checkBackendHealth(signal?: AbortSignal) {
  const response = await fetch(new URL("/up", API_BASE_URL), {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Backend belum dapat dihubungi.");
  }

  const health: { status?: string } = await response.json();
  if (health.status !== "up") {
    throw new Error("Backend belum dapat dihubungi.");
  }

  return { status: "ok" as const };
}
