import { useBarberia } from "../../../BarberiaContext";
import logoBarberia1991 from "../../assets/fondo1.jpeg";

import { useEffect, useState } from "react";

interface Props {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  barberiaSlug?: string;
}

export default function Navbar({
  user,
  onLogin,
  onLogout,
  barberiaSlug,
}: Props) {
  const [logo, setLogo] = useState(logoBarberia1991);

  const barberia = useBarberia();
  useEffect(() => {
    // ⚡ Actualiza el logo solo si barberia existe y tiene logo_url
    if (barberia && barberia.logo_url) {
      setLogo(barberia.logo_url);
    } else {
      setLogo(logoBarberia1991);
    }
  }, [barberia?.logo_url, barberiaSlug]); // se actualiza cada vez que cambia la barbería o el slug

  return (
    <header className="navbar">
      {/* LOGO */}
      <div className="navbar-logo-wrapper">
        <img
          src={logo}
          alt={barberia?.nombre || "Barbería"}
          className="navbar-logo"
        />
      </div>

      {/* BOTONES */}
      <nav className="navbar-actions">
        {!user ? (
          <button className="btn-secondary" onClick={onLogin}>
            Login
          </button>
        ) : (
          <button className="btn-secondary" onClick={onLogout}>
            Salir
          </button>
        )}
      </nav>
    </header>
  );
}
