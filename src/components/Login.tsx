import GoogleLoginButton from "./GoogleLoginButton";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function Login({ onSuccess, onClose }: Props) {
  return (
    <div className="auth-modal">
      <div className="auth-modal-box">
        {/* ❌ BOTÓN CERRAR */}
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-box">
          <p className="auth-subtitle">
            Reservá tu turno en <strong>Barbería 1991</strong>
          </p>

          <GoogleLoginButton onSuccess={onSuccess} />

          <p className="auth-footer">Acceso seguro con Google</p>
        </div>
      </div>
    </div>
  );
}
