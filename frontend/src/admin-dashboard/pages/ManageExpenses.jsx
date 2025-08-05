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
  Package,
  AlertTriangle,
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
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Category state management
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    expense_type: "general",
    notes: "",
    category: "", // Added category field
    recurrence_period: "", // in days
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
    fetchCategories(); // Added category fetching
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

  // Category management functions
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/expense-categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch expense categories:", err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("/api/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      if (res.ok) {
        setNewCategory("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Error adding expense category:", err);
    }
  };

  const updateCategory = async (id) => {
    try {
      const res = await fetch(`/api/expense-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategoryName.trim() }),
      });
      if (res.ok) {
        setEditingCategoryId(null);
        setEditingCategoryName("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Error updating expense category:", err);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm(t("Are you sure you want to delete this category?"))) return;
    try {
      await fetch(`/api/expense-categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (err) {
      console.error("Error deleting expense category:", err);
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
          recurrence_period:
            newExpense.expense_type === "recurring"
              ? parseInt(newExpense.recurrence_period)
              : null,
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
        category: "", // Reset category
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
    const expense = expenses.find((e) => e.id === id);
    setDeleteConfirmation({
      id: id,
      expense: expense,
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

  const proceedWithDelete = async () => {
    if (!deleteConfirmation?.id) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/expenses/${deleteConfirmation.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("Failed to delete expense"));
      }

      setDeleteConfirmation(null);
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
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn-secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            <Package size={16} />
            {t("Manage Categories")}
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowAddExpense(true)}
          >
            <Plus size={16} />
            {t("Add Expense")}
          </button>
        </div>
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
                  <th className="category-col">{t("Category")}</th>
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
                        <div className="edit-field">
                          <label className="edit-label">{t("Date")}:</label>
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
                        </div>
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
                        <div className="edit-field">
                          <label className="edit-label">{t("Name")}:</label>
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
                        </div>
                      ) : (
                        <span className="expense-name">{expense.name}</span>
                      )}
                    </td>
                    <td className="type-col">
                      {editingExpense?.id === expense.id ? (
                        <div className="edit-field">
                          <label className="edit-label">{t("Type")}:</label>
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
                        </div>
                      ) : (
                        <div className="expense-type">
                          {getTypeIcon(expense.expense_type)}
                          <span>{getTypeLabel(expense.expense_type)}</span>
                        </div>
                      )}
                    </td>
                    <td className="category-col">
                      {editingExpense?.id === expense.id ? (
                        <div className="edit-field">
                          <label className="edit-label">{t("Category")}:</label>
                          <select
                            value={editingExpense.category || ""}
                            onChange={(e) =>
                              setEditingExpense({
                                ...editingExpense,
                                category: e.target.value,
                              })
                            }
                          >
                            <option value="">{t("Select Category")}</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="expense-category">
                          {expense.category ? (
                            <span className="category-badge">
                              {expense.category}
                            </span>
                          ) : (
                            "-"
                          )}
                        </span>
                      )}
                    </td>
                    <td className="amount-col">
                      {editingExpense?.id === expense.id ? (
                        <div className="edit-field">
                          <label className="edit-label">{t("Amount")}:</label>
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
                        </div>
                      ) : (
                        <span className="expense-amount">
                          <DollarSign size={14} />
                          {expense.amount?.toFixed(2)} {t("currency")}
                        </span>
                      )}
                    </td>
                    <td className="notes-col">
                      {editingExpense?.id === expense.id ? (
                        <div className="edit-field">
                          <label className="edit-label">{t("Notes")}:</label>
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
                        </div>
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

              <div className="form-grid">
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
                  <label>{t("Category")}</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, category: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">{t("Select Category (Optional)")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newExpense.expense_type === "recurring" && (
                <div className="form-group">
                  <label>{t("Recurrence Period (Days)")}</label>
                  <input
                    type="number"
                    min="1"
                    value={newExpense.recurrence_period}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        recurrence_period: e.target.value,
                      })
                    }
                    placeholder="e.g. 30 for monthly"
                  />
                </div>
              )}

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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{t("Manage Expense Categories")}</h2>
              <button onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <div
                style={{ marginBottom: "20px", display: "flex", gap: "8px" }}
              >
                <input
                  className="form-input"
                  placeholder={t("New category name")}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={addCategory}>
                  <Plus size={16} />
                  {t("Add")}
                </button>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {editingCategoryId === cat.id ? (
                      <>
                        <input
                          className="form-input"
                          value={editingCategoryName}
                          onChange={(e) =>
                            setEditingCategoryName(e.target.value)
                          }
                          style={{ marginRight: "8px", flex: 1 }}
                        />
                        <button
                          className="btn-primary"
                          onClick={() => updateCategory(cat.id)}
                          style={{ marginRight: "8px" }}
                        >
                          {t("Save")}
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                          }}
                        >
                          {t("Cancel")}
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ flex: 1 }}>{cat.name}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryName(cat.name);
                            }}
                          >
                            <Edit2 size={14} />
                            {t("Edit")}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => deleteCategory(cat.id)}
                            style={{ color: "#dc2626" }}
                          >
                            <Trash2 size={14} />
                            {t("Delete")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "20px",
                  }}
                >
                  {t("No categories yet. Add your first category above.")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>{t("Confirm Delete Expense")}</h2>
              <button className="close-btn" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <AlertTriangle size={48} className="alert-icon" />
              <p>
                Are you sure you want to delete the expense{" "}
                <strong>"{deleteConfirmation.expense?.name}"</strong>?
                <br />
                <span className="expense-details-text">
                  Amount: {deleteConfirmation.expense?.amount?.toFixed(2)} EGP
                  <br />
                  Date:{" "}
                  {new Date(
                    deleteConfirmation.expense?.expense_date
                  ).toLocaleDateString()}
                  <br />
                  Type: {getTypeLabel(deleteConfirmation.expense?.expense_type)}
                  {deleteConfirmation.expense?.category && (
                    <>
                      <br />
                      Category: {deleteConfirmation.expense.category}
                    </>
                  )}
                </span>
                <br />
                This action cannot be undone and will remove all associated
                data.
              </p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  {t("Cancel")}
                </button>
                <button
                  className="delete-button"
                  onClick={proceedWithDelete}
                  disabled={loading}
                >
                  {loading ? t("Deleting...") : t("Delete Expense")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
