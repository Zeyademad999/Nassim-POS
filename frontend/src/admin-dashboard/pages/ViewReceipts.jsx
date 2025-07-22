import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  User,
  Scissors,
  Package,
  DollarSign,
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";
import ReceiptModal from "../components/ReceiptModal";
import "../styles/ViewReceipts.css";

export default function ViewReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("staff"); // Default to staff

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: "",
    barberName: "",
    paymentMethod: "all",
    minAmount: "",
    maxAmount: "",
  });

  // Modal states
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // view, edit

  // Statistics
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalRevenue: 0,
    avgReceiptValue: 0,
    topBarber: null,
  });

  useEffect(() => {
    fetchReceipts();
    checkUserRole();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [receipts, filters]);

  const checkUserRole = async () => {
    try {
      // In a real app, you'd get this from authentication context
      // For now, we'll simulate it. You can implement proper auth later
      const role = localStorage.getItem("userRole") || "staff";
      setUserRole(role);
    } catch (err) {
      console.error("Failed to check user role:", err);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/receipts");
      if (!res.ok) throw new Error("Failed to fetch receipts");

      const data = await res.json();

      const parsedData = data.map((receipt) => ({
        ...receipt,
        services: (() => {
          try {
            const parsed = JSON.parse(receipt.services || "[]");
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })(),
        products: (() => {
          try {
            const parsed = JSON.parse(receipt.products || "[]");
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })(),
      }));

      setReceipts(parsedData);
      calculateStats(parsedData);
    } catch (err) {
      console.error("❌ Failed to fetch receipts:", err);
      setError("Failed to load receipts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (receiptData) => {
    const totalReceipts = receiptData.length;
    const totalRevenue = receiptData.reduce(
      (sum, r) => sum + (r.total || 0),
      0
    );
    const avgReceiptValue =
      totalReceipts > 0 ? totalRevenue / totalReceipts : 0;

    // Find top barber
    const barberStats = {};
    receiptData.forEach((receipt) => {
      if (receipt.barber_name) {
        barberStats[receipt.barber_name] =
          (barberStats[receipt.barber_name] || 0) + (receipt.total || 0);
      }
    });

    const topBarber =
      Object.keys(barberStats).length > 0
        ? Object.keys(barberStats).reduce((a, b) =>
            barberStats[a] > barberStats[b] ? a : b
          )
        : null;

    setStats({
      totalReceipts,
      totalRevenue,
      avgReceiptValue,
      topBarber,
    });
  };

  const applyFilters = () => {
    let filtered = [...receipts];

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) <= new Date(filters.endDate + "T23:59:59")
      );
    }

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(term) ||
          r.barber_name?.toLowerCase().includes(term) ||
          r.id?.toLowerCase().includes(term)
      );
    }

    // Barber filter
    if (filters.barberName) {
      filtered = filtered.filter((r) =>
        r.barber_name?.toLowerCase().includes(filters.barberName.toLowerCase())
      );
    }

    // Payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      filtered = filtered.filter(
        (r) => r.payment_method === filters.paymentMethod
      );
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(
        (r) => (r.total || 0) >= parseFloat(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(
        (r) => (r.total || 0) <= parseFloat(filters.maxAmount)
      );
    }

    setFilteredReceipts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      searchTerm: "",
      barberName: "",
      paymentMethod: "all",
      minAmount: "",
      maxAmount: "",
    });
  };

  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setModalMode("view");
    setShowModal(true);
  };

  const handleEditReceipt = (receipt) => {
    if (userRole !== "super_admin") {
      alert("Only super admins can edit receipts.");
      return;
    }
    setSelectedReceipt(receipt);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (userRole !== "super_admin") {
      alert("Only super admins can delete receipts.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this receipt? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete receipt");
      }

      fetchReceipts(); // Refresh the list
      alert("Receipt deleted successfully.");
    } catch (err) {
      console.error("Failed to delete receipt:", err);
      setError("Failed to delete receipt: " + err.message);
    }
  };

  const handleSaveReceipt = async (updatedReceipt) => {
    try {
      const res = await fetch(`/api/receipts/${updatedReceipt.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedReceipt),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update receipt");
      }

      fetchReceipts(); // Refresh the list
      setShowModal(false);
      alert("Receipt updated successfully.");
    } catch (err) {
      console.error("Failed to update receipt:", err);
      setError("Failed to update receipt: " + err.message);
    }
  };

  // Export individual receipt as branded receipt
  const exportReceiptPDF = (receipt) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              width: 80mm; 
              padding: 10px; 
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 10px; 
            }
            .shop-name { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .receipt-id { 
              font-size: 12px; 
              margin-top: 5px; 
            }
            .section { 
              margin: 10px 0; 
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 3px 0; 
            }
            .total-row { 
              border-top: 1px solid #000; 
              font-weight: bold; 
              margin-top: 10px; 
              padding-top: 5px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 10px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">NASSIM BARBER SHOP</div>
            <div class="receipt-id">Receipt: ${receipt.id.substring(0, 8)}</div>
            <div>${new Date(receipt.created_at).toLocaleString()}</div>
          </div>
          
          <div class="section">
            <div class="row">
              <span>Customer:</span>
              <span>${receipt.customer_name || "Walk-in"}</span>
            </div>
            <div class="row">
              <span>Barber:</span>
              <span>${receipt.barber_name || "N/A"}</span>
            </div>
          </div>

          <div class="section">
            <strong>Services:</strong>
            ${receipt.services
              .map(
                (service) => `
              <div class="row">
                <span>${service.name}</span>
                <span>${service.price?.toFixed(2) || 0} EGP</span>
              </div>
            `
              )
              .join("")}
          </div>

          ${
            receipt.products && receipt.products.length > 0
              ? `
          <div class="section">
            <strong>Products:</strong>
            ${receipt.products
              .map(
                (product) => `
              <div class="row">
                <span>${product.name}</span>
                <span>${product.price?.toFixed(2) || 0} EGP</span>
              </div>
            `
              )
              .join("")}
          </div>
          `
              : ""
          }

          <div class="total-row">
            <div class="row">
              <span>Payment:</span>
              <span>${receipt.payment_method.toUpperCase()}</span>
            </div>
            <div class="row">
              <span>TOTAL:</span>
              <span>${receipt.total.toFixed(2)} EGP</span>
            </div>
          </div>

          <div class="footer">
            Thank you for your visit!<br>
            Visit us again soon
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receipt.id.substring(0, 8)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReceipts = () => {
    const dataToExport =
      filteredReceipts.length > 0 ? filteredReceipts : receipts;
    const csvContent = [
      // CSV Header
      [
        "Date",
        "Receipt ID",
        "Customer",
        "Barber",
        "Services",
        "Products",
        "Payment Method",
        "Total",
      ].join(","),
      // CSV Data
      ...dataToExport.map((receipt) =>
        [
          new Date(receipt.created_at).toLocaleDateString(),
          receipt.id,
          receipt.customer_name || "N/A",
          receipt.barber_name || "N/A",
          receipt.services?.map((s) => s.name).join("; ") || "N/A",
          receipt.products?.map((p) => p.name).join("; ") || "N/A",
          receipt.payment_method || "cash",
          receipt.total || 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isSuperAdmin = userRole === "super_admin";
  const displayReceipts =
    filteredReceipts.length > 0 ? filteredReceipts : receipts;

  return (
    <div className="view-receipts-page">
      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="receipts-header">
        <div className="header-left">
          <h1>
            <Package size={24} />
            Receipts Management
          </h1>
          <p>View and manage all transaction receipts</p>
          {isSuperAdmin && (
            <div className="admin-badge">
              <span>Super Admin Access</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={exportReceipts}>
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="btn-secondary"
            onClick={fetchReceipts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="receipts-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalReceipts}</h3>
            <p>Total Receipts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalRevenue.toFixed(2)} EGP</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.avgReceiptValue.toFixed(2)} EGP</h3>
            <p>Average Receipt</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Scissors size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.topBarber || "N/A"}</h3>
            <p>Top Barber</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="receipts-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by customer, barber, or receipt ID..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Barber</label>
            <input
              type="text"
              placeholder="Filter by barber name..."
              value={filters.barberName}
              onChange={(e) =>
                setFilters({ ...filters, barberName: e.target.value })
              }
            />
          </div>
          <div className="filter-group">
            <label>Payment Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                setFilters({ ...filters, paymentMethod: e.target.value })
              }
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Min Amount</label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
            />
          </div>
          <div className="filter-group">
            <label>Max Amount</label>
            <input
              type="number"
              placeholder="1000.00"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: e.target.value })
              }
            />
          </div>
          <div className="filter-actions">
            <button className="btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>
          Showing {displayReceipts.length} of {receipts.length} receipts
        </p>
      </div>

      {/* Receipts Table */}
      <div className="receipt-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading receipts...</p>
          </div>
        ) : displayReceipts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No receipts found</h3>
            <p>
              {receipts.length === 0
                ? "No receipts have been generated yet"
                : "No receipts match your current filters"}
            </p>
            {receipts.length > 0 && (
              <button className="btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="receipt-table">
            <div className="table-header">
              <h3>Transaction Receipts</h3>
              {isSuperAdmin && (
                <p className="admin-note">
                  You have full edit/delete permissions
                </p>
              )}
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Receipt ID</th>
                    <th>Customer</th>
                    <th>Barber</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayReceipts.map((receipt) => (
                    <tr key={receipt.id} className="receipt-row">
                      <td data-label="Date">
                        <div className="date-info">
                          <Calendar size={14} />
                          <span>
                            {new Date(receipt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td data-label="Receipt ID" className="receipt-id">
                        <code>{receipt.id.substring(0, 8)}...</code>
                      </td>
                      <td data-label="Customer" className="customer-info">
                        <div className="customer-details">
                          <User size={14} />
                          <span>
                            {receipt.customer_name || "Walk-in Customer"}
                          </span>
                        </div>
                      </td>
                      <td data-label="Barber" className="barber-info">
                        <div className="barber-details">
                          <Scissors size={14} />
                          <span>{receipt.barber_name || "N/A"}</span>
                        </div>
                      </td>
                      <td data-label="Total" className="total-amount">
                        <div className="amount-display">
                          <DollarSign size={14} />
                          <span className="amount">
                            {(receipt.total || 0).toFixed(2)} EGP
                          </span>
                        </div>
                      </td>
                      <td data-label="Actions" className="actions">
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewReceipt(receipt)}
                            title="View Receipt Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            className="export-btn pdf"
                            onClick={() => exportReceiptPDF(receipt)}
                            title="Export Receipt"
                          >
                            <FileText size={14} />
                          </button>

                          {isSuperAdmin && (
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditReceipt(receipt)}
                              title="Edit Receipt (Super Admin)"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}

                          {isSuperAdmin && (
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              title="Delete Receipt (Super Admin)"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showModal && selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onSave={handleSaveReceipt}
          canEdit={isSuperAdmin}
        />
      )}
    </div>
  );
}
