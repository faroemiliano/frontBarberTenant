import GoogleLoginButton from "./GoogleLoginButton";
import { useBarberia } from "../../BarberiaContext";
import bgLogin from "../assets/logoTitulo2.png";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function Login({ onSuccess, onClose }: Props) {
  const barberia = useBarberia();

  return (
    <div className="auth-modal">
      <div
        className="auth-modal-box"
        style={{ backgroundImage: `url(${bgLogin})` }}
      >
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-box">
          <p className="auth-subtitle">
            Reservá tu turno en <strong>{barberia?.nombre || "..."}</strong>
          </p>

          <GoogleLoginButton onSuccess={onSuccess} />

          <p className="auth-footer">Acceso seguro con Google</p>
        </div>
      </div>
    </div>
  );
}
