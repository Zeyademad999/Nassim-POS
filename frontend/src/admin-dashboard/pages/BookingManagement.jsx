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
  X,
  ChevronDown,
  CalendarDays,
  UserCheck,
  Clock3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import BookingForm from "../components/BookingForm";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/BookingManagement.css";
import CustomerBookingForm from "../components/CustomerBookingForm";
import EditBookingForm from "../components/EditBookingForm";

export default function BookingManagement() {
  const { t, isRTL } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔧 FIX: Default to empty string to show all bookings
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  const [editingBooking, setEditingBooking] = useState(null);
  const [stats, setStats] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [completionConfirmation, setCompletionConfirmation] = useState(null);

  const statusColors = {
    scheduled: { bg: "#f8f9fa", color: "#000000", icon: Clock3 },
    confirmed: { bg: "#f8f9fa", color: "#000000", icon: CheckCircle },
    completed: { bg: "#f8f9fa", color: "#000000", icon: CheckCircle },
    cancelled: { bg: "#f8f9fa", color: "#000000", icon: XCircle },
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

  useEffect(() => {
    console.log("🔍 BookingManagement Debug Info:");
    console.log("- Selected Date:", selectedDate);
    console.log("- Selected Barber:", selectedBarber);
    console.log("- Selected Status:", selectedStatus);
    console.log("- Bookings Count:", bookings.length);
    console.log("- Customers Count:", customers.length);
    console.log("- Barbers Count:", barbers.length);
  }, [
    selectedDate,
    selectedBarber,
    selectedStatus,
    bookings,
    customers,
    barbers,
  ]);

  const fetchBookings = async () => {
    console.log("📡 Fetching bookings with filters:", {
      selectedDate,
      selectedBarber,
      selectedStatus,
    });

    setLoading(true);
    try {
      const params = new URLSearchParams();
      // 🔧 FIX: Only add date filter if a specific date is selected
      if (selectedDate) params.append("date", selectedDate);
      if (selectedBarber) params.append("barber_id", selectedBarber);
      if (selectedStatus !== "all") params.append("status", selectedStatus);

      const url = `/api/bookings?${params}`;
      console.log("📤 Fetching URL:", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bookings");

      const data = await res.json();
      console.log("📦 Fetched bookings:", data);
      console.log("📊 Number of bookings:", data.length);

      setBookings(data);
    } catch (err) {
      console.error("❌ Failed to fetch bookings:", err);
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
      console.log("👥 Fetching customers...");
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();

      console.log("👥 Customers response:", data);

      // Handle different response structures
      let customersArray = [];
      if (Array.isArray(data)) {
        customersArray = data;
      } else if (data.customers && Array.isArray(data.customers)) {
        customersArray = data.customers;
      } else if (data.data && Array.isArray(data.data)) {
        customersArray = data.data;
      }

      console.log("👥 Setting customers:", customersArray);
      setCustomers(customersArray);
    } catch (err) {
      console.error("❌ Failed to fetch customers:", err);
      setCustomers([]);
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
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete booking");
      }

      setDeleteConfirmation(null);
      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteBooking = (booking) => {
    setDeleteConfirmation({
      booking,
      isVisible: true,
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      ...deleteConfirmation,
      isVisible: false,
    });
    // Remove the confirmation after animation
    setTimeout(() => {
      setDeleteConfirmation(null);
    }, 300);
  };

  const proceedWithDelete = () => {
    if (deleteConfirmation?.booking) {
      handleDeleteBooking(deleteConfirmation.booking.id);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    setLoading(true);
    setError("");

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

      const completedBooking = await res.json();

      // Show completion confirmation modal
      setCompletionConfirmation({
        booking: completedBooking,
        isVisible: true,
      });

      fetchBookings();
      fetchStats();
    } catch (err) {
      console.error("Error completing booking:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeCompletionConfirmation = () => {
    setCompletionConfirmation({
      ...completionConfirmation,
      isVisible: false,
    });
    // Remove the confirmation after animation
    setTimeout(() => {
      setCompletionConfirmation(null);
    }, 300);
  };

  // 🔧 FIX: Enhanced booking creation handler
  const handleBookingCreated = async (createdBooking) => {
    console.log("🎯 Booking creation callback triggered:", createdBooking);

    setShowAddBooking(false);

    // 🔧 FIX: Auto-switch to the booking's date to show it immediately
    if (createdBooking && createdBooking.booking_date) {
      console.log(
        "📅 Setting date filter to show new booking:",
        createdBooking.booking_date
      );
      setSelectedDate(createdBooking.booking_date);
    }

    // Force refresh bookings
    console.log("🔄 Refreshing bookings and stats...");
    await Promise.all([fetchBookings(), fetchStats()]);

    console.log("✅ Bookings refreshed");

    // Show completion confirmation modal instead of alert
    setCompletionConfirmation({
      booking: createdBooking,
      isVisible: true,
      isNewBooking: true,
    });
  };

  const handleBookingUpdated = () => {
    setEditingBooking(null);
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

  // 🔧 FIX: Helper functions for quick date switching
  const getToday = () => new Date().toISOString().split("T")[0];
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className={`booking-management-page ${isRTL ? "rtl" : "ltr"}`}>
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bookings-header">
        <div className="header-info">
          <h1>
            <Calendar size={24} />
            {t("bookingManagement")}
          </h1>
          <p className="subtext">{t("manageAppointmentsSubtext")}</p>
        </div>
        <div className="header-actions">
          <button
            className="refresh-button"
            onClick={() => fetchBookings()}
            disabled={loading}
          >
            <RefreshCcw size={16} />
            {t("refresh")}
          </button>
          <button
            className="add-booking-button"
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
              <CalendarDays size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.total_bookings}</h3>
              <p>{t("totalBookings")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon scheduled">
              <Clock3 size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.scheduled}</h3>
              <p>{t("scheduled")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed">
              <UserCheck size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.confirmed}</h3>
              <p>{t("confirmed")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.total_estimated_revenue?.toFixed(0)} EGP</h3>
              <p>{t("estRevenue")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="booking-filters">
        {/* Quick Date Buttons */}
        <div className="filter-group">
          <label>{t("quickFilters") || "Quick Filters"}</label>
          <div className="quick-date-buttons">
            <button
              className={`quick-btn ${selectedDate === "" ? "active" : ""}`}
              onClick={() => setSelectedDate("")}
            >
              All Dates ({bookings.length})
            </button>
            <button
              className={`quick-btn ${
                selectedDate === getToday() ? "active" : ""
              }`}
              onClick={() => setSelectedDate(getToday())}
            >
              Today
            </button>
            <button
              className={`quick-btn ${
                selectedDate === getTomorrow() ? "active" : ""
              }`}
              onClick={() => setSelectedDate(getTomorrow())}
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Date Picker */}
        <div className="filter-group">
          <label>{t("date") || "Specific Date"}</label>
          <div className="date-input-wrapper">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Select specific date"
            />
            {selectedDate && (
              <button
                className="clear-date-btn"
                onClick={() => setSelectedDate("")}
                title="Clear date filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
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

      {/* Current Filter Display */}
      <div className="active-filters">
        <span className="filter-label">Showing:</span>
        <span className="filter-value">
          {selectedDate ? `Bookings for ${selectedDate}` : "All bookings"}
          {selectedBarber &&
            ` • Barber: ${barbers.find((b) => b.id === selectedBarber)?.name}`}
          {selectedStatus !== "all" && ` • Status: ${selectedStatus}`}
        </span>
        <span className="results-count">({bookings.length} results)</span>
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
                ? t("noBookingsMatch") ||
                  "No bookings match your filters. Try clearing some filters."
                : t("noBookingsToday") || "No bookings found."}
            </p>
            {/* Quick actions for empty state */}
            <div className="empty-state-actions">
              <button
                className="add-booking-button"
                onClick={() => setShowAddBooking(true)}
              >
                <Plus size={16} />
                {t("createFirstBooking") || "Create New Booking"}
              </button>
              {(selectedDate || selectedBarber || selectedStatus !== "all") && (
                <button
                  className="clear-filters-button"
                  onClick={() => {
                    setSelectedDate("");
                    setSelectedBarber("");
                    setSelectedStatus("all");
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status);
              const statusStyle =
                statusColors[booking.status] || statusColors.scheduled;

              return (
                <div key={booking.id} className="booking-card">
                  {/* Add booking date to card header */}
                  <div className="booking-header">
                    <div className="booking-date-time">
                      <div className="booking-date">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                      <div className="booking-time">
                        <Clock size={16} />
                        <span>{formatTime(booking.booking_time)}</span>
                      </div>
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
                      onClick={() => confirmDeleteBooking(booking)}
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
          <div className="modal-content booking-modal">
            <div className="modal-header">
              <h2>{t("createNewBooking")}</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddBooking(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {customers.length === 0 ? (
                <>
                  <p>{t("selectCustomerMessage")}</p>
                  <div className="modal-actions">
                    <button
                      className="cancel-button"
                      onClick={() => setShowAddBooking(false)}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      className="save-button"
                      onClick={() => {
                        setShowAddBooking(false);
                        window.location.href = "/admin/customers";
                      }}
                    >
                      {t("goToCustomers")}
                    </button>
                  </div>
                </>
              ) : (
                <CustomerBookingForm
                  customers={customers}
                  barbers={barbers}
                  onSubmit={handleBookingCreated}
                  onCancel={() => setShowAddBooking(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="modal-overlay">
          <div className="modal-content booking-modal">
            <div className="modal-header">
              <h2>Edit Booking</h2>
              <button
                className="close-btn"
                onClick={() => setEditingBooking(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <EditBookingForm
                booking={editingBooking}
                barbers={barbers}
                onSubmit={handleBookingUpdated}
                onCancel={() => setEditingBooking(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>{t("confirmDeleteBooking")}</h2>
              <button className="close-btn" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <AlertTriangle size={48} className="alert-icon" />
              <p>
                {t("confirmDeleteBookingMessage", {
                  bookingDate: new Date(
                    deleteConfirmation.booking.booking_date
                  ).toLocaleDateString(),
                  bookingTime: formatTime(
                    deleteConfirmation.booking.booking_time
                  ),
                  bookingCustomer: deleteConfirmation.booking.customer_name,
                })}
              </p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  {t("cancel")}
                </button>
                <button
                  className="delete-button"
                  onClick={proceedWithDelete}
                  disabled={loading}
                >
                  {loading ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {completionConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content completion-confirmation-modal">
            <div className="modal-header">
              <h2>
                {completionConfirmation.isNewBooking
                  ? t("bookingCreatedSuccessfully") ||
                    "Booking Created Successfully"
                  : t("bookingCompleted") || "Booking Completed"}
              </h2>
              <button
                className="close-btn"
                onClick={closeCompletionConfirmation}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <CheckCircle size={48} className="check-icon" />

              <div className="booking-details-summary">
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">
                    {completionConfirmation.booking.customer_name}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(
                      completionConfirmation.booking.booking_date
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">
                    {formatTime(completionConfirmation.booking.booking_time)}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Barber:</span>
                  <span className="detail-value">
                    {completionConfirmation.booking.barber_name}
                  </span>
                </div>

                {completionConfirmation.booking.services &&
                  completionConfirmation.booking.services.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Services:</span>
                      <div className="services-list">
                        {completionConfirmation.booking.services.map(
                          (service, index) => (
                            <span key={index} className="service-item">
                              {service.name} - {service.price} EGP
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {completionConfirmation.booking.estimated_cost && (
                  <div className="detail-row total-cost">
                    <span className="detail-label">Total Cost:</span>
                    <span className="detail-value cost-amount">
                      {completionConfirmation.booking.estimated_cost} EGP
                    </span>
                  </div>
                )}

                {completionConfirmation.booking.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value notes">
                      {completionConfirmation.booking.notes}
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="close-button"
                  onClick={closeCompletionConfirmation}
                >
                  {t("close") || "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
