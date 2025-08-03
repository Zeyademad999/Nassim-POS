import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBarbers from "./pages/ManageBarbers";
import ManageServices from "./pages/ManageServices";
import ViewReceipts from "./pages/ViewReceipts";
import Reports from "./pages/Reports";
import ManageProducts from "./pages/ManageProducts";
import ManageCustomers from "./pages/ManageCustomers";
import BookingManagement from "./pages/BookingManagement";
import ManageExpenses from "./pages/ManageExpenses";
import ManageUsers from "./pages/ManageUsers";
import ManageSchedule from "./pages/ManageSchedule";

export default function AdminRoutes({ user, onLogout }) {
  return (
    <Routes>
      <Route
        path="/"
        element={<AdminDashboard user={user} onLogout={onLogout} />}
      >
        <Route index element={<Reports user={user} />} />
        <Route path="barbers" element={<ManageBarbers />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="customers" element={<ManageCustomers />} />
        <Route path="/schedule" element={<ManageSchedule />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="expenses" element={<ManageExpenses />} />
        <Route path="receipts" element={<ViewReceipts />} />
        <Route path="reports" element={<Reports user={user} />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>
    </Routes>
  );
}
