import { GoogleLogin } from "@react-oauth/google";
import { saveSession } from "../auth";
import { apiFetch } from "../api";

export default function GoogleLoginButton({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  return (
    <GoogleLogin
      onSuccess={async (res) => {
        try {
          const credential = res.credential;
          if (!credential) return;

          const pathParts = window.location.pathname.split("/").filter(Boolean);

          const isSuperAdminRoute = pathParts[0] === "superadmin";
          const barberiaSlug = pathParts[0];

          // 🔥 VALIDACIÓN CLAVE
          if (!isSuperAdminRoute && !barberiaSlug) {
            console.error("❌ No hay barberiaSlug en la  URL");
            return;
          }

          console.log("🔥 LOGIN SLUG:", barberiaSlug);

          const r = await apiFetch("/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(isSuperAdminRoute ? {} : { "x-barberia": barberiaSlug }),
            },
            body: JSON.stringify({ credential }),
          });

          const data = await r.json();

          if (!r.ok) {
            throw new Error(data.detail || "Error en login");
          }

          const token = data.access_token || data.token || data.accessToken;

          if (!token) {
            throw new Error("No vino token del backend");
          }

          saveSession(token, {
            id: data.user.id,
            email: data.user.email,
            nombre: data.user.nombre,
            rol: data.user.rol.toLowerCase(),
            barberia_id: isSuperAdminRoute
              ? null
              : data.user.barberia_id || null,
          });

          onSuccess();
        } catch (err) {
          console.error("❌ Error en login Google:", err);
        }
      }}
      onError={() => {
        console.log("❌ Login con Google falló");
      }}
    />
  );
}
