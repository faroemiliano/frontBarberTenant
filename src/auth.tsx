export function getSlug() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  // 🔹 Superadmin siempre usa este slug
  if (parts[0] === "superadmin") return "superadmin";

  // Home o barbería normal
  return parts[0] || "default";
}

// 💾 TIPO DE USUARIO
export type User = {
  id: number;
  email: string;
  nombre?: string;
  rol: "admin" | "barbero" | "cliente" | "superadmin";
  barberia_id?: number;
  barberia_slug?: string;
};

// 💾 GUARDAR SESIÓN
export function saveSession(token: string, user: User) {
  const slug = getSlug();

  localStorage.setItem(`token_${slug}`, token);
  localStorage.setItem(
    `user_${slug}`,
    JSON.stringify({
      id: user.id,
      email: user.email,
      nombre: user.nombre || "",
      rol: user.rol.toLowerCase() as
        | "superadmin"
        | "admin"
        | "barbero"
        | "cliente",
      barberia_id: user.rol === "superadmin" ? null : user.barberia_id,
      barberia_slug: user.rol === "superadmin" ? null : user.barberia_slug,
    }),
  );
}

// 🔑 OBTENER TOKEN
export function getToken() {
  const slug = getSlug();
  return localStorage.getItem(`token_${slug}`);
}

// 👤 OBTENER USUARIO
export function getUser(): User | null {
  const slug = getSlug();
  const raw = localStorage.getItem(`user_${slug}`);
  if (!raw) return null;

  try {
    const user: User = JSON.parse(raw);

    return {
      ...user,
      rol: user.rol.toLowerCase() as
        | "superadmin"
        | "admin"
        | "barbero"
        | "cliente",
    };
  } catch {
    localStorage.removeItem(`user_${slug}`);
    return null;
  }
}

// 🚪 LOGOUT
export function logout() {
  const slug = getSlug();
  localStorage.removeItem(`token_${slug}`);
  localStorage.removeItem(`user_${slug}`);
}
