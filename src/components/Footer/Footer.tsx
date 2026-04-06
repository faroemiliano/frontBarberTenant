import { useBarberia } from "../../../BarberiaContext";

export default function Footer() {
  const barberia = useBarberia();
  if (!barberia) return null;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>Dirección</h4>
          <p>{barberia.footer_texto || "Sin información"}</p>
        </div>

        <div className="footer-col">
          <h4>Horarios</h4>
          <div style={{ whiteSpace: "pre-line", margin: 0 }}>
            {barberia.horarios_texto || "Sin horarios"}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {barberia.nombre}
      </div>
    </footer>
  );
}
