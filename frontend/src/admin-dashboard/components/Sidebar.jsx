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
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/Sidebar.css";

export default function Sidebar({ user, onLogout }) {
  const { t, isRTL } = useLanguage();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleGroup = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false); // Auto-expand when clicking group
    }
    setExpandedGroup(expandedGroup === key ? null : key);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedGroup(null); // Close all groups when collapsing
    }
  };

  const menuItems = [
    {
      type: "group",
      title: t("Customer Management"),
      icon: Users,
      key: "customers",
      items: [
        { title: t("Customer Management"), path: "customers", icon: Users },
        {
          title: t("Bookings & Appointments"),
          path: "bookings",
          icon: Calendar,
        },
      ],
    },
    {
      type: "group",
      title: t("Staff Management"),
      icon: UserPlus,
      key: "staff",
      items: [
        { title: t("Manage Barbers"), path: "barbers", icon: Scissors },
        {
          title: t("Barber Profiles"),
          path: "barber-profiles",
          icon: UserPlus,
        },
      ],
    },
    {
      type: "single",
      title: t("Manage Services"),
      path: "services",
      icon: Scissors,
    },
    {
      type: "single",
      title: t("Manage Products"),
      path: "products",
      icon: Package,
    },
    {
      type: "single",
      title: t("Expense Tracking"),
      path: "expenses",
      icon: DollarSign,
    },
    {
      type: "single",
      title: t("View Receipts"),
      path: "receipts",
      icon: Receipt,
    },
    {
      type: "single",
      title: t("Reports"),
      path: "reports",
      icon: BarChart3,
    },
    {
      type: "single",
      title: t("Manage Users"),
      path: "users",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="brand">
          <Home size={24} />
          {!isCollapsed && (
            <span className="brand-name">{t("Nassim Admin")}</span>
          )}
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) =>
          item.type === "group" ? (
            <div className="nav-group" key={item.key}>
              <button
                className={`nav-group-toggle ${
                  item.items.some((sub) => location.pathname.includes(sub.path))
                    ? "active"
                    : ""
                }`}
                onClick={() => toggleGroup(item.key)}
                title={isCollapsed ? item.title : ""}
              >
                <item.icon size={20} />
                {!isCollapsed && (
                  <>
                    <span>{item.title}</span>
                    <ChevronDown
                      size={16}
                      className={`chevron ${
                        expandedGroup === item.key ? "rotated" : ""
                      }`}
                    />
                  </>
                )}
              </button>
              {!isCollapsed && expandedGroup === item.key && (
                <div className="nav-group-items">
                  {item.items.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                      }
                    >
                      <sub.icon size={18} />
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
                `nav-item ${isActive ? "active" : ""}`
              }
              title={isCollapsed ? item.title : ""}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* User Section */}
      <div className="sidebar-footer">
        <div className="user-section">
          <div className="user-avatar">
            {(user?.full_name || user?.username || "U").charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">
                {user?.full_name || user?.username}
              </span>
              <span className="user-role">{t(user?.role) || t("Admin")}</span>
            </div>
          )}
        </div>
        <button
          className="logout-btn"
          onClick={onLogout}
          title={isCollapsed ? t("Logout") : ""}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>{t("Logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
