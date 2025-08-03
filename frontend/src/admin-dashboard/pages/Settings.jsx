// frontend/src/admin-dashboard/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Percent,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calculator,
} from "lucide-react";
import "../styles/Settings.css";

export default function Settings() {
  const [taxes, setTaxes] = useState([]);
  const [generalSettings, setGeneralSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tax form state
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [taxForm, setTaxForm] = useState({
    tax_name: "",
    tax_rate: "",
    description: "",
    is_enabled: true,
  });

  // General settings editing state
  const [editingSettings, setEditingSettings] = useState({});

  useEffect(() => {
    fetchTaxSettings();
    fetchGeneralSettings();
  }, []);

  const fetchTaxSettings = async () => {
    try {
      const res = await fetch("/api/settings/taxes");
      if (!res.ok) throw new Error("Failed to fetch tax settings");
      const data = await res.json();
      setTaxes(data);
    } catch (err) {
      console.error("Failed to fetch tax settings:", err);
      setError("Failed to load tax settings");
    }
  };

  const fetchGeneralSettings = async () => {
    try {
      const res = await fetch("/api/settings/general");
      if (!res.ok) throw new Error("Failed to fetch general settings");
      const data = await res.json();
      setGeneralSettings(data);
    } catch (err) {
      console.error("Failed to fetch general settings:", err);
      setError("Failed to load general settings");
    }
  };

  const handleTaxSubmit = async (e) => {
    e.preventDefault();

    if (!taxForm.tax_name.trim() || !taxForm.tax_rate) {
      setError("Tax name and rate are required");
      return;
    }

    const rate = parseFloat(taxForm.tax_rate);
    if (rate < 0 || rate > 100) {
      setError("Tax rate must be between 0 and 100");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = editingTax
        ? `/api/settings/taxes/${editingTax.id}`
        : "/api/settings/taxes";

      const method = editingTax ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taxForm,
          tax_rate: rate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save tax setting");
      }

      setSuccess(
        editingTax ? "Tax updated successfully!" : "Tax created successfully!"
      );
      setTaxForm({
        tax_name: "",
        tax_rate: "",
        description: "",
        is_enabled: true,
      });
      setEditingTax(null);
      setShowTaxForm(false);
      fetchTaxSettings();
    } catch (err) {
      console.error("Error saving tax:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTax = (tax) => {
    setEditingTax(tax);
    setTaxForm({
      tax_name: tax.tax_name,
      tax_rate: tax.tax_rate.toString(),
      description: tax.description || "",
      is_enabled: Boolean(tax.is_enabled),
    });
    setShowTaxForm(true);
  };

  const handleDeleteTax = async (id) => {
    if (!confirm("Are you sure you want to delete this tax setting?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/settings/taxes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete tax setting");
      }

      setSuccess("Tax deleted successfully!");
      fetchTaxSettings();
    } catch (err) {
      console.error("Error deleting tax:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSettingUpdate = async (settingKey, newValue) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/general/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_value: newValue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update setting");
      }

      setSuccess("Setting updated successfully!");
      setEditingSettings({});
      fetchGeneralSettings();
    } catch (err) {
      console.error("Error updating setting:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalTaxRate = () => {
    return taxes
      .filter((tax) => tax.is_enabled)
      .reduce((sum, tax) => sum + tax.tax_rate, 0);
  };

  const cancelTaxForm = () => {
    setShowTaxForm(false);
    setEditingTax(null);
    setTaxForm({
      tax_name: "",
      tax_rate: "",
      description: "",
      is_enabled: true,
    });
  };

  return (
    <div className="settings-page">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={16} />
          {success}
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      <div className="settings-header">
        <h1>
          <SettingsIcon size={24} />
          System Settings
        </h1>
        <p>Configure taxes, business information, and system preferences</p>
      </div>

      <div className="settings-content">
        {/* Tax Settings Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2>
              <Percent size={18} />
              Tax Configuration
            </h2>
            <button
              onClick={() => setShowTaxForm(true)}
              className="btn-primary"
              disabled={loading}
            >
              <Plus size={16} />
              Add Tax
            </button>
          </div>

          {/* Tax Summary */}
          <div className="tax-summary">
            <div className="summary-item">
              <Calculator size={16} />
              <span>
                Total Tax Rate: <strong>{getTotalTaxRate().toFixed(2)}%</strong>
              </span>
            </div>
            <div className="summary-item">
              <span>
                Active Taxes:{" "}
                <strong>{taxes.filter((t) => t.is_enabled).length}</strong>
              </span>
            </div>
          </div>

          {/* Tax Form */}
          {showTaxForm && (
            <div className="tax-form-container">
              <h3>{editingTax ? "Edit Tax Setting" : "Add New Tax"}</h3>
              <form onSubmit={handleTaxSubmit} className="tax-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tax Name *</label>
                    <input
                      type="text"
                      value={taxForm.tax_name}
                      onChange={(e) =>
                        setTaxForm((prev) => ({
                          ...prev,
                          tax_name: e.target.value,
                        }))
                      }
                      placeholder="e.g., VAT, Sales Tax"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax Rate (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxForm.tax_rate}
                      onChange={(e) =>
                        setTaxForm((prev) => ({
                          ...prev,
                          tax_rate: e.target.value,
                        }))
                      }
                      placeholder="8.00"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={taxForm.description}
                    onChange={(e) =>
                      setTaxForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={taxForm.is_enabled}
                      onChange={(e) =>
                        setTaxForm((prev) => ({
                          ...prev,
                          is_enabled: e.target.checked,
                        }))
                      }
                      disabled={loading}
                    />
                    Enable this tax
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    <Save size={16} />
                    {loading
                      ? "Saving..."
                      : editingTax
                      ? "Update Tax"
                      : "Add Tax"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelTaxForm}
                    disabled={loading}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tax List */}
          <div className="tax-list">
            {taxes.length === 0 ? (
              <div className="empty-state">
                <Percent size={48} />
                <h3>No taxes configured</h3>
                <p>Add your first tax to get started</p>
              </div>
            ) : (
              taxes.map((tax) => (
                <div
                  key={tax.id}
                  className={`tax-item ${
                    tax.is_enabled ? "enabled" : "disabled"
                  }`}
                >
                  <div className="tax-info">
                    <div className="tax-header">
                      <h4>{tax.tax_name}</h4>
                      <span className="tax-rate">{tax.tax_rate}%</span>
                      <span
                        className={`tax-status ${
                          tax.is_enabled ? "active" : "inactive"
                        }`}
                      >
                        {tax.is_enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {tax.description && (
                      <p className="tax-description">{tax.description}</p>
                    )}
                  </div>
                  <div className="tax-actions">
                    <button
                      onClick={() => handleEditTax(tax)}
                      disabled={loading}
                      title="Edit tax"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTax(tax.id)}
                      disabled={loading}
                      className="btn-danger"
                      title="Delete tax"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* General Settings Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2>
              <Building size={18} />
              Business Information
            </h2>
          </div>

          {Object.entries(generalSettings).map(([category, settings]) => (
            <div key={category} className="settings-category">
              <h3>
                {category.charAt(0).toUpperCase() + category.slice(1)} Settings
              </h3>
              <div className="settings-list">
                {settings.map((setting) => (
                  <div key={setting.setting_key} className="setting-item">
                    <div className="setting-info">
                      <label>
                        {setting.description ||
                          setting.setting_key.replace(/_/g, " ")}
                      </label>
                      {editingSettings[setting.setting_key] ? (
                        <div className="setting-edit">
                          <input
                            type={
                              setting.setting_type === "number"
                                ? "number"
                                : "text"
                            }
                            value={editingSettings[setting.setting_key]}
                            onChange={(e) =>
                              setEditingSettings((prev) => ({
                                ...prev,
                                [setting.setting_key]: e.target.value,
                              }))
                            }
                            disabled={loading}
                          />
                          <div className="edit-actions">
                            <button
                              onClick={() =>
                                handleGeneralSettingUpdate(
                                  setting.setting_key,
                                  editingSettings[setting.setting_key]
                                )
                              }
                              disabled={loading}
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() =>
                                setEditingSettings((prev) => {
                                  const newState = { ...prev };
                                  delete newState[setting.setting_key];
                                  return newState;
                                })
                              }
                              disabled={loading}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="setting-display">
                          <span className="setting-value">
                            {setting.setting_value}
                          </span>
                          <button
                            onClick={() =>
                              setEditingSettings((prev) => ({
                                ...prev,
                                [setting.setting_key]: setting.setting_value,
                              }))
                            }
                            disabled={loading}
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
