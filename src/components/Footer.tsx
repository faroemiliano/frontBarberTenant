export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>Dirección</h4>
          <p>Av. Siempre Viva 742</p>
          <p>Buenos Aires, Argentina</p>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <p>📞 Tel: 11 1234-5678</p>
          <p>
            💬 WhatsApp:{" "}
            <a
              href="https://wa.me/5491112345678"
              target="_blank"
              rel="noreferrer"
            >
              Enviar mensaje
            </a>
          </p>
        </div>
        <div className="footer-col">
          <h4>Horarios</h4>
          <p>Lunes a Sábado</p>
          <p>10:00 – 20:00</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Barbería El Corte · Todos los derechos
        reservados
      </div>
    </footer>
  );
}
