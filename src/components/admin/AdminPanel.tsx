console.log("ADMIN PANEL MONTADO");
import { Outlet, useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <section className="admin-panel">
      <h1 className="admin-title">Panel Administrador</h1>

      {/* 🔘 BOTONES PRINCIPALES */}
      <div className="admin-nav-buttons">
        <button
          onClick={() => navigate("/admin/turnos")}
          className="btn-secondary"
        >
          Turnos
        </button>

        <button
          onClick={() => navigate("/admin/ganancias")}
          className="btn-secondary"
        >
          Ganancias
        </button>
        {/* 🆕 SERVICIOS / PRECIOS */}
        <button
          onClick={() => navigate("/admin/servicios")}
          className="btn-secondary"
        >
          Servicios
        </button>
      </div>

      <hr />

      {/* 👇 ACÁ SE RENDERIZA TURNOS O GANANCIAS */}
      <Outlet />
    </section>
  );
}
