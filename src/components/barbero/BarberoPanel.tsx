import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Calendar from "../Calendar";
import BookingModal from "../BookingModal";
import { apiFetch } from "../../api";

interface Turno {
  id: number;
  cliente: string;
  telefono: string;
  fecha: string;
  hora: string;
  horario_id: number;
  servicio: string;
  servicio_id: number;
  precio: number;
}

interface PanelData {
  turnos: Turno[];
  dinero_diario: number;
  dinero_mensual: number;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

interface Props {
  userId: number;
}

export default function BarberoPanel({}: Props) {
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const hoyLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyLocal());
  const token = localStorage.getItem("token");

  const fetchPanel = async () => {
    try {
      const res = await apiFetch("/panel-barbero", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicios = async () => {
    const res = await apiFetch("/admin/servicios");
    const json = await res.json();
    setServicios(json);
  };

  useEffect(() => {
    fetchPanel();
    fetchServicios();
  }, []);

  const cancelarTurno = async (id: number) => {
    await apiFetch(`/barbero/turnos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPanel();
  };

  if (loading) return <div className="panel-loading">Cargando...</div>;
  if (!data) return <div>Error</div>;

  const COLORS = ["#00c853", "#2962ff"];

  const turnosFiltrados = data.turnos.filter((t) => {
    const fechaTurno = t.fecha.split("T")[0];
    return fechaTurno === fechaSeleccionada;
  });

  const gananciaDelDia = turnosFiltrados.reduce(
    (acc, turno) => acc + turno.precio,
    0,
  );

  const fechaObj = new Date(fechaSeleccionada);

  const gananciaDelMesSeleccionado = data.turnos
    .filter((t) => {
      const fechaTurno = new Date(t.fecha);
      return (
        fechaTurno.getMonth() === fechaObj.getMonth() &&
        fechaTurno.getFullYear() === fechaObj.getFullYear()
      );
    })
    .reduce((acc, turno) => acc + turno.precio, 0);

  const esHoy = fechaSeleccionada === hoyLocal();

  const graficoData = [
    {
      name: esHoy ? "Hoy" : fechaSeleccionada,
      value: gananciaDelDia,
    },
    {
      name: "Mes",
      value: gananciaDelMesSeleccionado,
    },
  ];

  return (
    <div className="panel-container">
      <div className="admin-card">
        <h1 className="admin-title">Panel del Barbero</h1>
        <h2 className="turnos-title">Turnos</h2>

        <div className="admin-day-nav">
          <button
            className="btn-secondary"
            onClick={() => {
              const [year, month, day] = fechaSeleccionada
                .split("-")
                .map(Number);
              const d = new Date(year, month - 1, day); // LOCAL
              d.setDate(d.getDate() - 1);

              setFechaSeleccionada(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                  d.getDate(),
                ).padStart(2, "0")}`,
              );
            }}
          >
            Dia anterior
          </button>

          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
          />

          <button
            className="btn-secondary"
            onClick={() => {
              const [year, month, day] = fechaSeleccionada
                .split("-")
                .map(Number);
              const d = new Date(year, month - 1, day); // LOCAL
              d.setDate(d.getDate() + 1);

              setFechaSeleccionada(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                  d.getDate(),
                ).padStart(2, "0")}`,
              );
            }}
          >
            Dia siguiente
          </button>
        </div>

        <table className="turnos-table">
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
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id}>
                <td>{turno.cliente}</td>
                <td>{turno.telefono}</td>
                <td>{turno.fecha}</td>
                <td>{turno.hora}</td>
                <td>{turno.servicio}</td>
                <td>${turno.precio}</td>
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() => setTurnoEditando(turno)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => cancelarTurno(turno.id)}
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
      </div>

      <div className="ganancias-box">
        <div className="ganancia-card">
          <h3>{esHoy ? "Ganancia Hoy" : `Ganancia ${fechaSeleccionada}`}</h3>
          <p>${gananciaDelDia}</p>
        </div>

        <div className="ganancia-card">
          <h3>Ganancia del Mes</h3>
          <p>${gananciaDelMesSeleccionado}</p>
        </div>
      </div>

      <div className="grafico-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={graficoData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: $${value}`}
            >
              {graficoData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {calendarOpen && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h2>Bloquear / Desbloquear horarios</h2>
            <Calendar mode="barbero" />
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

      {turnoEditando && (
        <BookingModal
          open
          modo="editar"
          turnoInicial={{
            telefono: turnoEditando.telefono,
            servicio_id: turnoEditando.servicio_id,
            precio: turnoEditando.precio,
            horario: {
              id: turnoEditando.horario_id,
              fecha: turnoEditando.fecha,
              hora: turnoEditando.hora,
            },
          }}
          onClose={() => setTurnoEditando(null)}
          onSubmit={async ({ servicio_id, horario }) => {
            const payload: any = {};

            if (horario.id !== turnoEditando.horario_id) {
              payload.fecha = horario.fecha;
              payload.hora = horario.hora;
            }

            if (servicio_id !== turnoEditando.servicio_id) {
              payload.servicio_id = servicio_id;
            }

            const res = await apiFetch(`/barbero/turnos/${turnoEditando.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              alert("No se pudo actualizar");
              return;
            }

            fetchPanel();
            setTurnoEditando(null);
          }}
        />
      )}
    </div>
  );
}
