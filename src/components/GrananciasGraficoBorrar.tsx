// import { useEffect, useState } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { getToken } from "../auth";
// import { onGananciasUpdate } from "../events/gananciasEvents";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// interface GananciaServicio {
//   servicio: string;
//   total: number;
// }

// /* =====================
//    MODAL TOTAL MES
// ===================== */

// function ModalMesTotal({
//   total,
//   onClose,
// }: {
//   total: number;
//   onClose: () => void;
// }) {
//   return (
//     <div className="modal-overlay">
//       <div className="modal-box">
//         <h3>Total del mes</h3>

//         <p style={{ fontSize: 26, fontWeight: "bold", margin: "20px 0" }}>
//           ${total.toLocaleString("es-AR")}
//         </p>

//         <button className="btn-secondary" onClick={onClose}>
//           Cerrar
//         </button>
//       </div>
//     </div>
//   );
// }

// /* =====================
//    GRAFICO
// ===================== */

// export default function GananciasGrafico({
//   tipo,
//   fecha,
// }: {
//   tipo: "dia" | "semana" | "mes";
//   fecha?: string;
// }) {
//   const [data, setData] = useState<GananciaServicio[]>([]);
//   const [modalMesOpen, setModalMesOpen] = useState(false);

//   const cargarDatos = async () => {
//     let url = `http://127.0.0.1:8000/admin/ganancias/grafico?tipo=${tipo}`;

//     if (tipo === "dia" && fecha) {
//       url += `&fecha=${fecha}`;
//     }

//     const res = await fetch(url, {
//       headers: {
//         Authorization: `Bearer ${getToken()}`,
//       },
//     });

//     const json: GananciaServicio[] = await res.json();
//     setData(json);
//   };

//   useEffect(() => {
//     cargarDatos();

//     const unsubscribe = onGananciasUpdate(() => {
//       cargarDatos();
//     });

//     return () => unsubscribe();
//   }, [tipo, fecha]);

//   const totalMes = data.reduce((acc, item) => acc + item.total, 0);

//   return (
//     <>
//       <div style={{ width: "100%", height: 300 }}>
//         <ResponsiveContainer>
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="total"
//               nameKey="servicio"
//               cx="50%"
//               cy="50%"
//               outerRadius={100}
//               label={(entry: any) =>
//                 `${entry.servicio}: $${entry.total.toLocaleString("es-AR")}`
//               }
//               onClick={() => {
//                 if (tipo === "mes") {
//                   setModalMesOpen(true);
//                 }
//               }}
//             >
//               {data.map((_, index) => (
//                 <Cell key={index} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>

//             <Tooltip
//               formatter={(value: any) =>
//                 `$${Number(value ?? 0).toLocaleString("es-AR")}`
//               }
//             />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* MODAL TOTAL MES */}
//       {tipo === "mes" && modalMesOpen && (
//         <ModalMesTotal
//           total={totalMes}
//           onClose={() => setModalMesOpen(false)}
//         />
//       )}
//     </>
//   );
// }
