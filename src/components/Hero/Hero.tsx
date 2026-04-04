import { useState } from "react";
import Booking from "../Booking/Booking";
import MisTurnos from "../MisTurnos/MisTurnos";
import logoTitulo from "../../assets/logoTitulo2.png";
import locationLogo from "../../assets/logos/logoUbi.png";
import instagramLogo from "../../assets/logos/logoInsta.png";
import whatsappLogo from "../../assets/logos/logoWhats.png";
import { useBarberia } from "../../../BarberiaContext";
import "./hero.css";
interface Props {
  user: any;
  onLogin: () => void;
}

export default function Hero({ user, onLogin }: Props) {
  const [openBooking, setOpenBooking] = useState(false);
  const [misTurnos, setMisTurnos] = useState(false);

  const barberia = useBarberia();

  return (
    <section
      className="hero"
      style={{
        backgroundImage: barberia?.fondo ? `url(${barberia.fondo})` : "none",
        backgroundColor: barberia?.fondo_color || "#f5f5f5",
      }}
    >
      <img
        src={barberia?.logo_url || logoTitulo}
        alt={barberia?.nombre || "Barbería"}
        className="hero-logo-bg"
      />

      <div className="hero-main">
        <p>
          Bienvenido a <strong>{barberia?.nombre || "nuestra barbería"}</strong>
        </p>
        {/* ICONOS */}
        <div className="hero-icons">
          <a href={barberia?.ubicacion || "#"} target="_blank">
            <img src={locationLogo} />
          </a>

          <a href={barberia?.instagram || "#"} target="_blank">
            <img src={instagramLogo} />
          </a>

          <a href={barberia?.whatsapp || "#"} target="_blank">
            <img src={whatsappLogo} />
          </a>
        </div>

        {/* NO LOGUEADO */}
        {!user && (
          <div className="hero-login">
            <button className="btn-secondary" onClick={onLogin}>
              Para sacar turno Iniciar sesión
            </button>
          </div>
        )}

        {/* LOGUEADO */}
        {user && !user.is_admin && (
          <div className="hero-actions">
            <button
              className="btn-secondary "
              onClick={() => setOpenBooking(true)}
            >
              Reservar turno
            </button>

            <button
              className="btn-secondary"
              onClick={() => setMisTurnos(true)}
            >
              Mis turnos
            </button>
          </div>
        )}
      </div>

      {/* MODALESs */}
      {openBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Booking onClose={() => setOpenBooking(false)} />
          </div>
        </div>
      )}

      {misTurnos && (
        <div className="modal-overlay">
          <div className="modal-content">
            <MisTurnos onClose={() => setMisTurnos(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
