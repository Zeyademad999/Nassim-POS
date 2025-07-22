import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./styles/AdminLayout.css";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Barbers", path: "/admin/barbers" },
  { label: "Services", path: "/admin/services" },
  { label: "Receipts", path: "/admin/receipts" },
  { label: "Reports", path: "/admin/reports" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2>Nassim Admin</h2>
        <nav>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
