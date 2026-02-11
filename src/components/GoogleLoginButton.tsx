import { GoogleLogin } from "@react-oauth/google";
import { saveSession } from "../auth";

export default function GoogleLoginButton({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  return (
    <GoogleLogin
      onSuccess={async (res) => {
        const credential = res.credential;
        if (!credential) return;

        const r = await fetch("http://127.0.0.1:8000/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        const data = await r.json();
        if (!r.ok) return;

        saveSession(data.access_token, data.user);
        onSuccess();
      }}
      onError={() => {
        console.log("Login con Google falló");
      }}
    />
  );
}
