import { getToken, getUser } from "./auth";

const API = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const user = getUser();
  const pathSlug = window.location.pathname.split("/")[1];

  const isSuperAdminRoute = pathSlug === "superadmin";

  const barberia = isSuperAdminRoute
    ? null
    : localStorage.getItem("barberia_slug") || pathSlug;
  console.log("🔥 BARBERIA EN FETCH:", barberia);
  // Headers extra seguros
  const extraHeaders: Record<string, string> =
    options.headers && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {};

  const isSuperAdmin =
    user?.rol === "superadmin" ||
    window.location.pathname.startsWith("/superadmin");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),

    // 🔥 SOLO si NO es superadmin
    ...(!isSuperAdmin && barberia ? { "x-barberia": barberia } : {}),

    ...extraHeaders,
  };

  console.log("🔥 TOKEN:", token);
  console.log("🔥 BARBERIA:", barberia);
  console.log("🔥 HEADERS:", headers);
  if (!isSuperAdmin && !barberia) {
    console.error("❌ No hay barberia_slug");
    throw new Error("No hay barberia_slug");
  }
  return fetch(`${API}${path}`, {
    ...options,
    headers,
  });
}
