import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { getToken } from "../../auth";
import "./SuperAdmin.css";

interface Barberia {
  id: number;
  nombre: string;
  slug: string;
  activo?: boolean;
  // 🎨 visual
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
  fondo_url?: string;
  footer_texto?: string;
  direccion?: string;

  // 📱 contacto
  instagram_url?: string;
  whatsapp_url?: string;
  ubicacion_url?: string;

  // 📝 contenido
  horarios_texto?: string;
  galeria?: any[];

  // 🎯 estilos avanzados
  fondo_color?: string;
  fondo_color_footer?: string;
  fondo_color_videos?: string;
  fondo_color_navbar?: string;
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
  const [editData, setEditData] = useState<Record<number, Partial<Barberia>>>(
    {},
  );
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;

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
  useEffect(() => {
    if (barberias.length > 0) {
      const initial: Record<number, any> = {};

      barberias.forEach((b) => {
        initial[b.id] = { ...b };
      });

      setEditData(initial);
    }
  }, [barberias]);

  async function actualizarBarberia(id: number) {
    if (!token) return;

    try {
      // 🔥 ENVIAMOS TODOS LOS CAMPOS, INCLUYENDO VACÍOS
      const dataToSend = { ...editData[id] };
      delete dataToSend.id; // quitamos solo el ID

      console.log("📤 Enviando data completa:", dataToSend);

      const res = await apiFetch(`/superadmin/actualizar-barberia/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Error al actualizar");

      alert("Actualizado correctamente ✅");

      fetchBarberias(); // refresca la lista
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const barberiasPaginated = barberias.slice(startIndex, endIndex);
  const totalPages = Math.ceil(barberias.length / itemsPerPage);
  return (
    <div className="superadmin-container">
      <h2>Panel de SuperAdmin</h2>

      {/* =========================
        CREAR BARBERÍA
    ========================= */}
      <form onSubmit={crearBarberia} className="form-create">
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
            setSlug(generarSlug(value));
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

      {/* =========================
        LISTADO
    ========================= */}
      <h3>Barberías existentes</h3>

      {loading ? (
        <p>Cargando...</p>
      ) : barberias.length > 0 ? (
        <ul className="barberia-list">
          {barberiasPaginated.map((b) => (
            <li key={b.id} className="barberia-card">
              <h4>ID: {b.id}</h4>

              {/* =========================
                INPUTS BÁSICOS
            ========================= */}
              <input
                placeholder="Nombre"
                value={editData[b.id]?.nombre ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      nombre: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="Slug"
                value={editData[b.id]?.slug ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      slug: e.target.value,
                    },
                  })
                }
              />

              {/* =========================
                VISUAL
            ========================= */}
              <input
                placeholder="Logo URL"
                value={editData[b.id]?.logo_url ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      logo_url: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="Color primario"
                value={editData[b.id]?.color_primario ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      color_primario: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="Color secundario"
                value={editData[b.id]?.color_secundario ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      color_secundario: e.target.value,
                    },
                  })
                }
              />

              {/* =========================
                CONTACTO
            ========================= */}
              <input
                placeholder="Instagram"
                value={editData[b.id]?.instagram_url ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      instagram_url: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="WhatsApp"
                value={editData[b.id]?.whatsapp_url ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      whatsapp_url: e.target.value.replace(/\D/g, ""),
                    },
                  })
                }
              />

              <input
                type="url"
                placeholder="Google Maps URL"
                value={editData[b.id]?.ubicacion_url ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      ubicacion_url: e.target.value,
                    },
                  })
                }
              />

              {/* =========================
                TEXTOS
            ========================= */}
              <textarea
                placeholder="Horarios"
                value={editData[b.id]?.horarios_texto ?? b.horarios_texto ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      horarios_texto: e.target.value,
                    },
                  })
                }
              />

              <textarea
                placeholder="Dirección"
                value={editData[b.id]?.direccion ?? b.direccion ?? ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [b.id]: {
                      ...editData[b.id],
                      direccion: e.target.value,
                    },
                  })
                }
              />

              {/* =========================
                ACCIONES
            ========================= */}
              <button
                className="btn btn-save"
                onClick={() => actualizarBarberia(b.id)}
              >
                💾 Guardar
              </button>

              {b.activo === false && (
                <span className="badge-blocked">🔒 Bloqueada</span>
              )}

              <div style={{ marginTop: "10px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => prepararServicios(b.id)}
                >
                  ✂️ Servicios
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => prepararCalendario(b.id)}
                >
                  📅 Horarios
                </button>

                <button
                  className="btn btn-warning"
                  onClick={() => bloquearBarberia(b.id)}
                >
                  Bloquear
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => activarBarberia(b.id)}
                >
                  Activar
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => eliminarBarberia(b.id)}
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
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <button
          className="btn btn-primary"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ⬅ Anterior
        </button>

        <span style={{ fontSize: "12px" }}>
          Página {page} de {totalPages}
        </span>

        <button
          className="btn btn-primary"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente ➡
        </button>
      </div>
    </div>
  );
}
