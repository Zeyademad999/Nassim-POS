import React, { useEffect, useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import {
  RefreshCcw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Scissors,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Target,
  AlertTriangle,
  CreditCard,
  Clock,
  Star,
  ShoppingCart,
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  Receipt,
} from "lucide-react";
import "../styles/Reports.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

export default function Reports({ user }) {
  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
  });

  // Transaction management states
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    customer_name: "",
    barber_name: "",
    total: "",
    payment_method: "cash",
    service_date: new Date().toISOString().split("T")[0],
  });

  const periodOptions = [
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "custom", label: "Custom Range" },
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = "/api/reports";
      const params = new URLSearchParams();

      if (selectedPeriod === "custom" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("period", selectedPeriod);
      }

      // Add role-based filtering for accountants
      if (user && user.role === "accountant") {
        params.append("invoiceOnly", "true");
      }

      // Add expense data request - NEW
      params.append("includeExpenses", "true");

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      // Filter out deleted barbers from performance data
      if (data.barberPerformance) {
        const activeBarberRes = await fetch("/api/barbers");
        const activeBarbers = await activeBarberRes.json();
        const activeBarberNames = new Set(activeBarbers.map((b) => b.name));

        data.barberPerformance = data.barberPerformance.filter((barber) =>
          activeBarberNames.has(barber.name)
        );
      }

      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      let url = "/api/transactions";
      const params = new URLSearchParams();

      if (selectedPeriod === "custom" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("period", selectedPeriod);
      }

      // Add role-based filtering for accountants
      if (user && user.role === "accountant") {
        params.append("invoiceOnly", "true");
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };
  // Real-time data refresh when filters change
  useEffect(() => {
    fetchReports();
    fetchTransactions();
  }, [selectedPeriod, startDate, endDate]);

  const exportToPDF = async () => {
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      const params = new URLSearchParams();
      if (selectedPeriod === "custom" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("period", selectedPeriod);
      }

      const response = await fetch(
        `/api/reports/export/pdf?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `nassim-barber-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExportLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  const exportToExcel = async () => {
    setExportLoading((prev) => ({ ...prev, excel: true }));
    try {
      const params = new URLSearchParams();
      if (selectedPeriod === "custom" && startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("period", selectedPeriod);
      }

      const response = await fetch(
        `/api/reports/export/excel?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `nassim-barber-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Excel export failed:", err);
      alert("Failed to export Excel. Please try again.");
    } finally {
      setExportLoading((prev) => ({ ...prev, excel: false }));
    }
  };

  // Transaction Management Functions
  const handleEditTransaction = (transaction) => {
    setEditingTransaction({
      ...transaction,
      service_date: new Date(transaction.service_date)
        .toISOString()
        .split("T")[0],
    });
  };

  const handleSaveTransaction = async () => {
    try {
      const response = await fetch(
        `/api/transactions/${editingTransaction.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingTransaction),
        }
      );

      if (response.ok) {
        setEditingTransaction(null);
        fetchTransactions();
        fetchReports(); // Refresh reports to reflect changes
      } else {
        throw new Error("Failed to update transaction");
      }
    } catch (err) {
      console.error("Failed to update transaction:", err);
      alert("Failed to update transaction. Please try again.");
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (
      !confirm(
        "Are you sure you want to delete this transaction? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTransactions();
        fetchReports(); // Refresh reports to reflect changes
      } else {
        throw new Error("Failed to delete transaction");
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  const handleAddTransaction = async () => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTransaction,
          total: parseFloat(newTransaction.total),
          subtotal: parseFloat(newTransaction.total),
          tax: 0,
          discount_amount: 0,
        }),
      });

      if (response.ok) {
        setShowAddTransaction(false);
        setNewTransaction({
          customer_name: "",
          barber_name: "",
          total: "",
          payment_method: "cash",
          service_date: new Date().toISOString().split("T")[0],
        });
        fetchTransactions();
        fetchReports(); // Refresh reports to reflect changes
      } else {
        throw new Error("Failed to add transaction");
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Failed to add transaction. Please try again.");
    }
  };

  if (!reportData) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading comprehensive reports...</p>
      </div>
    );
  }

  // Enhanced Chart configurations with both revenue and units/transactions
  const revenueChartData = {
    labels:
      reportData.revenueByDay?.map((d) =>
        new Date(d.date).toLocaleDateString()
      ) || [],
    datasets: [
      {
        label: "Daily Revenue",
        data: reportData.revenueByDay?.map((d) => d.revenue) || [],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const servicesPieData = {
    labels: reportData.serviceRevenue?.map((s) => s.name) || [],
    datasets: [
      {
        data: reportData.serviceRevenue?.map((s) => s.revenue) || [],
        backgroundColor: [
          "#2563eb",
          "#059669",
          "#dc2626",
          "#d97706",
          "#7c3aed",
          "#db2777",
          "#0891b2",
          "#65a30d",
          "#dc2626",
          "#4338ca",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Updated barber performance chart with both revenue and transactions
  const barberPerformanceData = {
    labels: reportData.barberPerformance?.map((b) => b.name) || [],
    datasets: [
      {
        label: "Revenue (EGP)",
        data: reportData.barberPerformance?.map((b) => b.revenue) || [],
        backgroundColor: "#059669",
        borderRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Transactions",
        data: reportData.barberPerformance?.map((b) => b.count) || [],
        backgroundColor: "#dc2626",
        borderRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  // Updated product performance chart with both revenue and units sold
  const productPerformanceData = {
    labels: reportData.productSales?.map((p) => p.name) || [],
    datasets: [
      {
        label: "Revenue (EGP)",
        data: reportData.productSales?.map((p) => p.revenue) || [],
        backgroundColor: "#2563eb",
        borderRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Units Sold",
        data: reportData.productSales?.map((p) => p.quantity) || [],
        backgroundColor: "#059669",
        borderRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const paymentMethodData = {
    labels: reportData.paymentMethods?.map((p) => p.method) || [],
    datasets: [
      {
        data: reportData.paymentMethods?.map((p) => p.amount) || [],
        backgroundColor: ["#2563eb", "#059669", "#dc2626"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenue (EGP)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="enhanced-reports">
      {/* Header */}
      <div className="reports-header">
        <h1 className="reports-title">
          <BarChart3 size={36} />
          Business Intelligence
        </h1>
        <div className="header-actions">
          <button
            className="action-btn"
            onClick={exportToPDF}
            disabled={exportLoading.pdf}
          >
            <Download size={16} />
            {exportLoading.pdf ? "Exporting..." : "Export PDF"}
          </button>
          <button
            className="action-btn"
            onClick={exportToExcel}
            disabled={exportLoading.excel}
          >
            <Download size={16} />
            {exportLoading.excel ? "Exporting..." : "Export Excel"}
          </button>
          <button
            className="action-btn primary"
            onClick={fetchReports}
            disabled={loading}
          >
            <RefreshCcw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2 className="filters-title">
          <Calendar size={20} />
          Report Filters
        </h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Time Period</label>
            <select
              className="filter-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {selectedPeriod === "custom" && (
            <>
              <div className="filter-group">
                <label className="filter-label">Start Date</label>
                <input
                  type="date"
                  className="filter-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">End Date</label>
                <input
                  type="date"
                  className="filter-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Eye size={16} />
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "financial" ? "active" : ""}`}
          onClick={() => setActiveTab("financial")}
        >
          <DollarSign size={16} />
          Financial
        </button>
        <button
          className={`tab-button ${
            activeTab === "profit-loss" ? "active" : ""
          }`}
          onClick={() => setActiveTab("profit-loss")}
        >
          <BarChart3 size={16} />
          P&L Report
        </button>
        <button
          className={`tab-button ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <Package size={16} />
          Products
        </button>
        <button
          className={`tab-button ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          <Users size={16} />
          Staff Performance
        </button>
        <button
          className={`tab-button ${
            activeTab === "transactions" ? "active" : ""
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          <CreditCard size={16} />
          Transactions
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3>Total Revenue</h3>
                  <p className="metric-value">
                    {reportData.totalRevenue?.toFixed(2)} EGP
                  </p>
                  <div className="metric-change positive">
                    <TrendingUp size={14} />
                    {reportData.revenueGrowth || 0}% vs last period
                  </div>
                </div>
                <div className="metric-icon revenue">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3>Total Transactions</h3>
                  <p className="metric-value">
                    {reportData.totalTransactions || 0}
                  </p>
                  <div className="metric-change positive">
                    <TrendingUp size={14} />
                    {reportData.transactionGrowth || 0}% vs last period
                  </div>
                </div>
                <div className="metric-icon transactions">
                  <ShoppingCart size={24} />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3>Average Order Value</h3>
                  <p className="metric-value">
                    {reportData.averageOrderValue?.toFixed(2)} EGP
                  </p>
                  <div className="metric-change positive">
                    <TrendingUp size={14} />
                    {reportData.aovGrowth || 0}% vs last period
                  </div>
                </div>
                <div className="metric-icon aov">
                  <Target size={24} />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3>Top Service</h3>
                  <p className="metric-value top-service-name">
                    {reportData.topService?.name || "N/A"}
                  </p>
                  <div className="metric-change positive">
                    <Star size={14} />
                    {reportData.topService?.revenue?.toFixed(2)} EGP revenue
                  </div>
                </div>
                <div className="metric-icon service">
                  <Scissors size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">
                <TrendingUp size={20} />
                Revenue Trend
              </h2>
            </div>
            <div className="chart-container">
              {reportData.revenueByDay?.length > 0 ? (
                <Line
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return value + " EGP";
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="empty-state">
                  <p>No revenue data available for the selected period</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Financial Tab */}
      {activeTab === "financial" && (
        <>
          <div className="charts-grid">
            <div className="financial-charts">
              <div className="chart-card">
                <div className="chart-header">
                  <h2 className="chart-title">
                    <PieChart size={20} />
                    Revenue by Service
                  </h2>
                </div>
                <div className="chart-container">
                  {reportData.serviceRevenue?.length > 0 ? (
                    <Pie
                      data={servicesPieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return (
                                  context.label + ": " + context.parsed + " EGP"
                                );
                              },
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="empty-state">
                      <p>No service revenue data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h2 className="chart-title">
                  <CreditCard size={20} />
                  Payment Methods
                </h2>
              </div>
              <div className="chart-container">
                {reportData.paymentMethods?.length > 0 ? (
                  <Doughnut
                    data={paymentMethodData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return (
                                context.label + ": " + context.parsed + " EGP"
                              );
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="empty-state">
                    <p>No payment method data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Insights */}
          <div className="insights-grid">
            <div className="insight-card revenue-insight">
              <h3 className="insight-title"> Revenue Insight</h3>
              <p className="insight-description">
                {reportData.topService?.name || "Your top service"} generates
                the highest revenue. Consider promoting similar services to
                maximize earnings.
              </p>
            </div>
            <div className="insight-card payment-insight">
              <h3 className="insight-title">Payment Trends</h3>
              <p className="insight-description">
                {reportData.paymentMethods?.[0]?.method || "Cash"} is your most
                popular payment method. Consider offering incentives for digital
                payments.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Profit & Loss Tab */}
      {activeTab === "profit-loss" && (
        <>
          {/* P&L Summary Cards */}
          <div className="pl-summary-grid">
            <div className="pl-card income">
              <div className="pl-header">
                <h3>Total Income</h3>
                <TrendingUp size={24} className="pl-icon" />
              </div>
              <div className="pl-amount positive">
                {reportData.totalRevenue?.toFixed(2)} EGP
              </div>
              <div className="pl-breakdown">
                <div className="pl-item">
                  <span>Service Revenue:</span>
                  <span>
                    {reportData.serviceRevenue
                      ?.reduce((sum, s) => sum + (s.revenue || 0), 0)
                      ?.toFixed(2)}{" "}
                    EGP
                  </span>
                </div>
                <div className="pl-item">
                  <span>Product Revenue:</span>
                  <span>
                    {reportData.productSales
                      ?.reduce((sum, p) => sum + (p.revenue || 0), 0)
                      ?.toFixed(2)}{" "}
                    EGP
                  </span>
                </div>
              </div>
            </div>

            <div className="pl-card expenses">
              <div className="pl-header">
                <h3>Total Expenses</h3>
                <TrendingDown size={24} className="pl-icon" />
              </div>
              <div className="pl-amount negative">
                {reportData.totalExpenses?.toFixed(2)} EGP
              </div>
              <div className="pl-breakdown">
                {reportData.expenseCategories?.map((expense, index) => (
                  <div key={index} className="pl-item">
                    <span>
                      {expense.expense_type === "general"
                        ? "General"
                        : "Recurring"}
                      :
                    </span>
                    <span>{expense.amount?.toFixed(2)} EGP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pl-card profit">
              <div className="pl-header">
                <h3>Net Profit</h3>
                <Target size={24} className="pl-icon" />
              </div>
              <div
                className={`pl-amount ${
                  reportData.netProfit >= 0 ? "positive" : "negative"
                }`}
              >
                {reportData.netProfit?.toFixed(2)} EGP
              </div>
              <div className="pl-breakdown">
                <div className="pl-item">
                  <span>Profit Margin:</span>
                  <span>{reportData.profitMargin?.toFixed(1)}%</span>
                </div>
                <div className="pl-item">
                  <span>Expense Ratio:</span>
                  <span>
                    {reportData.totalRevenue > 0
                      ? (
                          (reportData.totalExpenses / reportData.totalRevenue) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed P&L Statement */}
          <div className="pl-statement">
            <div className="statement-header">
              <h2>Profit & Loss Statement</h2>
              <p>
                Period:{" "}
                {selectedPeriod === "custom"
                  ? `${startDate} to ${endDate}`
                  : selectedPeriod}
              </p>
            </div>

            <div className="statement-table">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (EGP)</th>
                    <th>% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Income Section */}
                  <tr className="section-header">
                    <td>
                      <strong>INCOME</strong>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="indent">Service Revenue</td>
                    <td className="amount positive">
                      {reportData.serviceRevenue
                        ?.reduce((sum, s) => sum + (s.revenue || 0), 0)
                        ?.toFixed(2)}
                    </td>
                    <td className="percentage">
                      {reportData.totalRevenue > 0
                        ? (
                            (reportData.serviceRevenue?.reduce(
                              (sum, s) => sum + (s.revenue || 0),
                              0
                            ) /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td className="indent">Product Revenue</td>
                    <td className="amount positive">
                      {reportData.productSales
                        ?.reduce((sum, p) => sum + (p.revenue || 0), 0)
                        ?.toFixed(2)}
                    </td>
                    <td className="percentage">
                      {reportData.totalRevenue > 0
                        ? (
                            (reportData.productSales?.reduce(
                              (sum, p) => sum + (p.revenue || 0),
                              0
                            ) /
                              reportData.totalRevenue) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                  <tr className="subtotal">
                    <td>
                      <strong>Total Income</strong>
                    </td>
                    <td className="amount positive">
                      <strong>{reportData.totalRevenue?.toFixed(2)}</strong>
                    </td>
                    <td className="percentage">
                      <strong>100.0%</strong>
                    </td>
                  </tr>

                  {/* Expenses Section */}
                  <tr className="section-header">
                    <td>
                      <strong>EXPENSES</strong>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                  {reportData.expenseCategories?.map((expense, index) => (
                    <tr key={index}>
                      <td className="indent">
                        {expense.expense_type === "general"
                          ? "General Expenses"
                          : "Recurring Expenses"}
                      </td>
                      <td className="amount negative">
                        {expense.amount?.toFixed(2)}
                      </td>
                      <td className="percentage">
                        {reportData.totalRevenue > 0
                          ? (
                              (expense.amount / reportData.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                  <tr className="subtotal">
                    <td>
                      <strong>Total Expenses</strong>
                    </td>
                    <td className="amount negative">
                      <strong>{reportData.totalExpenses?.toFixed(2)}</strong>
                    </td>
                    <td className="percentage">
                      <strong>
                        {reportData.totalRevenue > 0
                          ? (
                              (reportData.totalExpenses /
                                reportData.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </strong>
                    </td>
                  </tr>

                  {/* Net Profit */}
                  <tr className="total-row">
                    <td>
                      <strong>NET PROFIT/LOSS</strong>
                    </td>
                    <td
                      className={`amount ${
                        reportData.netProfit >= 0 ? "positive" : "negative"
                      }`}
                    >
                      <strong>{reportData.netProfit?.toFixed(2)}</strong>
                    </td>
                    <td
                      className={`percentage ${
                        reportData.netProfit >= 0 ? "positive" : "negative"
                      }`}
                    >
                      <strong>{reportData.profitMargin?.toFixed(1)}%</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Expenses Table */}
          {reportData.detailedExpenses?.length > 0 && (
            <div className="data-table">
              <div className="table-header">
                <h2 className="table-title">
                  <Receipt size={20} />
                  Recent Expenses
                </h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.detailedExpenses
                    .slice(0, 10)
                    .map((expense, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </td>
                        <td>{expense.name}</td>
                        <td>
                          <span
                            className={`expense-type-badge ${expense.expense_type}`}
                          >
                            {expense.expense_type === "general"
                              ? "General"
                              : "Recurring"}
                          </span>
                        </td>
                        <td className="amount negative">
                          {expense.amount?.toFixed(2)} EGP
                        </td>
                        <td>{expense.notes || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">
                <Package size={20} />
                Product Sales Performance - Revenue & Units Sold
              </h2>
            </div>
            <div className="chart-container">
              {reportData.productSales?.length > 0 ? (
                <Bar data={productPerformanceData} options={chartOptions} />
              ) : (
                <div className="empty-state">
                  <p>No product sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          {reportData.lowStockProducts?.length > 0 && (
            <div className="data-table">
              <div className="table-header">
                <h2 className="table-title">
                  <AlertTriangle size={20} className="warning-icon" />
                  Low Stock Alert
                </h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStockProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="product-name">{product.name}</td>
                      <td className="stock-critical">
                        {product.stock_quantity}
                      </td>
                      <td>{product.reorder_level}</td>
                      <td>{product.supplier_name || "No Supplier"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Staff Performance Tab */}
      {activeTab === "staff" && (
        <>
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">
                <Users size={20} />
                Barber Performance Analysis - Revenue & Transactions
              </h2>
            </div>
            <div className="chart-container">
              {reportData.barberPerformance?.length > 0 ? (
                <Bar data={barberPerformanceData} options={chartOptions} />
              ) : (
                <div className="empty-state">
                  <p>No barber performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Staff Performance Table */}
          <div className="data-table">
            <div className="table-header">
              <h2 className="table-title">Detailed Staff Performance</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Barber</th>
                  <th>Transactions</th>
                  <th>Total Revenue</th>
                  <th>Avg. per Transaction</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {reportData.barberPerformance?.map((barber, index) => (
                  <tr key={index}>
                    <td className="barber-name">{barber.name}</td>
                    <td>{barber.count}</td>
                    <td className="amount">{barber.revenue?.toFixed(2)} EGP</td>
                    <td>{(barber.revenue / barber.count).toFixed(2)} EGP</td>
                    <td>
                      <span
                        className={`performance-badge ${
                          index === 0
                            ? "top-performer"
                            : index === 1
                            ? "good-performer"
                            : "average-performer"
                        }`}
                      >
                        {index === 0
                          ? " Top Performer"
                          : index === 1
                          ? " Good"
                          : " Average"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Staff Insights */}
          <div className="insights-grid">
            <div className="insight-card staff-insight">
              <h3 className="insight-title"> Top Performer</h3>
              <p className="insight-description">
                {reportData.barberPerformance?.[0]?.name || "Your top barber"}{" "}
                is leading with{" "}
                {reportData.barberPerformance?.[0]?.revenue?.toFixed(2)} EGP in
                revenue. Consider recognizing their excellent performance!
              </p>
            </div>
            <div className="insight-card growth-insight">
              <h3 className="insight-title">Growth Opportunity</h3>
              <p className="insight-description">
                Focus on training and development for lower-performing staff
                members to boost overall team productivity and customer
                satisfaction.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          <div className="data-table">
            <div className="table-header">
              <h2 className="table-title">
                <CreditCard size={20} />
                Transaction Management
              </h2>
              <button
                className="action-btn primary"
                onClick={() => setShowAddTransaction(true)}
              >
                <Plus size={16} />
                Add Transaction
              </button>
            </div>

            {/* Add Transaction Form */}
            {showAddTransaction && (
              <div className="transaction-form">
                <h3>Add New Transaction</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={newTransaction.customer_name}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        customer_name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Barber Name"
                    value={newTransaction.barber_name}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        barber_name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Total Amount"
                    value={newTransaction.total}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        total: e.target.value,
                      })
                    }
                  />
                  <select
                    value={newTransaction.payment_method}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                  <input
                    type="date"
                    value={newTransaction.service_date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        service_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="action-btn primary"
                    onClick={handleAddTransaction}
                  >
                    <Save size={16} />
                    Save Transaction
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => setShowAddTransaction(false)}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Barber</th>
                  <th>Payment Method</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {editingTransaction?.id === transaction.id ? (
                        <input
                          type="date"
                          value={editingTransaction.service_date}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              service_date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        new Date(transaction.service_date).toLocaleDateString()
                      )}
                    </td>
                    <td>
                      {editingTransaction?.id === transaction.id ? (
                        <input
                          type="text"
                          value={editingTransaction.customer_name}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              customer_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        transaction.customer_name
                      )}
                    </td>
                    <td>
                      {editingTransaction?.id === transaction.id ? (
                        <input
                          type="text"
                          value={editingTransaction.barber_name}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              barber_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        transaction.barber_name
                      )}
                    </td>
                    <td>
                      {editingTransaction?.id === transaction.id ? (
                        <select
                          value={editingTransaction.payment_method}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              payment_method: e.target.value,
                            })
                          }
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                        </select>
                      ) : (
                        <span
                          className={`payment-badge ${transaction.payment_method}`}
                        >
                          {transaction.payment_method?.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingTransaction?.id === transaction.id ? (
                        <input
                          type="number"
                          value={editingTransaction.total}
                          onChange={(e) =>
                            setEditingTransaction({
                              ...editingTransaction,
                              total: parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span className="amount">
                          {transaction.total?.toFixed(2)} EGP
                        </span>
                      )}
                    </td>
                    <td>
                      {editingTransaction?.id === transaction.id ? (
                        <div className="action-buttons">
                          <button
                            className="action-btn-small primary"
                            onClick={handleSaveTransaction}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            className="action-btn-small"
                            onClick={() => setEditingTransaction(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="action-btn-small"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="action-btn-small danger"
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Recent Transactions Table (for other tabs) */}
      {activeTab !== "transactions" && (
        <div className="data-table">
          <div className="table-header">
            <h2 className="table-title">
              <Clock size={20} />
              Recent Transactions
            </h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Barber</th>
                <th>Services/Products</th>
                <th>Payment Method</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentTransactions
                ?.slice(0, 10)
                .map((transaction, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="customer-name">
                      {transaction.customer_name}
                    </td>
                    <td>{transaction.barber_name}</td>
                    <td>
                      <div className="transaction-items">
                        {transaction.items
                          ?.map((item) => item.name)
                          .join(", ") || "N/A"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${
                          transaction.payment_method === "cash"
                            ? "cash"
                            : "card"
                        }`}
                      >
                        {transaction.payment_method?.toUpperCase() || "CASH"}
                      </span>
                    </td>
                    <td className="amount">
                      {transaction.total?.toFixed(2)} EGP
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
