import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  Calendar,
  User,
  Scissors,
  Package,
  DollarSign,
  RefreshCw,
  FileText,
  X,
} from "lucide-react";
import ReceiptModal from "../components/ReceiptModal";
import "../styles/ViewReceipts.css";

export default function ViewReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Statistics
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalRevenue: 0,
    avgReceiptValue: 0,
    topBarber: null,
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [receipts, filters]);

  const fetchReceipts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/receipts");
      if (!res.ok) throw new Error("Failed to fetch receipts");

      const data = await res.json();
      const parsedData = data.map((receipt) => ({
        ...receipt,
        services: parseServices(receipt.services),
        products: parseProducts(receipt.products),
      }));

      setReceipts(parsedData);
      calculateStats(parsedData);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
      setError("Failed to load receipts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseServices = (services) => {
    if (!services) return [];
    try {
      const parsed = JSON.parse(services);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseProducts = (products) => {
    if (!products) return [];
    try {
      const parsed = JSON.parse(products);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
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

    setStats({ totalReceipts, totalRevenue, avgReceiptValue, topBarber });
  };

  const applyFilters = () => {
    let filtered = [...receipts];

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

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(term) ||
          r.barber_name?.toLowerCase().includes(term) ||
          r.id?.toLowerCase().includes(term)
      );
    }

    if (filters.barberName) {
      filtered = filtered.filter((r) =>
        r.barber_name?.toLowerCase().includes(filters.barberName.toLowerCase())
      );
    }

    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      filtered = filtered.filter(
        (r) => r.payment_method === filters.paymentMethod
      );
    }

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

    return filtered;
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
    setShowModal(true);
  };

  const exportCSV = () => {
    const filteredData = applyFilters();
    const csvContent = [
      [
        "Date",
        "Receipt ID",
        "Customer",
        "Barber",
        "Services",
        "Products",
        "Payment",
        "Total",
      ].join(","),
      ...filteredData.map((receipt) =>
        [
          new Date(receipt.created_at).toLocaleDateString(),
          receipt.id.substring(0, 8),
          receipt.customer_name || "Walk-in",
          receipt.barber_name || "N/A",
          receipt.services?.map((s) => s.name).join("; ") || "Empty",
          receipt.products?.map((p) => p.name).join("; ") || "Empty",
          receipt.payment_method || "cash",
          receipt.total || 0,
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReceipts = applyFilters();

  return (
    <div className="receipts-page">
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="receipts-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <Package size={24} />
              Receipts Management
            </h1>
            <p>View and manage all transaction receipts</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} />
              Export CSV
            </button>
            <button
              className="btn btn-secondary"
              onClick={fetchReceipts}
              disabled={loading}
            >
              <RefreshCw size={16} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Package size={20} />
          <div className="stat-content">
            <h3>{stats.totalReceipts}</h3>
            <p>Total Receipts</p>
          </div>
        </div>
        <div className="stat-card">
          <DollarSign size={20} />
          <div className="stat-content">
            <h3>{stats.totalRevenue.toFixed(2)} EGP</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={20} />
          <div className="stat-content">
            <h3>{stats.avgReceiptValue.toFixed(2)} EGP</h3>
            <p>Average Receipt</p>
          </div>
        </div>
        <div className="stat-card">
          <Scissors size={20} />
          <div className="stat-content">
            <h3>{stats.topBarber || "N/A"}</h3>
            <p>Top Barber</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search receipts..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
            />
          </div>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            placeholder="From Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            placeholder="To Date"
          />
        </div>
        <div className="filters-row">
          <input
            type="text"
            placeholder="Filter by barber"
            value={filters.barberName}
            onChange={(e) =>
              setFilters({ ...filters, barberName: e.target.value })
            }
          />
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
          <input
            type="number"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={(e) =>
              setFilters({ ...filters, minAmount: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={(e) =>
              setFilters({ ...filters, maxAmount: e.target.value })
            }
          />
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="results-info">
        <p>
          Showing {filteredReceipts.length} of {receipts.length} receipts
        </p>
      </div>

      <div className="receipts-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading receipts...</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No receipts found</h3>
            <p>
              {receipts.length === 0
                ? "No receipts available"
                : "No receipts match your filters"}
            </p>
            {receipts.length > 0 && (
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="receipts-table">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Receipt ID</th>
                  <th>Customer</th>
                  <th>Barber</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        <div>
                          <div>{formatDate(receipt.created_at)}</div>
                          <small>{formatTime(receipt.created_at)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="receipt-id">
                        {receipt.id.substring(0, 8)}...
                      </code>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <User size={14} />
                        <span>{receipt.customer_name || "Walk-in"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="barber-cell">
                        <Scissors size={14} />
                        <span>{receipt.barber_name || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="items-cell">
                        {receipt.services.length > 0 && (
                          <span className="item-count services">
                            {receipt.services.length} Service
                            {receipt.services.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {receipt.products.length > 0 && (
                          <span className="item-count products">
                            {receipt.products.length} Product
                            {receipt.products.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {receipt.services.length === 0 &&
                          receipt.products.length === 0 && (
                            <span className="item-count empty">Empty</span>
                          )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${
                          receipt.payment_method || "cash"
                        }`}
                      >
                        {(receipt.payment_method || "cash").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="amount-cell">
                        <DollarSign size={14} />
                        <span>{(receipt.total || 0).toFixed(2)} EGP</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleViewReceipt(receipt)}
                        title="View Receipt"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
