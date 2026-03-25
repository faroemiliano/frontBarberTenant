import { GoogleLogin } from "@react-oauth/google";
import { saveSession } from "../auth";
import { apiFetch } from "../api";
const API = import.meta.env.VITE_API_URL; // 🔹 definir API

export default function GoogleLoginButton({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  return (
    <GoogleLogin
      onSuccess={async (res) => {
        const credential = res.credential;
        if (!credential) return;

        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const isSuperAdminRoute = pathParts[0] === "superadmin";

        const bodyPayload = isSuperAdminRoute
          ? { credential }
          : { credential, barberia_slug: pathParts[0] };

        const endpoint = isSuperAdminRoute ? "/auth/google" : "/auth/google";

        try {
          const r = await apiFetch(`${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
          });

          const data = await r.json();

          if (!r.ok) throw new Error(data.detail || "Error en login");

          const token = data.access_token || data.token || data.accessToken;
          if (!token) throw new Error("No vino token del backend");

          saveSession(token, {
            id: data.user.id,
            email: data.user.email,
            nombre: data.user.nombre,
            rol: data.user.rol.toLowerCase() as
              | "superadmin"
              | "admin"
              | "barbero"
              | "cliente",
            barberia_id: isSuperAdminRoute
              ? null
              : data.user.barberia_id || null,
            barberia_slug: isSuperAdminRoute
              ? null
              : data.user.barberia_slug || null,
          });

          onSuccess();
        } catch (err) {
          console.error("Error en login Google:", err);
        }
      }}
      onError={() => console.log("Login con Google falló")}
    />
  );
}
