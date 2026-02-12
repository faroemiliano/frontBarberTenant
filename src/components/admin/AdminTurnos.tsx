import { useEffect, useState, useMemo } from "react";
import { getToken } from "../../auth";
import BookingModal from "../BookingModal";
import Calendar from "../Calendar";
import { apiFetch } from "../../api";
import { notifyGananciasUpdate } from "../../events/gananciasEvents";

interface Turno {
  id: number;
  nombre: string;
  telefono: string;
  fecha: string; // YYYY-MM-DD
  hora: string;
  servicio: string;
  precio: number;
  horario_id: number; // ✅ agregamos para comparar correctamente
}

/* =========================
   UTILIDADES DE FECHA
========================= */

function fechaLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoToLocalDate(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function moverDiaISO(fechaISO: string, delta: number) {
  const date = isoToLocalDate(fechaISO);
  date.setDate(date.getDate() + delta);
  return fechaLocalISO(date);
}

function isoToDMY(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

export default function AdminPanel() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [turnoAEliminar, setTurnoAEliminar] = useState<Turno | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [diaActivo, setDiaActivo] = useState(fechaLocalISO());

  const turnosDelDia = useMemo(() => {
    return turnos.filter((t) => t.fecha === diaActivo);
  }, [turnos, diaActivo]);

  const cargarTurnos = async () => {
    const res = await apiFetch("/admin/turnos", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setTurnos(data);
    setLoading(false);
  };

  const cancelarTurno = async (id: number) => {
    await apiFetch(`/admin/cancelar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    notifyGananciasUpdate();
    // eliminar localmente para que se vea de inmediato
    setTurnos((prev) => prev.filter((t) => t.id !== id));
    setTurnoAEliminar(null);
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  if (loading) return <p>Cargando turnos...</p>;

  return (
    <section className="admin-panel">
      <h1 className="admin-title">Panel del administrador</h1>

      <div className="admin-card">
        {/* Navegación de días */}
        <div className="admin-day-nav">
          <button
            className="btn-secondary"
            onClick={() => setDiaActivo(moverDiaISO(diaActivo, -1))}
          >
            Día anterior
          </button>

          <span className="admin-day-label">{isoToDMY(diaActivo)}</span>

          <button
            className="btn-secondary"
            onClick={() => setDiaActivo(moverDiaISO(diaActivo, 1))}
          >
            Día siguiente
          </button>
        </div>

        {turnosDelDia.length === 0 && (
          <p className="no-turnos">No hay turnos para este día</p>
        )}

        <div className="admin-turnos-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {turnosDelDia.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{t.telefono}</td>
                  <td>{isoToDMY(t.fecha)}</td>
                  <td>{t.hora}</td>
                  <td>{t.servicio}</td>
                  <td>${t.precio.toFixed(2)}</td>
                  <td className="admin-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setTurnoEditando(t)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setTurnoAEliminar(t)}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR */}
      {turnoEditando && (
        <BookingModal
          open
          modo="editar"
          turnoInicial={{
            telefono: turnoEditando.telefono,
            servicio: turnoEditando.servicio,
            precio: turnoEditando.precio,
            horario: {
              id: turnoEditando.horario_id,
              fecha: turnoEditando.fecha,
              hora: turnoEditando.hora,
            },
          }}
          onClose={() => setTurnoEditando(null)}
          onSubmit={async ({ telefono, servicio, horario, precio }) => {
            if (!turnoEditando) return;

            const turnoId = turnoEditando.id;
            const precioNumber = Number(precio);

            console.log("🔥 ON SUBMIT", {
              telefono,
              servicio,
              horario,
              precio: precioNumber,
            });

            const serviciosMap: Record<string, number> = {
              Corte: 1,
              Barba: 2,
              "Corte y Barba": 3,
              "Corte y Tintura": 4,
            };

            const payload: Record<string, any> = {
              telefono,
              precio: precioNumber,
            };

            if (horario.id !== turnoEditando.horario_id) {
              payload.horario_id = horario.id;
            }

            if (serviciosMap[servicio]) {
              payload.servicio_id = serviciosMap[servicio];
            }

            const res = await apiFetch(`/admin/turnos/${turnoId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              alert("No se pudo actualizar");
              return;
            }
            notifyGananciasUpdate();
            setTurnos((prev) =>
              prev.map((t) =>
                t.id === turnoId
                  ? {
                      ...t,
                      telefono,
                      servicio,
                      precio: precioNumber,
                      fecha: horario.fecha,
                      hora: horario.hora,
                      horario_id: horario.id,
                    }
                  : t,
              ),
            );

            setTurnoEditando(null);
          }}
        />
      )}

      {/* Gestión de horarios */}
      <div className="admin-card compact">
        <div className="admin-header">
          <button
            className="btn-secondary"
            onClick={() => setCalendarOpen(true)}
          >
            Gestionar horarios
          </button>
        </div>
      </div>

      {/* MODAL CANCELAR */}
      {turnoAEliminar && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Cancelar turno</h2>
            <p>
              ¿Cancelar el turno de <strong>{turnoAEliminar.nombre}</strong>?
            </p>
            <p>
              {isoToDMY(turnoAEliminar.fecha)} {turnoAEliminar.hora}
            </p>
            <div className="modal-actions">
              <button onClick={() => setTurnoAEliminar(null)}>Volver</button>
              <button
                className="btn-secondary"
                onClick={() => cancelarTurno(turnoAEliminar.id)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CALENDARIO */}
      {calendarOpen && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h2>Bloquear / Desbloquear horarios</h2>
            <Calendar mode="admin" />
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setCalendarOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
