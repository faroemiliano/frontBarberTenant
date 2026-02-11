import { useState } from "react";
import Calendar from "./Calendar";
import { getToken } from "../auth";

/* =========================
   TIPOS
========================= */

interface HorarioSeleccionado {
  id: number;
  fecha: string;
  hora: string;
}

interface Servicio {
  id: number;
  nombre: string;
}

/* =========================
   HELPERS
========================= */

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* =========================
   COMPONENTE
========================= */

export default function BookingUser({ onClose }: { onClose: () => void }) {
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [horario, setHorario] = useState<HorarioSeleccionado | null>(null);
  const [horarioConfirmado, setHorarioConfirmado] = useState(false);

  /* =========================
     SERVICIOS (por ahora fijos)
     IDs deben coincidir con DB
  ========================= */

  const servicios: Servicio[] = [
    { id: 1, nombre: "Corte" },
    { id: 2, nombre: "Corte y Barba" },
    { id: 3, nombre: "Corte y Tintura" },
    { id: 4, nombre: "Barba" },
  ];

  /* =========================
     RESERVAR
  ========================= */

  async function reservar() {
    setMensaje("");

    const token = getToken();
    if (!token) return setMensaje("Tenés que iniciar sesión");

    if (!servicio) return setMensaje("Seleccioná un servicio");
    if (!telefono.trim()) return setMensaje("Ingresá tu teléfono");
    if (!horario) return setMensaje("Seleccioná fecha y horario");

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/reservar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telefono,
          servicio_id: servicio.id, // ✅ CLAVE
          horario_id: horario.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data?.detail || "Error al reservar");
        return;
      }

      /* RESET */
      setSuccessOpen(true);
      setTelefono("");
      setServicio(null);
      setHorario(null);
      setHorarioConfirmado(false);
      setMensaje("");
    } catch {
      setMensaje("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      <h2>Reservar turno</h2>

      {/* SERVICIOS */}
      <div className="services-grid">
        {servicios.map((s) => (
          <button
            key={s.id}
            className={`service-card ${servicio?.id === s.id ? "active" : ""}`}
            onClick={() => setServicio(s)}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      {/* TELÉFONO */}
      <input
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      {/* CALENDARIO */}
      {!horarioConfirmado && (
        <Calendar
          onConfirm={(h) => {
            setHorario(h);
            setHorarioConfirmado(true);
          }}
        />
      )}

      {/* RESUMEN */}
      {horarioConfirmado && horario && servicio && (
        <div className="resume-box">
          <p>
            ✂️ Servicio: <strong>{servicio.nombre}</strong>
          </p>
          <p>📅 {parseLocalDate(horario.fecha).toLocaleDateString("es-AR")}</p>
          <p>⏰ {horario.hora}</p>

          <button
            className="btn-secondary"
            onClick={() => {
              setHorarioConfirmado(false);
              setHorario(null);
            }}
          >
            Cambiar horario
          </button>
        </div>
      )}

      {/* MENSAJE */}
      {mensaje && <p className="modal-msg">{mensaje}</p>}

      {/* CONFIRMAR */}
      {horarioConfirmado && (
        <button className="confirm" disabled={loading} onClick={reservar}>
          {loading ? "Reservando..." : "Confirmar reserva"}
        </button>
      )}

      {/* ÉXITO */}
      {successOpen && (
        <div className="success">
          <h2>¡Reserva confirmada! 🎉</h2>
          <p>Te enviamos la confirmación a tu email 📩</p>

          <button
            className="cta"
            onClick={() => {
              setSuccessOpen(false);
              onClose();
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
