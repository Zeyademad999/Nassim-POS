import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  User,
  Phone,
  Scissors,
  DollarSign,
  FileText,
  RefreshCcw,
  X, // Add this
} from "lucide-react";
import BookingForm from "../components/BookingForm";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/BookingManagement.css";

export default function BookingManagement() {
  const { t, isRTL } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  const [editingBooking, setEditingBooking] = useState(null);
  const [stats, setStats] = useState(null);

  const statusColors = {
    scheduled: { bg: "#dbeafe", color: "#1d4ed8", icon: Clock },
    confirmed: { bg: "#dcfce7", color: "#059669", icon: CheckCircle },
    completed: { bg: "#f3f4f6", color: "#374151", icon: CheckCircle },
    cancelled: { bg: "#fef2f2", color: "#dc2626", icon: XCircle },
  };

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
    fetchBarbers();
    fetchStats();
  }, [selectedDate, selectedBarber, selectedStatus]);
  // Check for new bookings every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkForNewBookings, 1200000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedBarber) params.append("barber_id", selectedBarber);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const res = await fetch(`/api/bookings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBookings = async () => {
    try {
      const params = new URLSearchParams();
      params.append("date", new Date().toISOString().split("T")[0]);
      params.append("status", "scheduled");

      const res = await fetch(`/api/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        const recentBookings = data.filter((booking) => {
          const createdAt = new Date(booking.created_at);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          return createdAt > fiveMinutesAgo;
        });
        setNewBookingsCount(recentBookings.length);
      }
    } catch (err) {
      console.error("Failed to check new bookings:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
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
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);

      const res = await fetch(`/api/bookings/stats/summary?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update booking");
      }

      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(err.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm(t("deleteBookingConfirm"))) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete booking");
      }

      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError(err.message);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    if (!confirm(t("completeBookingConfirm"))) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: "cash" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to complete booking");
      }

      fetchBookings();
      fetchStats();
      alert(t("bookingCompletedSuccess"));
    } catch (err) {
      console.error("Error completing booking:", err);
      setError(err.message);
    }
  };

  const handleBookingCreated = () => {
    setShowAddBooking(false);
    fetchBookings();
    fetchStats();
  };

  const getStatusIcon = (status) => {
    const StatusIcon = statusColors[status]?.icon || AlertCircle;
    return StatusIcon;
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocalizedStatus = (status) => {
    const statusMap = {
      scheduled: t("scheduled"),
      confirmed: t("confirmed"),
      completed: t("completed"),
      cancelled: t("cancelled"),
    };
    return statusMap[status] || status;
  };

  return (
    <div className={`booking-management-page ${isRTL ? "rtl" : "ltr"}`}>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="bookings-header">
        <div className="header-left">
          <h1>
            <Calendar size={24} />
            {t("bookingManagement")}
          </h1>
          <p className="subtext">{t("manageAppointmentsSubtext")}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => fetchBookings()}
            disabled={loading}
          >
            <RefreshCcw size={16} />
            {t("refresh")}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowAddBooking(true)}
          >
            <Plus size={16} />
            {t("newBooking")}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="booking-stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <Calendar size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.total_bookings}</h3>
              <p>{t("totalBookings")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon scheduled">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.scheduled}</h3>
              <p>{t("scheduled")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed">
              <CheckCircle size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.confirmed}</h3>
              <p>{t("confirmed")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.total_estimated_revenue?.toFixed(0)} EGP</h3>
              <p>{t("estRevenue")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="booking-filters">
        <div className="filter-group">
          <label>{t("date")}</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>{t("barber")}</label>
          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
          >
            <option value="">{t("allBarbers")}</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{t("status")}</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">{t("allStatus")}</option>
            <option value="scheduled">{t("scheduled")}</option>
            <option value="confirmed">{t("confirmed")}</option>
            <option value="completed">{t("completed")}</option>
            <option value="cancelled">{t("cancelled")}</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t("loadingBookings")}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>{t("noBookingsFound")}</h3>
            <p>
              {selectedDate || selectedBarber || selectedStatus !== "all"
                ? t("noBookingsMatch")
                : t("noBookingsToday")}
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowAddBooking(true)}
            >
              <Plus size={16} />
              {t("createFirstBooking")}
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);
              const statusStyle =
                statusColors[booking.status] || statusColors.scheduled;

              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-time">
                      <Clock size={16} />
                      <span>{formatTime(booking.booking_time)}</span>
                    </div>
                    <div
                      className="booking-status"
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      <StatusIcon size={14} />
                      <span>{getLocalizedStatus(booking.status)}</span>
                    </div>
                  </div>

                  <div className="booking-customer">
                    <div className="customer-info">
                      <User size={16} />
                      <div>
                        <h4>{booking.customer_name}</h4>
                        <p>{booking.customer_mobile}</p>
                      </div>
                    </div>
                  </div>

                  <div className="booking-barber">
                    <Scissors size={16} />
                    <span>{booking.barber_name}</span>
                    <span className="barber-specialty">
                      ({booking.barber_specialty})
                    </span>
                  </div>

                  {booking.services && booking.services.length > 0 && (
                    <div className="booking-services">
                      <h5>{t("services")}:</h5>
                      <div className="services-list">
                        {booking.services.map((service, index) => (
                          <span key={index} className="service-tag">
                            {service.name} - {service.price} EGP
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.estimated_cost && (
                    <div className="booking-cost">
                      <DollarSign size={16} />
                      <span>
                        {t("estCost")}: {booking.estimated_cost} EGP
                      </span>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="booking-notes">
                      <FileText size={16} />
                      <p>{booking.notes}</p>
                    </div>
                  )}

                  <div className="booking-actions">
                    {booking.status === "scheduled" && (
                      <button
                        className="action-btn confirm"
                        onClick={() =>
                          handleStatusUpdate(booking.id, "confirmed")
                        }
                        title={t("confirmBooking")}
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}

                    {(booking.status === "confirmed" ||
                      booking.status === "scheduled") && (
                      <button
                        className="action-btn complete"
                        onClick={() => handleCompleteBooking(booking.id)}
                        title={t("completeBooking")}
                      >
                        <CheckCircle size={14} />
                        {t("complete")}
                      </button>
                    )}

                    {booking.status !== "completed" && (
                      <button
                        className="action-btn cancel"
                        onClick={() =>
                          handleStatusUpdate(booking.id, "cancelled")
                        }
                        title={t("cancelBooking")}
                      >
                        <XCircle size={14} />
                      </button>
                    )}

                    <button
                      className="action-btn edit"
                      onClick={() => setEditingBooking(booking)}
                      title={t("editBooking")}
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteBooking(booking.id)}
                      title={t("deleteBooking")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t("createNewBooking")}</h2>
              <button onClick={() => setShowAddBooking(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>{t("selectCustomerMessage")}</p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddBooking(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowAddBooking(false);
                    window.location.href = "/admin/customers";
                  }}
                >
                  {t("goToCustomers")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
