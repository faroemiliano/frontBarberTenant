import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import Calendar from "../Calendar/Calendar";
import "./BookingModal.css";

interface HorarioSeleccionado {
  id: number;
  fecha: string;
  hora: string;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  modo: "crear" | "editar";
  soloHorarioYServicio?: boolean; // 🔥 CORRECTO
  turnoInicial?: {
    telefono: string;
    servicio_id: number;
    precio: number;
    horario: HorarioSeleccionado | null;
  };
  onSubmit: (data: {
    telefono: string;
    servicio_id: number;
    precio: number;
    horario: HorarioSeleccionado;
  }) => Promise<void>;
}

export default function BookingModal({
  open,
  onClose,
  modo,
  turnoInicial,
  soloHorarioYServicio = false,
  onSubmit,
}: BookingModalProps) {
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [precio, setPrecio] = useState(0);
  const [horario, setHorario] = useState<HorarioSeleccionado | null>(null);
  const [editandoHorario, setEditandoHorario] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/admin/servicios")
      .then((res) => res.json())
      .then((data) => setServicios(data));
  }, []);

  useEffect(() => {
    if (!open) return;

    if (turnoInicial) {
      setTelefono(turnoInicial.telefono);
      setPrecio(turnoInicial.precio ?? 0);
      setHorario(turnoInicial.horario);

      const servicioEncontrado = servicios.find(
        (s) => s.id === turnoInicial.servicio_id,
      );

      setServicio(servicioEncontrado ?? null);
    } else {
      setTelefono("");
      setServicio(null);
      setPrecio(0);
      setHorario(null);
    }
  }, [open, turnoInicial, servicios]);

  if (!open) return null;

  async function handleSubmit() {
    if (!horario || !servicio) return;

    setLoading(true);

    await onSubmit({
      telefono,
      servicio_id: servicio.id,
      precio,
      horario,
    });

    setLoading(false);
    onClose();
  }

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal-box">
        <button className="booking-modal-close" onClick={onClose}>
          X
        </button>

        <h2>{modo === "editar" ? "Editar turno" : "Nuevo turno"}</h2>

        <div className="booking-services-grid">
          {servicios.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`booking-service-card ${servicio?.id === s.id ? "active" : ""}`}
              onClick={() => {
                setServicio(s);
                setPrecio(s.precio);
              }}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        <input
          placeholder="Teléfono"
          value={telefono}
          disabled={soloHorarioYServicio}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <input
          type="number"
          placeholder="Precio"
          min={0}
          value={precio}
          disabled={soloHorarioYServicio}
          onChange={(e) =>
            setPrecio(e.target.value === "" ? 0 : Number(e.target.value))
          }
        />

        {horario && !editandoHorario && (
          <>
            <div className="booking-horario-resumen">
              <p>
                Fecha: {horario.fecha}
                <br />
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
              className="booking-confirm"
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
