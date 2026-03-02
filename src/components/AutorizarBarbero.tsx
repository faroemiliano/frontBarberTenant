import { useState } from "react";
import type { FormEvent } from "react"; // ✅ solo tipo

export default function AutorizarBarbero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setMensaje("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const tokenAdmin = localStorage.getItem("token");
      if (!tokenAdmin) {
        setMensaje("No se encontró token de admin. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://tu-backend.com/admin/autorizar-barbero",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenAdmin}`,
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error al autorizar barbero");
      } else {
        setMensaje(data.mensaje);
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Autorizar Barbero</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email del usuario"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Autorizando..." : "Autorizar"}
        </button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}
