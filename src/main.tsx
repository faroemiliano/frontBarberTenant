import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>,
);
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log("ENV:", import.meta.env);
console.log("CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
