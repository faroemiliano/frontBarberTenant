import Calendar from "./Calendar";
import { useState, useEffect } from "react";

interface HorarioSeleccionado {
  id: number;
  fecha: string;
  hora: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  modo: "crear" | "editar";
  turnoInicial?: {
    telefono: string;
    servicio: string;
    precio: number;
    horario: HorarioSeleccionado | null;
  };
  onSubmit: (data: {
    telefono: string;
    servicio: string;
    precio: number;
    horario: HorarioSeleccionado;
  }) => Promise<void>;
}

export default function BookingModal({
  open,
  onClose,
  modo,
  turnoInicial,
  onSubmit,
}: BookingModalProps) {
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState("");
  const [precio, setPrecio] = useState(0);
  const [horario, setHorario] = useState<HorarioSeleccionado | null>(null);
  const [editandoHorario, setEditandoHorario] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (turnoInicial) {
      setTelefono(turnoInicial.telefono);
      setServicio(turnoInicial.servicio);
      setPrecio(turnoInicial.precio ?? 0);
      setHorario(turnoInicial.horario);
      setEditandoHorario(false);
    } else {
      setTelefono("");
      setServicio("");
      setPrecio(0);
      setHorario(null);
      setEditandoHorario(false);
    }
  }, [open, turnoInicial]);

  if (!open) return null;

  async function handleSubmit() {
    if (!horario || !servicio) return;

    const precioFinal =
      Number(
        (document.getElementById("precio-input") as HTMLInputElement)?.value,
      ) || 0;

    setLoading(true);
    await onSubmit({
      telefono,
      servicio,
      precio: precioFinal,
      horario,
    });
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          X
        </button>

        <h2>{modo === "editar" ? "Editar turno" : "Nuevo turno"}</h2>

        {/* SERVICIOS */}
        <div className="services-grid">
          {["Corte", "Corte y Barba", "Corte y Tintura", "Barba"].map((s) => (
            <button
              key={s}
              type="button"
              className={`service-card ${servicio === s ? "active" : ""}`}
              onClick={() => setServicio(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* TELÉFONO */}
        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        {/* PRECIO */}
        <input
          id="precio-input"
          type="number"
          placeholder="Precio"
          defaultValue={turnoInicial?.precio ?? 0}
        />

        {/* RESUMEN */}
        {horario && !editandoHorario && (
          <>
            <div className="horario-resumen">
              <p>
                Fecha: {horario.fecha} <br />
                Hora: {horario.hora}
              </p>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditandoHorario(true)}
              >
                Cambiar día y hora
              </button>
            </div>

            <button
              className="confirm"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading
                ? "Guardando..."
                : modo === "editar"
                  ? "Guardar cambios"
                  : "Confirmar reserva"}
            </button>
          </>
        )}

        {/* CALENDARIO */}
        {editandoHorario && (
          <Calendar
            onConfirm={(nuevoHorario) => {
              setHorario(nuevoHorario);
              setEditandoHorario(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
