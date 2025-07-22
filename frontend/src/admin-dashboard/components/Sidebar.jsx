import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Users,
  UserPlus,
  Scissors,
  Package,
  Receipt,
  BarChart3,
  Calendar,
  DollarSign,
  Home,
} from "lucide-react";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const [expandedGroup, setExpandedGroup] = useState(null);
  const location = useLocation();

  const toggleGroup = (key) => {
    setExpandedGroup(expandedGroup === key ? null : key);
  };

  const menuItems = [
    {
      type: "group",
      title: "Customer Management",
      icon: Users,
      key: "customers",
      items: [
        { title: "Customer Management", path: "customers", icon: Users },
        { title: "Bookings & Appointments", path: "bookings", icon: Calendar },
      ],
    },
    {
      type: "group",
      title: "Staff Management",
      icon: UserPlus,
      key: "staff",
      items: [
        { title: "Manage Barbers", path: "barbers", icon: Scissors },
        { title: "Barber Profiles", path: "barber-profiles", icon: UserPlus },
      ],
    },
    {
      type: "single",
      title: "Manage Services",
      path: "services",
      icon: Scissors,
    },
    {
      type: "single",
      title: "Manage Products",
      path: "products",
      icon: Package,
    },
    {
      type: "single",
      title: "Expense Tracking",
      path: "expenses",
      icon: DollarSign,
    },
    {
      type: "single",
      title: "View Receipts",
      path: "receipts",
      icon: Receipt,
    },
    {
      type: "single",
      title: "Reports",
      path: "reports",
      icon: BarChart3,
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Home size={20} />
        <span className="brand-name">Nassim Barber Shop</span>
      </div>
      <nav className="navbar-menu">
        {menuItems.map((item) =>
          item.type === "group" ? (
            <div className="dropdown" key={item.key}>
              <button
                className={`dropdown-toggle ${
                  item.items.some((sub) =>
                    location.pathname.startsWith(sub.path)
                  )
                    ? "active"
                    : ""
                }`}
                onClick={() => toggleGroup(item.key)}
              >
                <item.icon size={16} />
                <span>{item.title}</span>
                <ChevronDown size={14} />
              </button>
              {expandedGroup === item.key && (
                <div className="dropdown-menu">
                  {item.items.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `dropdown-item ${isActive ? "active" : ""}`
                      }
                      onClick={() => setExpandedGroup(null)}
                    >
                      <sub.icon size={14} />
                      <span>{sub.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={16} />
              <span>{item.title}</span>
            </NavLink>
          )
        )}
      </nav>
    </header>
  );
}
