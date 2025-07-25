import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard({ user, onLogout }) {
  return (
    <div className="admin-dashboard">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="admin-content">
        <Outlet /> {/* This will render the active nested route's element */}
      </div>
    </div>
  );
}
