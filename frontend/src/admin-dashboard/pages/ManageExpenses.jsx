import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  DollarSign,
  Calendar,
  Receipt,
  TrendingDown,
  FileText,
  Search,
  Filter,
  Repeat,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/ManageExpenses.css";

export default function ManageExpenses() {
  const { t, isRTL } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [selectedType, setSelectedType] = useState("all");
  const [stats, setStats] = useState(null);

  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    expense_type: "general",
    notes: "",
  });

  const periodOptions = [
    { value: "today", label: t("Today") },
    { value: "7days", label: t("Last 7 Days") },
    { value: "30days", label: t("Last 30 Days") },
    { value: "3months", label: t("Last 3 Months") },
    { value: "year", label: t("This Year") },
    { value: "all", label: t("All Time") },
  ];

  const expenseTypes = [
    { value: "all", label: t("All Types") },
    { value: "general", label: t("General Expenses") },
    { value: "recurring", label: t("Recurring Expenses") },
  ];

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [selectedPeriod, selectedType]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        type: selectedType,
        limit: 100,
      });

      const res = await fetch(`/api/expenses?${params}`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      setError(t("Failed to load expenses"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({ period: selectedPeriod });
      const res = await fetch(`/api/expenses/stats/summary?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleAddExpense = async () => {
    if (
      !newExpense.name.trim() ||
      !newExpense.amount ||
      !newExpense.expense_date
    ) {
      setError(t("Name, amount, and date are required"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("Failed to add expense"));
      }

      setShowAddExpense(false);
      setNewExpense({
        name: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        expense_type: "general",
        notes: "",
      });
      fetchExpenses();
      fetchStats();
    } catch (err) {
      console.error("Error adding expense:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    if (
      !expenseData.name.trim() ||
      !expenseData.amount ||
      !expenseData.expense_date
    ) {
      setError(t("Name, amount, and date are required"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expenseData,
          amount: parseFloat(expenseData.amount),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("Failed to update expense"));
      }

      setEditingExpense(null);
      fetchExpenses();
      fetchStats();
    } catch (err) {
      console.error("Error updating expense:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm(t("Are you sure you want to delete this expense?"))) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("Failed to delete expense"));
      }

      fetchExpenses();
      fetchStats();
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "recurring":
        return <Repeat size={14} className="recurring-icon" />;
      case "general":
      default:
        return <Receipt size={14} className="general-icon" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "recurring":
        return t("Recurring");
      case "general":
      default:
        return t("General");
    }
  };

  return (
    <div className={`manage-expenses-page ${isRTL ? "rtl" : "ltr"}`}>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="expenses-header">
        <div className="header-left">
          <h1>
            <Receipt size={24} />
            {t("Expense Tracking")}
          </h1>
          <p className="subtext">{t("Track your business expenses")}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddExpense(true)}>
          <Plus size={16} />
          {t("Add Expense")}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="expense-stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <Receipt size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.total_expenses}</h3>
              <p>{t("Total Expenses")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amount">
              <TrendingDown size={20} />
            </div>
            <div className="stat-content">
              <h3>
                {stats.summary.total_amount?.toFixed(0)} {t("currency")}
              </h3>
              <p>{t("Total Amount")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon general">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.general_amount?.toFixed(0)} EGP</h3>
              <p>{t("General Expenses")}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon recurring">
              <Repeat size={20} />
            </div>
            <div className="stat-content">
              <h3>{stats.summary.recurring_amount?.toFixed(0)} EGP</h3>
              <p>{t("Recurring Expenses")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="expense-filters">
        <div className="filter-group">
          <label>{t("Time Period")}</label>
          <select
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
        <div className="filter-group">
          <label>{t("Expense Type")}</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {expenseTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="expenses-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t("Loading expenses...")}</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <Receipt size={48} />
            <h3>{t("No expenses found")}</h3>
            <p>
              {selectedPeriod !== "all" || selectedType !== "all"
                ? t("No expenses match your current filters")
                : t("Start tracking your business expenses")}
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowAddExpense(true)}
            >
              <Plus size={16} />
              {t("Add First Expense")}
            </button>
          </div>
        ) : (
          <div className="expenses-table-container">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th className="date-col">{t("Date")}</th>
                  <th className="name-col">{t("Name")}</th>
                  <th className="type-col">{t("Type")}</th>
                  <th className="amount-col">{t("Amount")}</th>
                  <th className="notes-col">{t("Notes")}</th>
                  <th className="actions-col">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="date-col">
                      {editingExpense?.id === expense.id ? (
                        <input
                          type="date"
                          value={editingExpense.expense_date}
                          onChange={(e) =>
                            setEditingExpense({
                              ...editingExpense,
                              expense_date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="expense-date">
                          <Calendar size={14} />
                          <span>
                            {new Date(
                              expense.expense_date
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="name-col">
                      {editingExpense?.id === expense.id ? (
                        <input
                          type="text"
                          value={editingExpense.name}
                          onChange={(e) =>
                            setEditingExpense({
                              ...editingExpense,
                              name: e.target.value,
                            })
                          }
                          placeholder={t("Expense name")}
                        />
                      ) : (
                        <span className="expense-name">{expense.name}</span>
                      )}
                    </td>
                    <td className="type-col">
                      {editingExpense?.id === expense.id ? (
                        <select
                          value={editingExpense.expense_type}
                          onChange={(e) =>
                            setEditingExpense({
                              ...editingExpense,
                              expense_type: e.target.value,
                            })
                          }
                        >
                          <option value="general">{t("General")}</option>
                          <option value="recurring">{t("Recurring")}</option>
                        </select>
                      ) : (
                        <div className="expense-type">
                          {getTypeIcon(expense.expense_type)}
                          <span>{getTypeLabel(expense.expense_type)}</span>
                        </div>
                      )}
                    </td>
                    <td className="amount-col">
                      {editingExpense?.id === expense.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editingExpense.amount}
                          onChange={(e) =>
                            setEditingExpense({
                              ...editingExpense,
                              amount: e.target.value,
                            })
                          }
                          placeholder={t("amountPlaceholder")}
                        />
                      ) : (
                        <span className="expense-amount">
                          <DollarSign size={14} />
                          {expense.amount?.toFixed(2)} {t("currency")}
                        </span>
                      )}
                    </td>
                    <td className="notes-col">
                      {editingExpense?.id === expense.id ? (
                        <input
                          type="text"
                          value={editingExpense.notes || ""}
                          onChange={(e) =>
                            setEditingExpense({
                              ...editingExpense,
                              notes: e.target.value,
                            })
                          }
                          placeholder={t("notesPlaceholder")}
                        />
                      ) : (
                        <span className="expense-notes">
                          {expense.notes || "-"}
                        </span>
                      )}
                    </td>
                    <td className="actions-col">
                      <div className="expense-actions">
                        {editingExpense?.id === expense.id ? (
                          <>
                            <button
                              className="action-btn save"
                              onClick={() =>
                                handleUpdateExpense(expense.id, editingExpense)
                              }
                              disabled={loading}
                              title={t("Save")}
                            >
                              <Save size={14} />
                            </button>
                            <button
                              className="action-btn cancel"
                              onClick={() => setEditingExpense(null)}
                              disabled={loading}
                              title={t("Cancel")}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="action-btn edit"
                              onClick={() => setEditingExpense(expense)}
                              disabled={loading}
                              title={t("Edit")}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={loading}
                              title={t("Delete")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t("Add New Expense")}</h2>
              <button onClick={() => setShowAddExpense(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="expense-form">
              <div className="form-group">
                <label>
                  {t("expenseNameLabel")} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={newExpense.name}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, name: e.target.value })
                  }
                  placeholder={t("expenseNamePlaceholder")}
                  disabled={loading}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    {t("Amount (EGP)")} <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    placeholder={t("amountPlaceholder")}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>
                    {t("Date")} <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        expense_date: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t("Expense Type")}</label>
                <select
                  value={newExpense.expense_type}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      expense_type: e.target.value,
                    })
                  }
                  disabled={loading}
                >
                  <option value="general">{t("General Expense")}</option>
                  <option value="recurring">{t("Recurring Expense")}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t("Notes (Optional)")}</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, notes: e.target.value })
                  }
                  placeholder={t("Add any additional notes...")}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddExpense(false)}
                  disabled={loading}
                >
                  <X size={16} />
                  {t("Cancel")}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddExpense}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? t("Adding...") : t("Add Expense")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
