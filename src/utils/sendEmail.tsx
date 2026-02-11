import emailjs from "emailjs-com";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export function enviarMailConfirmacion({
  nombre,
  email,
  fecha,
  hora,
}: {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
}) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error("❌ EmailJS env no configurado");
    return Promise.reject("Email config missing");
  }

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      nombre,
      email,
      fecha,
      hora,
    },
    PUBLIC_KEY,
  );
}
