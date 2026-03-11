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
  const [emailUsuario, setEmailUsuario] = useState("");
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  async function cargarUsuarios() {
    const res = await apiFetch("/admin/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data: Usuario[] = await res.json();

    const ordenados = data.sort((a, b) => a.nombre.localeCompare(b.nombre));

    setUsuarios(ordenados);
  }

  function buscarUsuario() {
    return usuarios.find(
      (u) => u.email.toLowerCase() === emailUsuario.toLowerCase(),
    );
  }

  async function cambiarRol(rol: string) {
    setMensaje("");

    const usuario = buscarUsuario();

    if (!usuario) {
      setMensaje("No existe un usuario con ese email");
      return;
    }

    await apiFetch(`/admin/cambiar-rol/${usuario.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rol }),
    });

    setMensaje(
      rol === "barbero"
        ? "Usuario convertido en barbero"
        : "Barbero removido correctamente",
    );

    setEmailUsuario("");
    cargarUsuarios();
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="admin-card">
      <h2>Gestión de usuarios</h2>

      <div className="admin-barbero-form">
        <h3>Gestionar barberos</h3>

        <input
          type="email"
          placeholder="Email del usuario"
          value={emailUsuario}
          onChange={(e) => setEmailUsuario(e.target.value)}
        />

        <div className="admin-barbero-actions">
          <button
            className="admin-btn-barbero"
            onClick={() => cambiarRol("barbero")}
          >
            Convertir en barbero
          </button>

          <button
            className="admin-btn-cliente"
            onClick={() => cambiarRol("cliente")}
          >
            Quitar barbero
          </button>
        </div>

        {mensaje && <p className="admin-msg">{mensaje}</p>}
      </div>

      <div className="admin-usuarios-scroll">
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td className={`rol-badge rol-${u.rol}`}>{u.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
