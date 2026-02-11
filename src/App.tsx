import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Hero from "./components/Hero";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import CutsGallery from "./components/CutsGallery";
import { getUser, logout } from "./auth";
import AdminPanel from "./components/admin/AdminPanel";
import AdminTurnos from "./components/admin/AdminTurnos";
import AdminGanancias from "./components/admin/AdminGanancias";
import Footer from "./components/Footer";

import "./styles.css";
import AdminServicios from "./components/admin/AdminServicios";

export default function App() {
  const [user, setUser] = useState(getUser());
  const [showLogin, setShowLogin] = useState(false);

  /* 🔒 BLOQUEO SCROLL MODAL */
  useEffect(() => {
    document.body.classList.toggle("modal-open", showLogin);
    return () => document.body.classList.remove("modal-open");
  }, [showLogin]);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <>
      <Navbar
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <Routes>
        {/* PUBLIC */}
        <Route
          path="/"
          element={
            user?.is_admin ? (
              <AdminPanel />
            ) : (
              <>
                <Hero user={user} onLogin={() => setShowLogin(true)} />
                <div className="hero-divider" />
                <CutsGallery />
                <Footer />
              </>
            )
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={user?.is_admin ? <AdminPanel /> : <Navigate to="/" />}
        >
          {/* 👉 cuando entrás a /admin */}
          <Route index element={<Navigate to="turnos" />} />
          <Route path="turnos" element={<AdminTurnos />} />
          <Route path="ganancias" element={<AdminGanancias />} />
          <Route path="servicios" element={<AdminServicios />} /> {/* 🆕 */}
        </Route>
      </Routes>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <Login
            onSuccess={() => {
              setUser(getUser());
              setShowLogin(false);
            }}
            onClose={() => setShowLogin(false)}
          />
        </Modal>
      )}
    </>
  );
}
