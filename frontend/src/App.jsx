import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import POS from "./pages/POS";
import Login from "../src/admin-dashboard/pages/Login";
import AdminRoutes from "../src/admin-dashboard/AdminRoutes";
import { POSProvider } from "./context/POSContext";

export default function App() {
  return (
    <POSProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </POSProvider>
  );
}
