import { getToken } from "./auth";

const API = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const barberia = localStorage.getItem("barberia_slug");

  const extraHeaders: Record<string, string> =
    options.headers && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),

    // 🔥 SIEMPRE mandar barberia si existe
    ...(barberia ? { "x-barberia": barberia } : {}),

    ...extraHeaders,
  };

  console.log("🔥 HEADERS:", headers);

  return fetch(`${API}${path}`, {
    ...options,
    headers,
  });
}
