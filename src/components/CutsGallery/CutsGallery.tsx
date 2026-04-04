import { useBarberia } from "../../../BarberiaContext";

export default function CutsGallery() {
  const barberia = useBarberia();

  if (!barberia || !barberia.galeria?.length) return null;

  return (
    <section className="cuts">
      <div className="cuts-content">
        <div className="cuts-grid">
          {barberia.galeria.map((item, index) => (
            <div className="cut-card" key={index}>
              {item.tipo === "video" ? (
                <video src={item.url} autoPlay muted loop playsInline />
              ) : (
                <img
                  src={item.url}
                  alt={item.titulo || `Galería ${index + 1}`}
                />
              )}
              <span>{item.titulo || `Corte ${index + 1}`}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
