import { useState } from "react";
import Booking from "./Booking";
import logoTitulo from "../assets/logoTitulo2.png";
import locationLogo from "../assets/logos/logoUbi.png";
import instagramLogo from "../assets/logos/logoInsta.png";
import whatsappLogo from "../assets/logos/logoWhats.png";
import fondo from "../assets/fondoPantalla.png";

interface Props {
  user: any;
  onLogin: () => void;
}

export default function Hero({ user, onLogin }: Props) {
  const [openBooking, setOpenBooking] = useState(false);

  return (
    <section className="hero" style={{ backgroundImage: `url(${fondo})` }}>
      <img src={logoTitulo} alt="Barbería 1991" className="hero-logo-bg" />

      <div className="hero-main">
        {/* ICONOS */}
        <div className="hero-icons">
          <a href="https://maps.app.goo.gl/cESJbAGczdZVZnL7A" target="_blank">
            <img src={locationLogo} />
          </a>
          <a
            href="https://www.instagram.com/1991.barberia?igsh=MXE3YzVwaTAyZ2l3Zw=="
            target="_blank"
          >
            <img src={instagramLogo} />
          </a>
          <a href="https://wa.me/5491122384585" target="_blank">
            <img src={whatsappLogo} />
          </a>
        </div>

        {/* NO LOGUEADO */}
        {!user && (
          <div className="hero-login">
            <button className="cta" onClick={onLogin}>
              Para sacar turno Iniciar sesión
            </button>
          </div>
        )}

        {/* LOGUEADO */}
        {user && !user.is_admin && (
          <button className="cta" onClick={() => setOpenBooking(true)}>
            Reservar turno
          </button>
        )}
      </div>

      {openBooking && <Booking onClose={() => setOpenBooking(false)} />}
    </section>
  );
}
