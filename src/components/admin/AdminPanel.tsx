import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Calendar from "../Calendar";
import { getUser } from "../../auth";

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUser();
  const barberoId = user?.id;

  const isHome = location.pathname === "/admin";

  return (
    <section className="admin-panel">
      <h1 className="admin-title">Panel Administrador</h1>

      <div className="admin-nav-buttons">
        <button onClick={() => navigate("/admin")} className="btn-secondary">
          Inicio
        </button>

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

        <button
          onClick={() => navigate("/admin/servicios")}
          className="btn-secondary"
        >
          Servicios
        </button>

        <button
          onClick={() => navigate("/admin/usuarios")}
          className="btn-secondary"
        >
          Gestionar Usuarios
        </button>
      </div>

      {/* PAGINA INICIO */}
      {isHome && (
        <>
          <hr />

          <div className="admin-agenda">
            <h2 className="agenda-title">Turnos de Hoy</h2>

            {barberoId && <Calendar mode="admin" barberoId={barberoId} />}
          </div>
        </>
      )}

      {/* OTRAS SECCIONES */}
      {!isHome && (
        <>
          <hr />
          <Outlet />
        </>
      )}
    </section>
  );
}
