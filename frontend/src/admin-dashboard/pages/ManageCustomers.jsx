import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Users,
  UserPlus,
  Phone,
  Mail,
  Star,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Eye,
  User,
  Clock,
  DollarSign,
} from "lucide-react";
import CustomerForm from "../components/CustomerForm";
import BookingForm from "../components/BookingForm";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/ManageCustomers.css";

export default function ManageCustomers() {
  const { t, isRTL } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [stats, setStats] = useState(null);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        sortBy,
        order: sortOrder,
        limit: 100,
      });

      const res = await fetch(`/api/customers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();

      // Debug log to see the API response structure
      console.log("API Response:", data);

      // Handle different possible response structures
      if (Array.isArray(data)) {
        // If data is directly an array
        setCustomers(data);
      } else if (data.customers && Array.isArray(data.customers)) {
        // If data has a customers property that's an array
        setCustomers(data.customers);
      } else if (data.data && Array.isArray(data.data)) {
        // If data has a data property that's an array
        setCustomers(data.data);
      } else {
        // Fallback to empty array if structure is unexpected
        console.warn("Unexpected API response structure:", data);
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers");
      setCustomers([]); // Ensure customers is always an array
    }
  };
  const fetchBarbers = async () => {
    try {
      const res = await fetch("/api/barbers");
      if (!res.ok) throw new Error("Failed to fetch barbers");
      const data = await res.json();
      setBarbers(data);
    } catch (err) {
      console.error("Failed to fetch barbers:", err);
      setBarbers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/customers/stats/summary");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchBarbers();
    fetchStats();
  }, [searchTerm, sortBy, sortOrder]);

  const handleAddCustomer = async (customerData) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add customer");
      }

      setShowAddCustomer(false);
      fetchCustomers();
      fetchStats();
    } catch (err) {
      console.error("Error adding customer:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (id, customerData) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update customer");
      }

      setEditingCustomer(null);
      fetchCustomers();
      fetchStats();
    } catch (err) {
      console.error("Error updating customer:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!confirm(t("deleteCustomerConfirm"))) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete customer");
      }

      fetchCustomers();
      fetchStats();
    } catch (err) {
      console.error("Error deleting customer:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleViewCustomer function in your ManageCustomers.jsx

  const handleViewCustomer = async (customer) => {
    setLoading(true);
    try {
      // Fetch detailed customer data including transactions and bookings
      const [customerRes, transactionsRes, bookingsRes] = await Promise.all([
        fetch(`/api/customers/${customer.id}`),
        fetch(
          `/api/transactions?customer_id=${customer.id}&limit=20&order=DESC`
        ), // Get more recent transactions
        fetch(`/api/bookings?customer_id=${customer.id}&limit=20&order=DESC`), // Get customer-specific bookings
      ]);

      const customerData = customerRes.ok ? await customerRes.json() : customer;
      const transactions = transactionsRes.ok
        ? await transactionsRes.json()
        : [];
      const allBookings = bookingsRes.ok ? await bookingsRes.json() : [];

      // Separate upcoming and past bookings
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();

      const upcomingBookings = allBookings
        .filter((booking) => {
          const bookingDate = booking.booking_date;
          const bookingDateTime = new Date(
            `${bookingDate}T${booking.booking_time}`
          );
          return (
            bookingDate >= today &&
            bookingDateTime > now &&
            booking.status !== "cancelled"
          );
        })
        .sort((a, b) => {
          // Sort by date and time
          const dateA = new Date(`${a.booking_date}T${a.booking_time}`);
          const dateB = new Date(`${b.booking_date}T${b.booking_time}`);
          return dateA - dateB;
        });

      const recentBookings = allBookings
        .filter((booking) => {
          const bookingDate = booking.booking_date;
          const bookingDateTime = new Date(`${bookingDate}T${bookingDate}`);
          return (
            bookingDate < today ||
            booking.status === "completed" ||
            booking.status === "cancelled"
          );
        })
        .sort((a, b) => {
          // Sort by date descending (most recent first)
          const dateA = new Date(`${a.booking_date}T${a.booking_time}`);
          const dateB = new Date(`${b.booking_date}T${b.booking_time}`);
          return dateB - dateA;
        })
        .slice(0, 10); // Limit to 10 most recent

      console.log("Customer transactions:", transactions);
      console.log("Upcoming bookings:", upcomingBookings);
      console.log("Recent bookings:", recentBookings);

      setViewingCustomer({
        ...customerData,
        transactions: Array.isArray(transactions) ? transactions : [],
        upcomingBookings,
        recentBookings,
        allBookings,
      });
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      setViewingCustomer({
        ...customer,
        transactions: [],
        upcomingBookings: [],
        recentBookings: [],
        allBookings: [],
      });
    } finally {
      setLoading(false);
    }
  };
  const generateReceiptHTML = (transaction) => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const services = transaction.services || [];
    const products = transaction.products || [];
    const subtotal =
      services.reduce((sum, s) => sum + s.price * s.quantity, 0) +
      products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const discountAmount = transaction.discount_amount || 0;
    const taxAmount = transaction.tax || (subtotal - discountAmount) * 0.08;
    const finalTotal =
      transaction.total || subtotal - discountAmount + taxAmount;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${transaction.id.substring(0, 8)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @media screen {
      body { 
        font-family: 'Arial', sans-serif; 
        width: 80mm; 
        padding: 10px; 
        background: white;
        color: #333;
        margin: 20px auto;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
    }
    
    @media print {
      body { 
        font-family: 'Arial', sans-serif; 
        width: 58mm; 
        padding: 2mm; 
        background: white;
        color: #000;
        margin: 0;
        border: none;
      }
      
      @page {
        size: 58mm auto;
        margin: 0;
      }
    }
    
    .header { 
      text-align: center; 
      border-bottom: 2px solid #000; 
      padding-bottom: 8px; 
      margin-bottom: 12px; 
    }
    
    .shop-name { 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    
    .shop-subtitle {
      font-size: 11px;
      color: #666;
      margin-bottom: 6px;
    }
    
    .receipt-id { 
      font-size: 10px; 
      margin-top: 4px; 
      color: #666;
    }
    
    .section { 
      margin: 8px 0; 
    }
    
    .row { 
      display: flex; 
      justify-content: space-between; 
      margin: 2px 0; 
      font-size: 12px;
    }
    
    .items-section {
      margin: 12px 0;
    }
    
    .item-header {
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3px;
      margin-bottom: 4px;
      font-size: 11px;
      text-transform: uppercase;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
      font-size: 11px;
      line-height: 1.3;
    }
    
    .item-name {
      flex: 1;
      margin-right: 8px;
    }
    
    .item-price {
      font-weight: 600;
      white-space: nowrap;
    }
    
    .total-section { 
      border-top: 2px solid #000; 
      font-weight: bold; 
      margin-top: 12px; 
      padding-top: 6px; 
    }
    
    .total-row { 
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: bold;
    }
    
    .footer { 
      text-align: center; 
      margin-top: 15px; 
      font-size: 9px; 
      color: #666;
      border-top: 1px dashed #ccc;
      padding-top: 8px;
    }
    
    .date-info {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .customer-info {
      font-size: 11px;
      margin: 6px 0;
      text-align: center;
    }
    
    .barber-info {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .payment-info {
      font-size: 10px;
      text-align: center;
      margin: 6px 0;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">NASSIM SELECT</div>
    <div class="shop-subtitle">صالون نسيم سيليكت</div>
    <div class="shop-subtitle">Premium Grooming Services</div>
    <div class="receipt-id">Receipt: ${transaction.id.substring(0, 8)}</div>
  </div>
  
  <div class="date-info">
    ${formatDate(transaction.created_at)}
  </div>
  
  <div class="customer-info">
    <strong>Customer:</strong> ${
      transaction.customer_name || "Walk-in Customer"
    }
  </div>
  
  <div class="barber-info">
    Served by: ${transaction.barber_name || "Staff"}
  </div>

  ${
    services.length > 0
      ? `
  <div class="items-section">
    <div class="item-header">SERVICES</div>
    ${services
      .map(
        (service) => `
    <div class="item-row">
      <div class="item-name">${service.name}${
          service.quantity > 1 ? ` x${service.quantity}` : ""
        }</div>
      <div class="item-price">${(service.price * service.quantity).toFixed(
        2
      )} EGP</div>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    products.length > 0
      ? `
  <div class="items-section">
    <div class="item-header">PRODUCTS</div>
    ${products
      .map(
        (product) => `
    <div class="item-row">
      <div class="item-name">${product.name}${
          product.quantity > 1 ? ` x${product.quantity}` : ""
        }</div>
      <div class="item-price">${(product.price * product.quantity).toFixed(
        2
      )} EGP</div>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="section">
    <div class="row">
      <span>Subtotal:</span>
      <span>${subtotal.toFixed(2)} EGP</span>
    </div>
    ${
      discountAmount > 0
        ? `
    <div class="row" style="color: #059669;">
      <span>Discount:</span>
      <span>-${discountAmount.toFixed(2)} EGP</span>
    </div>
    `
        : ""
    }
    <div class="row">
      <span>Tax (8%):</span>
      <span>${taxAmount.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="total-section">
    <div class="total-row">
      <span>TOTAL:</span>
      <span>${finalTotal.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="payment-info">
    Payment: ${(transaction.payment_method || "cash").toUpperCase()}
  </div>

  <div class="footer">
    Thank you for visiting Nassim Select!<br>
    We appreciate your business<br>
    --------------------------------<br>
    Floki Systems © ${new Date().getFullYear()}
  </div>
</body>
</html>
  `;
  };

  const downloadTransactionReceipt = (transaction) => {
    const receiptContent = generateReceiptHTML(transaction);
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${transaction.id.substring(0, 8)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printTransactionReceipt = (transaction) => {
    const printWindow = window.open("", "_blank");
    const receiptHTML = generateReceiptHTML(transaction);

    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleCreateBooking = (customer) => {
    setSelectedCustomer(customer);
    setShowBookingForm(true);
  };

  const handleBookingCreated = () => {
    setShowBookingForm(false);
    setSelectedCustomer(null);
    // Optionally refresh customer data to update visit counts
    fetchCustomers();
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getBarberName = (barberId) => {
    const barber = barbers.find((b) => b.id === barberId);
    return barber ? barber.name : t("noPreference");
  };

  return (
    <div className={`manage-customers-page ${isRTL ? "rtl" : "ltr"}`}>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}
      {/* Header Section */}
      <div className="customers-header">
        <div className="header-left">
          <h1>
            <Users size={24} />
            {t("customerManagement")}
          </h1>
          <p className="subtext">{t("manageCustomersSubtext")}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddCustomer(true)}
        >
          <UserPlus size={16} />
          {t("addCustomer")}
        </button>
      </div>
      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.total_customers}</h3>
              <p>{t("totalCustomers")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <User size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.active_customers}</h3>
              <p>{t("activeCustomers")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.avg_customer_spend?.toFixed(0)} EGP</h3>
              <p>{t("avgCustomerSpend")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon preferences">
              <Star size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.customers_with_preferences}</h3>
              <p>{t("withPreferences")}</p>
            </div>
          </div>
        </div>
      )}
      {/* Search and Filter Section */}
      <div className="customers-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder={t("searchCustomers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-section">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="name-ASC">{t("nameAZ")}</option>
            <option value="name-DESC">{t("nameZA")}</option>
            <option value="total_visits-DESC">{t("mostVisits")}</option>
            <option value="total_spent-DESC">{t("highestSpender")}</option>
            <option value="created_at-DESC">{t("newestFirst")}</option>
            <option value="last_visit-DESC">{t("recentVisit")}</option>
          </select>
        </div>
      </div>
      {/* Customers Grid */}
      <div className="customers-grid">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-avatar">
                {getInitials(customer.name)}
              </div>
              <div className="customer-basic-info">
                <h3 className="customer-name">
                  {customer.name}
                  {customer.total_visits > 0 && (
                    <span className="customer-source pos">POS</span>
                  )}
                </h3>
                <div className="customer-contact">
                  <Phone size={14} />
                  <span>{customer.mobile}</span>
                </div>
                {customer.email && (
                  <div className="customer-contact">
                    <Mail size={14} />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>
              <div className="customer-actions">
                <button
                  className="action-btn"
                  onClick={() => handleViewCustomer(customer)}
                  title={t("viewDetails")}
                >
                  <Eye size={14} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => setEditingCustomer(customer)}
                  title={t("editCustomer")}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="action-btn danger"
                  onClick={() => handleDeleteCustomer(customer.id)}
                  title={t("deleteCustomer")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="customer-details">
              {customer.preferred_barber_name && (
                <div className="customer-preference">
                  <Star size={14} />
                  <span>
                    {t("prefers")}: {customer.preferred_barber_name}
                  </span>
                </div>
              )}

              <div className="customer-stats">
                <div className="stat-item">
                  <Clock size={14} />
                  <span>
                    {customer.total_visits} {t("visits")}
                  </span>
                </div>
                <div className="stat-item">
                  <DollarSign size={14} />
                  <span>{customer.total_spent?.toFixed(0)} EGP</span>
                </div>
              </div>

              {customer.service_preferences && (
                <div className="customer-notes">
                  <p>
                    <strong>{t("preferences")}:</strong>{" "}
                    {customer.service_preferences}
                  </p>
                </div>
              )}

              {customer.notes && (
                <div className="customer-notes">
                  <p>
                    <strong>{t("notes")}:</strong> {customer.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="customer-footer">
              {customer.last_visit && (
                <span className="last-visit">
                  {t("lastVisit")}:{" "}
                  {new Date(customer.last_visit).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {customers.length === 0 && !loading && (
        <div className="empty-state">
          <Users size={48} />
          <h3>{t("noCustomersFound")}</h3>
          <p>{searchTerm ? t("tryAdjustingSearch") : t("addFirstCustomer")}</p>
          {!searchTerm && (
            <button
              className="btn-primary"
              onClick={() => setShowAddCustomer(true)}
            >
              <UserPlus size={16} />
              {t("addFirstCustomerBtn")}
            </button>
          )}
        </div>
      )}
      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t("addNewCustomer")}</h2>
              <button onClick={() => setShowAddCustomer(false)}>
                <X size={20} />
              </button>
            </div>
            <CustomerForm
              onSubmit={handleAddCustomer}
              onCancel={() => setShowAddCustomer(false)}
              barbers={barbers}
              loading={loading}
            />
          </div>
        </div>
      )}
      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t("editCustomer")}</h2>
              <button onClick={() => setEditingCustomer(null)}>
                <X size={20} />
              </button>
            </div>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={(data) =>
                handleUpdateCustomer(editingCustomer.id, data)
              }
              onCancel={() => setEditingCustomer(null)}
              barbers={barbers}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{t("customerDetails")}</h2>
              <button onClick={() => setViewingCustomer(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="customer-details-view">
              <div className="customer-profile">
                <div className="profile-avatar">
                  {getInitials(viewingCustomer.name)}
                </div>
                <div className="profile-info">
                  <h3>{viewingCustomer.name}</h3>
                  <p>{viewingCustomer.mobile}</p>
                  {viewingCustomer.email && <p>{viewingCustomer.email}</p>}
                  <div className="profile-stats">
                    <span>
                      {viewingCustomer.total_visits || 0} {t("visits")}
                    </span>
                    <span>
                      {(viewingCustomer.total_spent || 0).toFixed(0)} EGP{" "}
                      {t("spent")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences and Notes */}
              <div className="customer-info-section">
                <h4>{t("preferencesAndNotes")}</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>{t("preferredBarber")}:</label>
                    <span>
                      {viewingCustomer.preferred_barber_name ||
                        t("noPreference")}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>{t("servicePreferences")}:</label>
                    <span>
                      {viewingCustomer.service_preferences ||
                        t("noneSpecified")}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>{t("notes")}:</label>
                    <span>{viewingCustomer.notes || t("noNotes")}</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <div className="customer-info-section">
                <h4>
                  <Calendar size={16} />
                  Upcoming Appointments
                  {viewingCustomer.upcomingBookings &&
                    viewingCustomer.upcomingBookings.length > 0 && (
                      <span className="count-badge">
                        {viewingCustomer.upcomingBookings.length}
                      </span>
                    )}
                </h4>
                {viewingCustomer.upcomingBookings &&
                viewingCustomer.upcomingBookings.length > 0 ? (
                  <div className="bookings-list upcoming">
                    {viewingCustomer.upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="booking-item upcoming-booking"
                      >
                        <div className="booking-date-time">
                          <div className="booking-date">
                            {new Date(booking.booking_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="booking-time">
                            {booking.booking_time}
                          </div>
                        </div>
                        <div className="booking-details">
                          <div className="barber-service-info">
                            <span className="barber-name">
                              <User size={14} />
                              {booking.barber_name || "No barber assigned"}
                            </span>
                            {booking.services &&
                              booking.services.length > 0 && (
                                <div className="services-preview">
                                  {booking.services
                                    .map((service) => service.name)
                                    .join(", ")}
                                </div>
                              )}
                          </div>
                          <span className={`booking-status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.estimated_cost && (
                          <div className="booking-cost">
                            {booking.estimated_cost.toFixed(0)} EGP
                          </div>
                        )}
                        {booking.notes && (
                          <div className="booking-notes">
                            <small>{booking.notes}</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <Calendar size={24} />
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </div>

              {/* Recent Bookings History */}
              {viewingCustomer.recentBookings &&
                viewingCustomer.recentBookings.length > 0 && (
                  <div className="customer-info-section">
                    <h4>
                      <Clock size={16} />
                      Recent Appointments (
                      {viewingCustomer.recentBookings.length})
                    </h4>
                    <div className="bookings-list recent">
                      {viewingCustomer.recentBookings
                        .slice(0, 5)
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="booking-item recent-booking"
                          >
                            <div className="booking-date-time">
                              <div className="booking-date">
                                {new Date(
                                  booking.booking_date
                                ).toLocaleDateString()}
                              </div>
                              <div className="booking-time">
                                {booking.booking_time}
                              </div>
                            </div>
                            <div className="booking-details">
                              <span className="barber-name">
                                {booking.barber_name || "No barber"}
                              </span>
                              <span
                                className={`booking-status ${booking.status}`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            {booking.estimated_cost && (
                              <div className="booking-cost">
                                {booking.estimated_cost.toFixed(0)} EGP
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Transaction History */}
              <div className="customer-info-section">
                <h4>
                  <DollarSign size={16} />
                  Recent Transactions
                  {viewingCustomer.transactions &&
                    viewingCustomer.transactions.length > 0 && (
                      <span className="count-badge">
                        {viewingCustomer.transactions.length}
                      </span>
                    )}
                </h4>
                {viewingCustomer.transactions &&
                viewingCustomer.transactions.length > 0 ? (
                  <div className="transactions-list">
                    {viewingCustomer.transactions
                      .slice(0, 10)
                      .map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                          <div className="transaction-date-time">
                            <div className="transaction-date">
                              {new Date(
                                transaction.created_at
                              ).toLocaleDateString()}
                            </div>
                            <div className="transaction-time">
                              {new Date(
                                transaction.created_at
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <div className="transaction-details">
                            <div className="transaction-info">
                              <span className="barber-name">
                                <User size={12} />
                                {transaction.barber_name || "No Barber"}
                              </span>
                              <span className="payment-method">
                                {(
                                  transaction.payment_method || "cash"
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div className="transaction-items">
                              {transaction.services &&
                                transaction.services.length > 0 && (
                                  <small className="item-count services">
                                    {transaction.services.length} service(s)
                                  </small>
                                )}
                              {transaction.products &&
                                transaction.products.length > 0 && (
                                  <small className="item-count products">
                                    {transaction.products.length} product(s)
                                  </small>
                                )}
                              {(!transaction.services ||
                                transaction.services.length === 0) &&
                                (!transaction.products ||
                                  transaction.products.length === 0) && (
                                  <small className="item-count">
                                    No items specified
                                  </small>
                                )}
                            </div>
                          </div>
                          <div className="transaction-amount">
                            <span className="amount">
                              {(transaction.total || 0).toFixed(2)} EGP
                            </span>
                            {transaction.discount_amount > 0 && (
                              <small className="discount">
                                (-{transaction.discount_amount.toFixed(2)} EGP
                                discount)
                              </small>
                            )}
                          </div>
                          <div className="transaction-actions">
                            <button
                              className="action-btn"
                              onClick={() =>
                                downloadTransactionReceipt(transaction)
                              }
                              title="Download Receipt"
                            >
                              📥
                            </button>
                            <button
                              className="action-btn"
                              onClick={() =>
                                printTransactionReceipt(transaction)
                              }
                              title="Print Receipt"
                            >
                              🖨️
                            </button>
                          </div>
                        </div>
                      ))}
                    {viewingCustomer.transactions.length > 10 && (
                      <div className="view-more">
                        <small>
                          Showing 10 of {viewingCustomer.transactions.length}{" "}
                          transactions
                        </small>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <DollarSign size={24} />
                    <p>No transaction history</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="customer-actions-section">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingCustomer(viewingCustomer);
                    setViewingCustomer(null);
                  }}
                >
                  <Edit2 size={16} />
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Booking Form Modal */}
      {showBookingForm && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {t("bookAppointmentFor")} {selectedCustomer.name}
              </h2>
              <button onClick={() => setShowBookingForm(false)}>
                <X size={20} />
              </button>
            </div>
            <BookingForm
              customer={selectedCustomer}
              onSubmit={handleBookingCreated}
              onCancel={() => setShowBookingForm(false)}
              barbers={barbers}
            />
          </div>
        </div>
      )}
    </div>
  );
}
