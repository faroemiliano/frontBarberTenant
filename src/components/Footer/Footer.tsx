import { useBarberia } from "../../../BarberiaContext";

export default function Footer() {
  const barberia = useBarberia();
  if (!barberia) return null;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>Dirección</h4>
          <p>{barberia.footer}</p>
        </div>

        <div className="footer-col">
          <h4>Horarios</h4>
          <pre style={{ margin: 0 }}>{barberia.horarios}</pre>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {barberia.nombre}
      </div>
    </footer>
  );
}
