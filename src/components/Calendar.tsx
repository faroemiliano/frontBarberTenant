import { useEffect, useState } from "react";
import { apiFetch } from "../api";

interface Horario {
  id: number;
  fecha: string;
  hora: string;
  disponible: boolean;
}

interface Props {
  onConfirm?: (horario: { id: number; fecha: string; hora: string }) => void;
  mode?: "user" | "admin";
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar({ onConfirm, mode = "user" }: Props) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [horarioActivo, setHorarioActivo] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const DIAS_POR_PAGINA = 5;

  async function toggleHorarioAdmin(h: Horario) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await apiFetch(`/admin/horarios/${h.id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al cambiar horario");

      const data = await res.json();

      setHorarios((prev) =>
        prev.map((x) =>
          x.id === h.id ? { ...x, disponible: data.disponible } : x,
        ),
      );
    } catch (e) {
      alert("No se pudo cambiar el horario");
    }
  }

  useEffect(() => {
    setLoading(true);

    const path = mode === "admin" ? "/admin/calendario" : "/calendario";

    apiFetch(path, {
      headers:
        mode === "admin"
          ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
          : undefined,
    })
      .then((r) => r.json())
      .then((data: Horario[]) => {
        setHorarios(data);

        // 🔥 Guardamos los días ORDENADOS en estado
        const uniqueDays = Array.from(new Set(data.map((h) => h.fecha))).sort();

        setDias(uniqueDays);

        // 🔥 Posicionarnos en HOY
        const hoy = todayISO();
        const indexHoy = uniqueDays.findIndex((d) => d >= hoy);

        if (indexHoy !== -1) {
          setPage(Math.floor(indexHoy / DIAS_POR_PAGINA));
          setDiaActivo(uniqueDays[indexHoy]);
        }
      })
      .finally(() => setLoading(false));
  }, [mode]);

  const inicio = page * DIAS_POR_PAGINA;
  const fin = inicio + DIAS_POR_PAGINA;
  const diasVisibles = dias.slice(inicio, fin);

  const horariosDelDia = horarios.filter((h) => h.fecha === diaActivo);
  const hayDisponibles = horarios.some((h) => h.disponible);

  if (!loading && !hayDisponibles && mode === "user") {
    return (
      <div className="no-slots">
        <h4>😕 Sin turnos disponibles</h4>
        <p>
          Todos los horarios de estos días ya están ocupados.
          <br />
          Probá nuevamente más adelante.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* NAVEGACIÓN */}
      <div className="week-nav">
        <button
          disabled={page === 0}
          onClick={() => {
            setPage((p) => p - 1);
            setDiaActivo(null);
            setHorarioActivo(null);
          }}
        >
          ⬅️
        </button>

        <button
          disabled={fin >= dias.length}
          onClick={() => {
            setPage((p) => p + 1);
            setDiaActivo(null);
            setHorarioActivo(null);
          }}
        >
          ➡️
        </button>
      </div>

      {/* DÍAS */}
      <div className="days-grid">
        {diasVisibles.map((d) => {
          const date = parseLocalDate(d);
          return (
            <button
              key={d}
              className={`day-card ${diaActivo === d ? "active" : ""}`}
              onClick={() => {
                setDiaActivo(d);
                setHorarioActivo(null);
              }}
            >
              <span className="day-name">
                {date.toLocaleDateString("es-AR", { weekday: "short" })}
              </span>
              <span className="day-number">{date.getDate()}</span>
              <span className="day-month">
                {date.toLocaleDateString("es-AR", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {/* HORARIOS */}
      {diaActivo && (
        <>
          {horariosDelDia.length === 0 ? (
            <p className="no-hours">
              No hay horarios disponibles para este día
            </p>
          ) : (
            <div className="hours-grid">
              {horariosDelDia.map((h) => (
                <button
                  key={h.id}
                  className={`hour-card
                    ${horarioActivo?.id === h.id ? "active" : ""}
                    ${!h.disponible ? "blocked" : ""}
                  `}
                  onClick={() => {
                    if (mode === "admin") {
                      toggleHorarioAdmin(h);
                    } else if (h.disponible) {
                      setHorarioActivo(h);
                    }
                  }}
                >
                  {h.hora.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* CONFIRMAR (solo user) */}
      {mode === "user" && horarioActivo && (
        <button
          className="confirm"
          onClick={() =>
            onConfirm?.({
              id: horarioActivo.id,
              fecha: horarioActivo.fecha,
              hora: horarioActivo.hora,
            })
          }
        >
          Confirmar horario
        </button>
      )}
    </>
  );
}
