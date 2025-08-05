import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Users,
  UserPlus,
  Scissors,
  AlertTriangle,
} from "lucide-react";
import "../styles/ManageBarbers.css";

export default function ManageBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [editingBarber, setEditingBarber] = useState(null);
  const [newBarber, setNewBarber] = useState({
    name: "",
    mobile: "",
    specialty_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const fetchBarbers = async () => {
    try {
      const res = await fetch("/api/barbers");
      if (!res.ok) throw new Error("Failed to fetch barbers");
      const data = await res.json();
      setBarbers(data);
    } catch (err) {
      console.error("Failed to fetch barbers:", err);
      setError("Failed to load barbers");
      setBarbers([]);
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchServices();
  }, []);

  const addBarber = async () => {
    if (
      !newBarber.name.trim() ||
      !newBarber.mobile.trim() ||
      newBarber.specialty_ids.length === 0
    ) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBarber.name.trim(),
          mobile: newBarber.mobile.trim(),
          specialty_ids: newBarber.specialty_ids.join(","),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add barber");
      }

      setNewBarber({ name: "", mobile: "", specialty_ids: [] });

      fetchBarbers();
    } catch (err) {
      console.error("Error adding barber:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBarber = async (id, updatedBarber) => {
    if (
      !updatedBarber.name.trim() ||
      !updatedBarber.mobile.trim() ||
      !updatedBarber.specialty_ids ||
      updatedBarber.specialty_ids.length === 0
    ) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/barbers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedBarber.name.trim(),
          mobile: updatedBarber.mobile.trim(),
          specialty_ids: Array.isArray(updatedBarber.specialty_ids)
            ? updatedBarber.specialty_ids.join(",")
            : updatedBarber.specialty_ids,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update barber");
      }

      setEditingBarber(null);
      fetchBarbers();
    } catch (err) {
      console.error("Error updating barber:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBarber = async (id) => {
    setDeleteConfirmation({
      id: id,
      barber: barbers.find((b) => b.id === id),
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
      const res = await fetch(`/api/barbers/${deleteConfirmation.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete barber");
      }

      setDeleteConfirmation(null);
      fetchBarbers();
    } catch (err) {
      console.error("Error deleting barber:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServices([]);
    }
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="manage-barbers-page">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>Confirm Delete Barber</h2>
              <button className="close-btn" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <AlertTriangle size={48} className="alert-icon" />
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteConfirmation.barber?.name}</strong>? This action
                cannot be undone and will remove all associated data.
              </p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  Cancel
                </button>
                <button
                  className="delete-button"
                  onClick={proceedWithDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete Barber"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Barber Card */}
      <div className="barbers-card">
        <div className="card-header">
          <div className="header-info">
            <h2>
              <UserPlus size={20} />
              Add New Barber
            </h2>
            <p className="subtext">Add a new barber to your team</p>
          </div>
        </div>

        <div className="barber-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g., Ahmed Hassan"
              value={newBarber.name}
              onChange={(e) =>
                setNewBarber({ ...newBarber, name: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              placeholder="e.g., +20 123 456 7890"
              value={newBarber.mobile}
              onChange={(e) =>
                setNewBarber({ ...newBarber, mobile: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="form-group specialty-group">
            <label>Specialties</label>
            <div className="specialties-container">
              <div className="specialties-header">
                <span className="selected-count">
                  {newBarber.specialty_ids.length} of {services.length} selected
                </span>
                {newBarber.specialty_ids.length > 0 && (
                  <button
                    type="button"
                    className="clear-all-btn"
                    onClick={() =>
                      setNewBarber({ ...newBarber, specialty_ids: [] })
                    }
                    disabled={loading}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service.id} className="service-item">
                    <label className="service-checkbox">
                      <input
                        type="checkbox"
                        checked={newBarber.specialty_ids.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewBarber({
                              ...newBarber,
                              specialty_ids: [
                                ...newBarber.specialty_ids,
                                service.id,
                              ],
                            });
                          } else {
                            setNewBarber({
                              ...newBarber,
                              specialty_ids: newBarber.specialty_ids.filter(
                                (id) => id !== service.id
                              ),
                            });
                          }
                        }}
                        disabled={loading}
                      />
                      <div className="checkbox-custom"></div>
                      <span className="service-name">{service.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="add-button"
              onClick={addBarber}
              disabled={loading}
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Barber"}
            </button>
          </div>
        </div>
      </div>

      {/* Barbers Grid */}
      <div className="barbers-list">
        {barbers.map((barber) => (
          <div key={barber.id} className="barber-card">
            <div className="barber-header">
              <div className="barber-avatar">{getInitials(barber.name)}</div>
              <div className="barber-info">
                <div className="barber-name">{barber.name}</div>
                <div className="barber-mobile">{barber.mobile}</div>
              </div>
            </div>

            {editingBarber?.id === barber.id ? (
              <div className="barber-edit-form">
                <div className="edit-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editingBarber.name}
                    onChange={(e) =>
                      setEditingBarber({
                        ...editingBarber,
                        name: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="edit-group">
                  <label>Mobile</label>
                  <input
                    type="tel"
                    value={editingBarber.mobile}
                    onChange={(e) =>
                      setEditingBarber({
                        ...editingBarber,
                        mobile: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="edit-group specialty-group">
                  <label>Specialties</label>
                  <div className="specialties-container">
                    <div className="specialties-header">
                      <span className="selected-count">
                        {editingBarber.specialty_ids?.length || 0} of{" "}
                        {services.length} selected
                      </span>
                      {editingBarber.specialty_ids?.length > 0 && (
                        <button
                          type="button"
                          className="clear-all-btn"
                          onClick={() =>
                            setEditingBarber({
                              ...editingBarber,
                              specialty_ids: [],
                            })
                          }
                          disabled={loading}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="services-grid">
                      {services.map((service) => (
                        <div key={service.id} className="service-item">
                          <label className="service-checkbox">
                            <input
                              type="checkbox"
                              checked={
                                editingBarber.specialty_ids?.includes(
                                  service.id
                                ) || false
                              }
                              onChange={(e) => {
                                const currentIds =
                                  editingBarber.specialty_ids || [];
                                if (e.target.checked) {
                                  setEditingBarber({
                                    ...editingBarber,
                                    specialty_ids: [...currentIds, service.id],
                                  });
                                } else {
                                  setEditingBarber({
                                    ...editingBarber,
                                    specialty_ids: currentIds.filter(
                                      (id) => id !== service.id
                                    ),
                                  });
                                }
                              }}
                              disabled={loading}
                            />
                            <div className="checkbox-custom"></div>
                            <span className="service-name">{service.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="barber-actions">
                  <button
                    className="save-button"
                    onClick={() => updateBarber(barber.id, editingBarber)}
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setEditingBarber(null)}
                    disabled={loading}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="barber-details">
                  <div className="barber-specialty">
                    {barber.specialty_names || "No specialties"}
                  </div>
                </div>

                <div className="barber-actions">
                  <button
                    className="edit-button"
                    onClick={() => setEditingBarber(barber)}
                    disabled={loading}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteBarber(barber.id)}
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {barbers.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>No barbers yet</h3>
          <p>Add your first barber to get started</p>
        </div>
      )}

      {/* Summary Card */}
      {barbers.length > 0 && (
        <div className="summary-card">
          <div className="summary-info">
            <h4>
              <Scissors size={18} />
              Team Summary
            </h4>
            <div className="subtext">Total active barbers</div>
          </div>
          <div className="summary-count">{barbers.length}</div>
        </div>
      )}
    </div>
  );
}
