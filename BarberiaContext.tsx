import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "./src/api";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";

interface Barberia {
  id: number;
  slug: string;
  nombre: string;
}

const BarberiaContext = createContext<Barberia | null>(null);

export function BarberiaProvider({ children }: { children: ReactNode }) {
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const { barberia: slug } = useParams(); // ⚡ usar el nombre de la ruta

  useEffect(() => {
    if (!slug) return; // esperar a que slug exista

    apiFetch(`/barberias/${slug}`)
      .then((res) => res.json())
      .then(setBarberia)
      .catch(() => console.warn("⚠️ No se pudo cargar barbería"));
  }, [slug]);

  return (
    <BarberiaContext.Provider value={barberia}>
      {children}
    </BarberiaContext.Provider>
  );
}

export function useBarberia() {
  return useContext(BarberiaContext);
}
