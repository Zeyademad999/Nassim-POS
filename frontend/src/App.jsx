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
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    window.location.href = "/";
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
                <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
                  {/* Accountant Header */}
                  <header
                    style={{
                      background: "white",
                      padding: "16px 24px",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: "24px",
                          fontWeight: "600",
                        }}
                      >
                        Financial Reports
                      </h1>
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "14px",
                        }}
                      >
                        Invoice-based financial analysis
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>
                        Welcome, {user.full_name || user.username} (Accountant)
                      </span>
                      <button
                        onClick={handleLogout}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </header>

                  {/* Reports Content */}
                  <div style={{ padding: "24px" }}>
                    <Reports user={user} />
                  </div>
                </div>
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
