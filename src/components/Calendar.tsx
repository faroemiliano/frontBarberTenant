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

export default function Calendar({ onConfirm, mode = "user" }: Props) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [horarioActivo, setHorarioActivo] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  async function toggleHorarioAdmin(h: Horario) {
    try {
      const res = await apiFetch(`/admin/horarios/${h.id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setHorarios((prev) =>
        prev.map((x) =>
          x.id === h.id ? { ...x, disponible: data.disponible } : x,
        ),
      );
    } catch (e: any) {
      alert(e.message || "No se pudo cambiar el horario");
    }
  }
  const DIAS_POR_PAGINA = 5;

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
      .then((data) => {
        setHorarios(data);
      })
      .finally(() => setLoading(false));
  }, [mode]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const horariosFuturos = horarios;
  const hayDisponibles = horariosFuturos.some((h) => h.disponible);

  const dias = Array.from(new Set(horariosFuturos.map((h) => h.fecha)));

  const inicio = page * DIAS_POR_PAGINA;
  const fin = inicio + DIAS_POR_PAGINA;

  const diasVisibles = dias.slice(inicio, fin);

  const horariosDelDia = horariosFuturos.filter((h) => h.fecha === diaActivo);
  /* 🔴 CARTEL CUANDO NO HAY NADA */
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

      {/* CONFIRMAR */}
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
