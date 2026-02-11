import { useEffect, useState } from "react";

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

const API_URL = "http://localhost:8000";

export default function AdminServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/servicios`, {
        credentials: "include",
      });
      const data = await res.json();
      setServicios(data);
    } catch (err) {
      console.error("Error cargando servicios", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarTodosLosServicios = async () => {
    setSaving(true);

    try {
      await Promise.all(
        servicios.map((s) =>
          fetch(`${API_URL}/admin/servicios/${s.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ precio: s.precio }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Error actualizando ${s.nombre}`);
          }),
        ),
      );

      alert("Todos los servicios se actualizaron correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar servicios");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (id: number, field: keyof Servicio, value: any) => {
    setServicios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  if (loading) return <p>Cargando servicios...</p>;

  return (
    <section className="admin-servicios-section">
      <h2>Servicios y Precios</h2>

      <table className="admin-table-servicios">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>modificar Precio</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id}>
              <td>{s.nombre}</td>
              <td>
                <input
                  type="number"
                  min={0}
                  value={s.precio}
                  onChange={(e) =>
                    updateField(s.id, "precio", Number(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="btn-secondary"
        onClick={actualizarTodosLosServicios}
        disabled={saving}
        style={{ marginTop: 20 }}
      >
        {saving ? "Guardando cambios..." : "Guardar todos los cambios"}
      </button>
    </section>
  );
}
