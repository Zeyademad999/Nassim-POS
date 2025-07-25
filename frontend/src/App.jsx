import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import POS from "./pages/POS";
import Login from "../src/admin-dashboard/pages/Login";
import AdminRoutes from "../src/admin-dashboard/AdminRoutes";
import Reports from "../src/admin-dashboard/pages/Reports";
import { POSProvider } from "./context/POSContext";
import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageProvider>
      <POSProvider>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "admin"
                      ? "/admin"
                      : user.role === "accountant"
                      ? "/reports"
                      : "/pos"
                  }
                />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* POS - Cashier only */}
          <Route
            path="/pos"
            element={
              user && user.role === "cashier" ? (
                <POS onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Reports - Accountant only */}
          <Route
            path="/reports"
            element={
              user && user.role === "accountant" ? (
                <Reports user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Admin Dashboard - Admin only */}
          <Route
            path="/admin/*"
            element={
              user && user.role === "admin" ? (
                <AdminRoutes user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </POSProvider>
    </LanguageProvider>
  );
}
