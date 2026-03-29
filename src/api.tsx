import { getToken } from "./auth";

const API = import.meta.env.VITE_API_URL;

// 🔥 obtener slug SIEMPRE desde la URL
function getBarberiaFromURL() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  return pathParts[0] || null;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const barberia = getBarberiaFromURL();

  const extraHeaders: Record<string, string> =
    options.headers && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),

    // 🔥 SIEMPRE consistente
    ...(barberia ? { "x-barberia": barberia } : {}),

    ...extraHeaders,
  };

  console.log("🔥 HEADERS FINAL:", headers);

  return fetch(`${API}${path}`, {
    ...options,
    headers,
  });
}
