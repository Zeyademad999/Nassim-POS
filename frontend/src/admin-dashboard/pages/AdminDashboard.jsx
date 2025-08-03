import React from "react";
import { Outlet } from "react-router-dom";
import { Languages } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useLanguage } from "../../context/LanguageContext";
import { useAutoTranslation } from "../../../utils/AutoTranslator";
import "./styles/AdminDashboard.css";

export default function AdminDashboard({ user, onLogout }) {
  const { language, toggleLanguage, isRTL } = useLanguage();

  // Add auto-translation
  useAutoTranslation();

  return (
    <div className={`admin-dashboard ${isRTL ? "rtl" : "ltr"}`}>
      <Sidebar user={user} onLogout={onLogout} />
      <div className="admin-content">
        {/* Language Toggle Button */}
       
        <Outlet /> {/* This will render the active nested route's element */}
      </div>
    </div>
  );
}
