import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Users, UserPlus } from "lucide-react";
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

  // Replace this entire updateBarber function (lines 66-96):
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
    if (!confirm("Are you sure you want to delete this barber?")) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/barbers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete barber");
      }

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
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Add Barber Card */}
      <div className="barbers-card">
        <h2>
          <UserPlus size={18} />
          Add New Barber
        </h2>
        <p className="subtext">Add a new barber to your team</p>

        <div className="barber-form">
          <input
            type="text"
            placeholder="Full Name (e.g., Ahmed Hassan)"
            value={newBarber.name}
            onChange={(e) =>
              setNewBarber({ ...newBarber, name: e.target.value })
            }
            disabled={loading}
          />
          <input
            type="tel"
            placeholder="Mobile Number (e.g., +20 123 456 7890)"
            value={newBarber.mobile}
            onChange={(e) =>
              setNewBarber({ ...newBarber, mobile: e.target.value })
            }
            disabled={loading}
          />
          <div className="specialty-selector">
            <label>Specialties:</label>
            <div className="services-checkboxes">
              {services.map((service) => (
                <label key={service.id} className="service-checkbox">
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
                  {service.name}
                </label>
              ))}
            </div>
          </div>
          <button onClick={addBarber} disabled={loading}>
            <Plus size={16} />
            {loading ? "Adding..." : "Add Barber"}
          </button>
        </div>
      </div>

      {/* Barbers Grid */}
      <div className="barbers-list">
        {barbers.map((barber) => (
          <div key={barber.id} className="barber-card">
            <div className="barber-avatar">{getInitials(barber.name)}</div>
            {editingBarber?.id === barber.id ? (
              <div className="barber-edit-form">
                <input
                  type="text"
                  value={editingBarber.name}
                  onChange={(e) =>
                    setEditingBarber({ ...editingBarber, name: e.target.value })
                  }
                  disabled={loading}
                />
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
                <input
                  type="text"
                  value={editingBarber.specialty}
                  onChange={(e) =>
                    setEditingBarber({
                      ...editingBarber,
                      specialty: e.target.value,
                    })
                  }
                  disabled={loading}
                />
                <div className="barber-actions">
                  <button
                    onClick={() => updateBarber(barber.id, editingBarber)}
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
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
                <div className="barber-info">
                  <div className="barber-name">{barber.name}</div>
                  <div className="barber-specialty">
                    {barber.specialty_names || "No specialties"}
                  </div>

                  <div className="barber-mobile">{barber.mobile}</div>
                </div>
                <div className="barber-actions">
                  <button
                    onClick={() => setEditingBarber(barber)}
                    disabled={loading}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
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
          <div>
            <h4>
              <Users size={16} />
              Team Summary
            </h4>
            <div className="subtext">Total active barbers</div>
          </div>
          <span>{barbers.length}</span>
        </div>
      )}
    </div>
  );
}
