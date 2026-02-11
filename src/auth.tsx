// auth.ts (o donde manejes la sesión)

export function saveSession(
  token: string,
  user: {
    id: number;
    email: string;
    nombre?: string;
    is_admin: boolean;
  },
) {
  localStorage.setItem("token", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: user.id,
      email: user.email,
      nombre: user.nombre || "",
      is_admin: user.is_admin,
    }),
  );
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser(): {
  id: number;
  email: string;
  nombre: string;
  is_admin: boolean;
} | null {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    const user = JSON.parse(raw);

    // validación mínima (MUY importante)
    if (typeof user.id !== "number" || typeof user.is_admin !== "boolean") {
      throw new Error("Usuario inválido");
    }

    return user;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
