import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "./src/api";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";

interface GaleriaItem {
  tipo: "video" | "foto";
  url: string;
  titulo?: string;
}

interface Barberia {
  id: number;
  slug: string;
  nombre: string;
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
  fondo?: string;
  footer?: string;
  instagram?: string;
  whatsapp?: string;
  ubicacion?: string;
  horarios?: string;
  galeria?: GaleriaItem[];
  fondo_color: string;
}

const BarberiaContext = createContext<Barberia | null>(null);

export function BarberiaProvider({ children }: { children: ReactNode }) {
  const [barberia, setBarberia] = useState<Barberia | null>(null);
  const { barberia: slug } = useParams();

  useEffect(() => {
    if (!slug) return;

    apiFetch(`/barberias/${slug}/config`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 RESPONSE COMPLETO:", data);
        console.log("🔥 LOGO_URL:", data.logo_url);
        console.log("🔥 Datos que llegan del backend:", data); // <--- esto
        setBarberia({
          ...data,
          logo: data.logo_url, // 👈 SOLO ESTO agregás
          galeria: data.galeria || [],
        });
      })
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
