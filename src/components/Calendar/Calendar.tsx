import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useParams } from "react-router-dom";

interface Horario {
  id: number;
  fecha: string;
  hora: string;
  disponible: boolean;
}

interface Props {
  onConfirm?: (horario: { id: number; fecha: string; hora: string }) => void;
  mode?: "user" | "admin" | "barbero";
  barberoId?: number;
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

export default function Calendar({
  onConfirm,
  mode = "user",
  barberoId,
}: Props) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [horarioActivo, setHorarioActivo] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const { barberia } = useParams();
  const DIAS_POR_PAGINA = 5;

  async function toggleHorario(h: Horario) {
    try {
      const token = localStorage.getItem(`token_${barberia}`);
      if (!token) {
        console.log("❌ No hay token");
        return;
      }

      console.log("🖱️ CLICK:", h.id, "estado actual:", h.disponible);

      const res = await apiFetch(
        mode === "admin"
          ? `/admin/horarios/${h.id}/toggle`
          : `/barbero/horarios/${h.id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(barberia ? { "x-barberia": barberia } : {}),
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("💥 ERROR BACK:", data);
        alert(data.detail || "Error al cambiar horario");
        return;
      }

      console.log("✅ RESPUESTA:", data);

      // 🔥 UPDATE INSTANTÁNEO
      setHorarios((prev) =>
        prev.map((x) =>
          x.id === h.id ? { ...x, disponible: data.disponible } : x,
        ),
      );
    } catch (err) {
      console.error("💥 ERROR:", err);
      alert("No se pudo cambiar el horario");
    }
  }

  useEffect(() => {
    async function cargarHorarios() {
      if (mode === "user" && !barberoId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let token = localStorage.getItem(`token_${barberia}`);

        console.log("🧠 MODE:", mode);
        console.log("🧠 BARBERO ID:", barberoId);
        console.log("🧠 BARBERIA (slug):", barberia);
        console.log("🧠 TOKEN:", token);

        let headers: Record<string, string> | undefined;

        if (token && (mode === "admin" || mode === "barbero")) {
          headers = {
            Authorization: `Bearer ${token}`,
            ...(barberia ? { "x-barberia": barberia } : {}),
          };
        }

        let path = "";

        if (mode === "admin") {
          path = barberoId
            ? `/admin/calendario-admin?barbero_id=${barberoId}`
            : `/admin/calendario-admin`;
        } else if (mode === "barbero") {
          path = "/barbero/horarios";
        } else {
          path = `/calendario/${barberoId}`;
        }

        console.log("🌐 PATH:", path);

        const res = await apiFetch(path, { headers });

        console.log("📡 STATUS:", res.status);

        const data: Horario[] = await res.json();

        console.log("📦 DATA:", data);

        if (!Array.isArray(data)) throw new Error("Datos inválidos");

        setHorarios(data);

        const uniqueDays = Array.from(new Set(data.map((h) => h.fecha))).sort();

        console.log("📅 DIAS:", uniqueDays);

        setDias(uniqueDays);

        const hoy = todayISO();
        const indexHoy = uniqueDays.findIndex((d) => d >= hoy);

        console.log("📍 indexHoy:", indexHoy);

        setPage(indexHoy !== -1 ? Math.floor(indexHoy / DIAS_POR_PAGINA) : 0);

        setDiaActivo(
          indexHoy !== -1 ? uniqueDays[indexHoy] : (uniqueDays[0] ?? null),
        );
      } catch (err) {
        console.error("💥 ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarHorarios();
  }, [mode, barberoId, barberia]);

  const inicio = page * DIAS_POR_PAGINA;
  const fin = inicio + DIAS_POR_PAGINA;

  const diasVisibles = dias.slice(inicio, fin);

  const horariosVisibles = horarios.filter(
    (h) => h.fecha === diaActivo && (mode !== "user" || h.disponible),
  );

  const hayDisponibles = horarios.some(
    (h) => h.disponible && (mode !== "user" || h.disponible),
  );

  if (loading) return <p>Cargando horarios...</p>;

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

  console.log("🎯 dias:", dias);
  console.log("🎯 page:", page);
  console.log("🎯 diasVisibles:", diasVisibles);
  console.log("🎯 diaActivo:", diaActivo);
  console.log("🎯 horarios:", horarios);

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

      {diaActivo && (
        <>
          {horariosVisibles.length === 0 ? (
            <p className="no-hours">
              No hay horarios disponibles para este día
            </p>
          ) : (
            <div className="hours-grid">
              {horariosVisibles.map((h) => (
                <button
                  key={`${h.id}-${h.hora}`}
                  className={`hour-card ${
                    horarioActivo?.id === h.id ? "active" : ""
                  } ${!h.disponible ? "blocked" : ""}`}
                  onClick={() => {
                    if (mode === "admin" || mode === "barbero") {
                      toggleHorario(h);
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
