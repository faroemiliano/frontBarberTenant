export const GANANCIAS_UPDATE_EVENT = "ganancias:update";

/**
 * 🔥 Emitir evento (cuando editás precio, cancelás turno, etc)
 */
export function notifyGananciasUpdate() {
  window.dispatchEvent(new Event(GANANCIAS_UPDATE_EVENT));
}

/**
 * 👂 Escuchar evento (gráficos, modales, totales)
 */
export function onGananciasUpdate(callback: () => void) {
  window.addEventListener(GANANCIAS_UPDATE_EVENT, callback);

  return () => {
    window.removeEventListener(GANANCIAS_UPDATE_EVENT, callback);
  };
}
