import logoBarberia1991 from "../assets/fondo1.jpeg";

interface Props {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onLogin, onLogout }: Props) {
  return (
    <header className="navbar">
      {/* LOGO */}
      <div className="navbar-logo-wrapper">
        <img
          src={logoBarberia1991}
          alt="Barbería 1991"
          className="navbar-logo"
        />
      </div>

      {/* ACCIONES */}
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
