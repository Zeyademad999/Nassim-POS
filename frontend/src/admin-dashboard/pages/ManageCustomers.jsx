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
import "../styles/ManageCustomers.css";

export default function ManageCustomers() {
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
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customers");
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
    if (!confirm("Are you sure you want to delete this customer?")) return;

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

  const handleViewCustomer = async (customer) => {
    console.log("Viewing customer ID:", customer.id); // 👈 LOG HERE

    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      if (!res.ok) throw new Error("Failed to fetch customer details");
      const data = await res.json();
      console.log("Preferred Barber ID:", data.preferred_barber_id); // 👈 Add this

      setViewingCustomer(data);
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      setError("Failed to load customer details");
    }
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
    return barber ? barber.name : "No preference";
  };

  return (
    <div className="manage-customers-page">
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
            Customer Management
          </h1>
          <p className="subtext">Manage your customers and their preferences</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddCustomer(true)}
        >
          <UserPlus size={16} />
          Add Customer
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
              <p>Total Customers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <User size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.active_customers}</h3>
              <p>Active Customers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.avg_customer_spend?.toFixed(0)} EGP</h3>
              <p>Avg. Customer Spend</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon preferences">
              <Star size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.customers_with_preferences}</h3>
              <p>With Preferences</p>
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
              placeholder="Search customers by name or mobile..."
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
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="total_visits-DESC">Most Visits</option>
            <option value="total_spent-DESC">Highest Spender</option>
            <option value="created_at-DESC">Newest First</option>
            <option value="last_visit-DESC">Recent Visit</option>
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
                <h3 className="customer-name">{customer.name}</h3>
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
                  title="View Details"
                >
                  <Eye size={14} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => setEditingCustomer(customer)}
                  title="Edit Customer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="action-btn danger"
                  onClick={() => handleDeleteCustomer(customer.id)}
                  title="Delete Customer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="customer-details">
              {customer.preferred_barber_name && (
                <div className="customer-preference">
                  <Star size={14} />
                  <span>Prefers: {customer.preferred_barber_name}</span>
                </div>
              )}

              <div className="customer-stats">
                <div className="stat-item">
                  <Clock size={14} />
                  <span>{customer.total_visits} visits</span>
                </div>
                <div className="stat-item">
                  <DollarSign size={14} />
                  <span>{customer.total_spent?.toFixed(0)} EGP</span>
                </div>
              </div>

              {customer.service_preferences && (
                <div className="customer-notes">
                  <p>
                    <strong>Preferences:</strong> {customer.service_preferences}
                  </p>
                </div>
              )}

              {customer.notes && (
                <div className="customer-notes">
                  <p>
                    <strong>Notes:</strong> {customer.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="customer-footer">
              <button
                className="btn-secondary"
                onClick={() => handleCreateBooking(customer)}
              >
                <Calendar size={14} />
                Book Appointment
              </button>
              {customer.last_visit && (
                <span className="last-visit">
                  Last visit:{" "}
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
          <h3>No customers found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Add your first customer to get started"}
          </p>
          {!searchTerm && (
            <button
              className="btn-primary"
              onClick={() => setShowAddCustomer(true)}
            >
              <UserPlus size={16} />
              Add First Customer
            </button>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Customer</h2>
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
              <h2>Edit Customer</h2>
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
              <h2>Customer Details</h2>
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
                    <span>{viewingCustomer.total_visits} visits</span>
                    <span>
                      {viewingCustomer.total_spent?.toFixed(0)} EGP spent
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences and Notes */}
              <div className="customer-info-section">
                <h4>Preferences & Notes</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Preferred Barber:</label>
                    <span>
                      {viewingCustomer.preferred_barber_name || "No preference"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Service Preferences:</label>
                    <span>
                      {viewingCustomer.service_preferences || "None specified"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Notes:</label>
                    <span>{viewingCustomer.notes || "No notes"}</span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              {viewingCustomer.bookings &&
                viewingCustomer.bookings.length > 0 && (
                  <div className="customer-info-section">
                    <h4>Recent Bookings</h4>
                    <div className="bookings-list">
                      {viewingCustomer.bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="booking-item">
                          <div className="booking-date">
                            {new Date(
                              booking.booking_date
                            ).toLocaleDateString()}
                          </div>
                          <div className="booking-details">
                            <span className="barber-name">
                              {booking.barber_name}
                            </span>
                            <span
                              className={`booking-status ${booking.status}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="booking-time">
                            {booking.booking_time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Transaction History */}
              {viewingCustomer.transactions &&
                viewingCustomer.transactions.length > 0 && (
                  <div className="customer-info-section">
                    <h4>Recent Transactions</h4>
                    <div className="transactions-list">
                      {viewingCustomer.transactions
                        .slice(0, 5)
                        .map((transaction) => (
                          <div
                            key={transaction.id}
                            className="transaction-item"
                          >
                            <div className="transaction-date">
                              {new Date(
                                transaction.created_at
                              ).toLocaleDateString()}
                            </div>
                            <div className="transaction-details">
                              <span className="barber-name">
                                {transaction.barber_name}
                              </span>
                              <span className="payment-method">
                                {transaction.payment_method}
                              </span>
                            </div>
                            <div className="transaction-amount">
                              {transaction.total?.toFixed(2)} EGP
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Book Appointment for {selectedCustomer.name}</h2>
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
