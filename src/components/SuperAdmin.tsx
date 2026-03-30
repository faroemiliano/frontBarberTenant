import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { getToken } from "../auth";

interface Barberia {
  id: number;
  nombre: string;
  slug: string;
  activo?: boolean;
}

function generarSlug(texto: string) {
  return texto
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export default function SuperAdminPanel() {
  const [barberias, setBarberias] = useState<Barberia[]>([]);
  const [nombre, setNombre] = useState("");
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [slug, setSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const token = getToken();

  async function fetchBarberias() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch("/superadmin/listar-barberias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Forzar que sea array
      setBarberias(Array.isArray(data) ? data : []);
      console.log("Barberías obtenidas:", data);
    } catch (err) {
      console.error("Error al obtener barberías:", err);
      setBarberias([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setBarberias([]);
    fetchBarberias();
  }, []);

  async function crearBarberia(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await apiFetch("/superadmin/crear-barberia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          slug,
          admin_email: adminEmail,
          admin_nombre: nombreAdmin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error creando barbería");

      alert("Barbería creada correctamente!");
      setNombre("");
      setNombreAdmin("");
      setSlug("");
      setAdminEmail("");
      fetchBarberias(); // refrescar lista
    } catch (err: any) {
      alert("Error creando barbería: " + err.message);
    }
  }

  async function bloquearBarberia(id: number) {
    if (!confirm("¿Seguro que querés bloquear esta barbería?")) return;
    try {
      const res = await apiFetch(`/superadmin/bloquear-barberia/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al bloquear");
      fetchBarberias();
    } catch (err) {
      console.error(err);
    }
  }

  async function activarBarberia(id: number) {
    if (!confirm("¿Seguro que querés activar esta barbería?")) return;
    try {
      const res = await apiFetch(`/superadmin/activar-barberia/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al activar");
      fetchBarberias();
    } catch (err) {
      console.error(err);
    }
  }

  async function eliminarBarberia(id: number) {
    if (!confirm("¿Seguro que querés eliminar esta barbería?")) return;

    try {
      const res = await apiFetch(`/superadmin/eliminar-barberia/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar");
      fetchBarberias();
    } catch (err) {
      console.error(err);
    }
  }

  async function prepararServicios(barberiaId: number) {
    try {
      const res = await apiFetch("/preparar-servicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barberia_id: barberiaId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error");

      alert("Servicios creados ✂️");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }
  async function prepararCalendario(barberiaId: number) {
    try {
      const res = await apiFetch("/preparar-calendario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barberia_id: barberiaId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error");

      alert("Horarios generados 📅");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Panel de SuperAdmin</h2>

      <form onSubmit={crearBarberia} style={{ marginBottom: "2rem" }}>
        <h3>Crear nueva barbería</h3>
        <input
          placeholder="Nombre del Admin"
          value={nombreAdmin}
          onChange={(e) => setNombreAdmin(e.target.value)}
          required
        />
        <input
          placeholder="Nombre de la barbería"
          value={nombre}
          onChange={(e) => {
            const value = e.target.value;
            setNombre(value);
            setSlug(generarSlug(value)); // 🔥 AUTO
          }}
          required
        />
        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <input
          placeholder="Email del admin"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
        />
        <button type="submit">Crear barbería</button>
      </form>

      <h3>Barberías existentes</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : barberias.length > 0 ? (
        <ul>
          {barberias.map((b) => (
            <li key={b.id} style={{ marginBottom: "10px" }}>
              <strong>{b.nombre}</strong> ({b.slug}){" "}
              {b.activo === false && (
                <span style={{ color: "red", marginLeft: "10px" }}>
                  🔒 Bloqueada
                </span>
              )}
              <div style={{ marginTop: "5px" }}>
                {/* 🔥 CONFIGURACIÓN */}
                <button
                  disabled={loading}
                  onClick={() => prepararServicios(b.id)}
                >
                  ✂️ Servicios
                </button>

                <button
                  onClick={() => prepararCalendario(b.id)}
                  style={{ marginLeft: "5px" }}
                >
                  📅 Horarios
                </button>

                {/* 🔒 CONTROL */}
                <button
                  onClick={() => bloquearBarberia(b.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Bloquear
                </button>

                <button onClick={() => activarBarberia(b.id)}>Activar</button>

                <button
                  onClick={() => eliminarBarberia(b.id)}
                  style={{ color: "red" }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay barberías creadas aún.</p>
      )}
    </div>
  );
}
