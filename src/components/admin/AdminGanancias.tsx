import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getToken } from "../../auth";

/* =====================
   TIPOS
===================== */

interface GananciaServicio {
  servicio: string;
  total: number;
}

interface DetalleTurno {
  nombre: string;
  servicio: string;
  precio: number;
}

/* =====================
   UTILIDADES FECHA
===================== */

function fechaLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoToDMY(fecha: string) {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

/* =====================
   MODAL DETALLE
===================== */

function ModalTotalMes({
  total,
  onClose,
}: {
  total: number;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Total del mes</h3>

        <p style={{ fontSize: 28, fontWeight: "bold", margin: "20px 0" }}>
          ${total.toLocaleString("es-AR")}
        </p>

        <button className="btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

/* =====================
   MODAL DETALLE
===================== */

function ModalDetalle({
  fecha,
  onClose,
}: {
  fecha: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<DetalleTurno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/admin/ganancias/detalle?fecha=${fecha}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [fecha]);

  return (
    <div className="modal-overlay">
      <div className="modal-box large">
        <h3>Detalle — {isoToDMY(fecha)}</h3>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="admin-servicios-scroll">
            <table className="admin-table-servicios">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t, i) => (
                  <tr key={i}>
                    <td>{t.nombre}</td>
                    <td>{t.servicio}</td>
                    <td>${t.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================
   GRAFICO PIE
===================== */

function GraficoPie({ tipo }: { tipo: "dia" | "mes" }) {
  const [data, setData] = useState<GananciaServicio[]>([]);
  const [fecha, setFecha] = useState(fechaLocalISO());

  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalMesOpen, setModalMesOpen] = useState(false);

  const [servicioSel, setServicioSel] = useState<string | null>(null);

  const cargarDatos = async () => {
    let url = `http://127.0.0.1:8000/admin/ganancias/grafico?tipo=${tipo}`;
    if (tipo === "dia") url += `&fecha=${fecha}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    setData(await res.json());
  };

  useEffect(() => {
    cargarDatos();
  }, [tipo, fecha]);

  const moverDia = (delta: number) => {
    const [y, m, d] = fecha.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    setFecha(fechaLocalISO(date));
  };

  const totalMes = data.reduce((acc, i) => acc + i.total, 0);

  return (
    <div style={{ width: "48%", padding: 10 }}>
      <h3 style={{ textAlign: "center" }}>{tipo}</h3>

      {tipo === "dia" && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <button onClick={() => moverDia(-1)}>◀</button>
          <span style={{ margin: "0 10px" }}>{isoToDMY(fecha)}</span>
          <button onClick={() => moverDia(1)}>▶</button>
        </div>
      )}

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="servicio"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(e: any) =>
                `${e.servicio}: $${e.total.toLocaleString("es-AR")}`
              }
              onClick={(e: any) => {
                if (tipo === "dia") {
                  setModalDetalleOpen(true);
                }
                if (tipo === "mes") {
                  setModalMesOpen(true);
                }
              }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* MODAL DIA */}
      {modalDetalleOpen && (
        <ModalDetalle
          fecha={fecha}
          onClose={() => setModalDetalleOpen(false)}
        />
      )}

      {/* MODAL MES */}
      {modalMesOpen && tipo === "mes" && (
        <ModalTotalMes
          total={totalMes}
          onClose={() => setModalMesOpen(false)}
        />
      )}
    </div>
  );
}

/* =====================
   COMPONENTE PRINCIPAL
===================== */

export default function AdminGanancias() {
  return (
    <div className="admin-card">
      <h2>Ganancias</h2>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <GraficoPie tipo="dia" />
        <GraficoPie tipo="mes" />
      </div>
    </div>
  );
}
