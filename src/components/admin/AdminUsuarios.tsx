import { useEffect, useState } from "react";
import { apiFetch } from "../../api";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const token = localStorage.getItem("token");

  async function cargarUsuarios() {
    const res = await apiFetch("/admin/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setUsuarios(data);
  }

  async function cambiarRol(id: number, rol: string) {
    await apiFetch(`/admin/cambiar-rol/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rol }),
    });

    cargarUsuarios();
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="admin-card">
      <h2>Gestión de usuarios</h2>

      <div className="admin-usuarios-form">
        <div className="admin-usuarios-scroll">
          <table className="admin-usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td className={`rol-badge rol-${u.rol}`}>{u.rol}</td>

                  <td className="admin-usuarios-actions">
                    {u.rol !== "barbero" && (
                      <button
                        className="admin-btn-barbero"
                        onClick={() => cambiarRol(u.id, "barbero")}
                      >
                        Hacer barbero
                      </button>
                    )}

                    {u.rol === "barbero" && (
                      <button
                        className="admin-btn-cliente"
                        onClick={() => cambiarRol(u.id, "cliente")}
                      >
                        Quitar barbero
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
