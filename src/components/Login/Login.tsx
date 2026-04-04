import { useBarberia } from "../../../BarberiaContext";
import bgLogin from "../../assets/logoTitulo2.png";
import GoogleLoginButton from "../GoogleLoginButton";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function Login({ onSuccess }: Props) {
  const barberia = useBarberia();

  return (
    <div>
      <div
        className="auth-modal-box"
        style={{
          backgroundImage: `url(${barberia?.logo_url || bgLogin})`,
        }}
      >
        <div className="auth-box1">
          <p className="auth-subtitle">
            Reservá tu turno en <strong>{barberia?.nombre || "..."}</strong>
          </p>
          <div className="btn-google">
            <GoogleLoginButton onSuccess={onSuccess} />
          </div>

          <p className="auth-footer">Acceso seguro con Google</p>
        </div>
      </div>
    </div>
  );
}
