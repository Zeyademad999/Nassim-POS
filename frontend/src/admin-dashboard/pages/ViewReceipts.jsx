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
import { useLanguage } from "../../context/LanguageContext";
import "../styles/ViewReceipts.css";

export default function ViewReceipts() {
  const { t, isRTL } = useLanguage();

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
      if (!res.ok) throw new Error(t("Failed to fetch receipts"));

      const data = await res.json();
      const parsedData = data.map((receipt) => ({
        ...receipt,
        services: receipt.services || [],
        products: receipt.products || [],
      }));

      setReceipts(parsedData);
      calculateStats(parsedData);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
      setError(t("Failed to load receipts. Please try again."));
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
        t("Date"),
        t("Receipt ID"),
        t("Customer"),
        t("Barber"),
        t("Services"),
        t("Products"),
        t("Payment"),
        t("Total"),
      ].join(","),
      ...filteredData.map((receipt) =>
        [
          new Date(receipt.created_at).toLocaleDateString(),
          receipt.id.substring(0, 8),
          receipt.customer_name || t("Walk-in"),
          receipt.barber_name || t("N/A"),
          receipt.services?.map((s) => s.name).join("; ") || t("Empty"),
          receipt.products?.map((p) => p.name).join("; ") || t("Empty"),
          t(receipt.payment_method || "cash"),
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
    <div className={`receipts-page ${isRTL ? "rtl" : "ltr"}`}>
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
              {t("Receipts Management")}
            </h1>
            <p>{t("View and manage all transaction receipts")}</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={exportCSV}>
              <Download size={16} />
              {t("Export CSV")}
            </button>
            <button
              className="btn btn-secondary"
              onClick={fetchReceipts}
              disabled={loading}
            >
              <RefreshCw size={16} />
              {loading ? t("Loading...") : t("Refresh")}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Package size={20} />
          <div className="stat-content">
            <h3>{stats.totalReceipts}</h3>
            <p>{t("Total Receipts")}</p>
          </div>
        </div>
        <div className="stat-card">
          <DollarSign size={20} />
          <div className="stat-content">
            <h3>
              {stats.totalRevenue.toFixed(2)} {t("currency")}
            </h3>
            <p>{t("Total Revenue")}</p>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={20} />
          <div className="stat-content">
            <h3>
              {stats.avgReceiptValue.toFixed(2)} {t("currency")}
            </h3>
            <p>{t("Average Receipt")}</p>
          </div>
        </div>
        <div className="stat-card">
          <Scissors size={20} />
          <div className="stat-content">
            <h3>{stats.topBarber || t("N/A")}</h3>
            <p>{t("Top Barber")}</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder={t("Search receipts...")}
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
            placeholder={t("From Date")}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            placeholder={t("To Date")}
          />
        </div>
        <div className="filters-row">
          <input
            type="text"
            placeholder={t("Filter by barber")}
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
            <option value="all">{t("All Methods")}</option>
            <option value="cash">{t("Cash")}</option>
            <option value="card">{t("Card")}</option>
          </select>
          <input
            type="number"
            placeholder={t("Min Amount")}
            value={filters.minAmount}
            onChange={(e) =>
              setFilters({ ...filters, minAmount: e.target.value })
            }
          />
          <input
            type="number"
            placeholder={t("Max Amount")}
            value={filters.maxAmount}
            onChange={(e) =>
              setFilters({ ...filters, maxAmount: e.target.value })
            }
          />
          <button className="btn btn-secondary" onClick={clearFilters}>
            {t("Clear Filters")}
          </button>
        </div>
      </div>

      <div className="results-info">
        <p>
          {t("Showing")} {filteredReceipts.length} {t("of")} {receipts.length}{" "}
          {t("receipts")}
        </p>
      </div>

      <div className="receipts-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t("Loading receipts...")}</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>{t("No receipts found")}</h3>
            <p>
              {receipts.length === 0
                ? t("No receipts available")
                : t("No receipts match your filters")}
            </p>
            {receipts.length > 0 && (
              <button className="btn btn-primary" onClick={clearFilters}>
                {t("Clear Filters")}
              </button>
            )}
          </div>
        ) : (
          <div className="receipts-table">
            <table>
              <thead>
                <tr>
                  <th>{t("Date & Time")}</th>
                  <th>{t("Receipt ID")}</th>
                  <th>{t("Customer")}</th>
                  <th>{t("Barber")}</th>
                  <th>{t("Items")}</th>
                  <th>{t("Payment")}</th>
                  <th>{t("Total")}</th>
                  <th>{t("Actions")}</th>
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
                        <span>{receipt.customer_name || t("Walk-in")}</span>
                      </div>
                    </td>
                    <td>
                      <div className="barber-cell">
                        <Scissors size={14} />
                        <span>{receipt.barber_name || t("N/A")}</span>
                      </div>
                    </td>
                    <td>
                      <div className="items-cell">
                        {receipt.services.length > 0 && (
                          <span className="item-count services">
                            {receipt.services.length} {t("Service")}
                            {receipt.services.length > 1 ? t("s") : ""}
                          </span>
                        )}
                        {receipt.products.length > 0 && (
                          <span className="item-count products">
                            {receipt.products.length} {t("Product")}
                            {receipt.products.length > 1 ? t("s") : ""}
                          </span>
                        )}
                        {receipt.services.length === 0 &&
                          receipt.products.length === 0 && (
                            <span className="item-count empty">
                              {t("Empty")}
                            </span>
                          )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${
                          receipt.payment_method || "cash"
                        }`}
                      >
                        {t((receipt.payment_method || "cash").toUpperCase())}
                      </span>
                    </td>
                    <td>
                      <div className="amount-cell">
                        <DollarSign size={14} />
                        <span>
                          {(receipt.total || 0).toFixed(2)} {t("currency")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleViewReceipt(receipt)}
                        title={t("View Receipt")}
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
