import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Horario {
  id: number;
  fecha: string;
  hora: string;
  bloqueado: boolean;
  disponible: boolean;
}

export default function AdminCalendar({
  horarios,
  onToggleBloqueo,
}: {
  horarios: Horario[];
  onToggleBloqueo: (id: number, bloquear: boolean) => void;
}) {
  const events = horarios.map((h) => ({
    id: String(h.id),
    title: h.bloqueado ? "Bloqueado" : "Disponible",
    start: `${h.fecha}T${h.hora}`,
    allDay: false,
    backgroundColor: h.bloqueado ? "#7f1d1d" : "#065f46",
    borderColor: "transparent",
    extendedProps: {
      bloqueado: h.bloqueado,
    },
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale="es"
      height="auto"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      views={{
        dayGridMonth: {
          dayMaxEvents: 2, // 🔥 CLAVE: evita el quilombo visual
        },
      }}
      slotMinTime="09:00:00"
      slotMaxTime="21:00:00"
      slotDuration="00:30:00"
      events={events}
      eventClick={(info) => {
        const id = Number(info.event.id);
        const bloqueado = info.event.extendedProps.bloqueado;
        onToggleBloqueo(id, !bloqueado);
      }}
    />
  );
}
