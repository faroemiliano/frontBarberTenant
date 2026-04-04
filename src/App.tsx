import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Modal from "./components/Modal/Modal";
import { getUser, logout } from "./auth";

// 🔥 Lazy loaded pages/components
const Hero = lazy(() => import("./components/Hero/Hero"));
const Login = lazy(() => import("./components/Login/Login"));
const CutsGallery = lazy(() => import("./components/CutsGallery/CutsGallery"));
const Footer = lazy(() => import("./components/Footer/Footer"));
const SuperAdminPanel = lazy(() => import("./components/SuperAdmin"));
const AdminPanel = lazy(() => import("./components/admin/AdminPanel"));
const AdminTurnos = lazy(() => import("./components/admin/AdminTurnos"));
const AdminGanancias = lazy(() => import("./components/admin/AdminGanancias"));
const AdminServicios = lazy(() => import("./components/admin/AdminServicios"));
const BarberoPanel = lazy(() => import("./components/barbero/BarberoPanel"));
const AdminUsuarios = lazy(() => import("./components/admin/AdminUsuarios"));
const BookingUser = lazy(() => import("./components/BookingUser/BookingUser"));
import "./styles.css";
import { BarberiaProvider } from "../BarberiaContext";
import GoogleLoginButton from "./components/GoogleLoginButton";
import "./components/Hero/Hero.css";

function Loader() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
      }}
    >
      Cargando...
    </div>
  );
}

function RutasInternas({ user, setShowLogin }: any) {
  const { barberia } = useParams(); // 🔥 ESTE ES EL SLUG
  useEffect(() => {
    if (barberia) {
      localStorage.setItem("barberia_slug", barberia);
      console.log("🔥 guardando slug:", barberia);
    }
  }, [barberia]);
  return (
    <Routes>
      {/* HOME */}
      <Route
        path="/"
        element={
          user?.rol === "admin" ? (
            <Navigate to={`/${barberia}/admin`} />
          ) : user?.rol === "barbero" ? (
            <Navigate to={`/${barberia}/barbero`} />
          ) : (
            <>
              <Hero user={user} onLogin={() => setShowLogin(true)} />
              <div className="hero-divider" />
              <CutsGallery />
              <div className="hero-divider" />
              <Footer />
            </>
          )
        }
      />
      <Route path="reservar" element={<BookingUser onClose={() => {}} />} />

      {/* ADMIN */}
      <Route
        path="admin"
        element={
          user?.rol === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to={`/${barberia}`} />
          )
        }
      >
        <Route index element={<Navigate to="turnos" />} />
        <Route path="turnos" element={<AdminTurnos />} />
        <Route path="ganancias" element={<AdminGanancias />} />
        <Route path="servicios" element={<AdminServicios />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
      </Route>

      {/* BARBERO */}
      <Route
        path="barbero"
        element={
          user?.rol === "barbero" ? (
            <BarberoPanel userId={user!.id} />
          ) : (
            <Navigate to={`/${barberia}`} />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(getUser());
  const [showLogin, setShowLogin] = useState(false);
  const { barberia } = useParams();

  /* 🔒 BLOQUEO SCROLL MODAL */
  useEffect(() => {
    document.body.classList.toggle("modal-open", showLogin);
    return () => document.body.classList.remove("modal-open");
  }, [showLogin]);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  console.log("Usuario actual:", user);
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* RUTA SUPERADMIN */}
          <Route
            path="/superadmin"
            element={
              user?.rol === "superadmin" ? (
                <SuperAdminPanel />
              ) : (
                <>
                  <h2>Login SuperAdmin</h2>
                  <GoogleLoginButton onSuccess={() => setUser(getUser())} />
                </>
              )
            }
          />

          {/* RUTAS DE BARBERÍAS */}
          <Route
            path="/:barberia/*"
            element={
              <BarberiaProvider>
                <Navbar
                  user={user}
                  onLogin={() => setShowLogin(true)}
                  onLogout={handleLogout}
                  barberiaSlug={barberia}
                />
                <div className="hero-divider" />
                <RutasInternas user={user} setShowLogin={setShowLogin} />
                {/* ================= LOGIN MODAL ================= */}
                {showLogin && (
                  <Modal onClose={() => setShowLogin(false)}>
                    <Suspense fallback={<Loader />}>
                      <Login
                        onSuccess={() => {
                          setUser(getUser());
                          setShowLogin(false);
                        }}
                        onClose={() => setShowLogin(false)}
                      />
                    </Suspense>
                  </Modal>
                )}
              </BarberiaProvider>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
