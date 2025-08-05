import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Scissors,
  DollarSign,
  FileText,
  Package,
  AlertTriangle,
} from "lucide-react";
import "../styles/ManageServices.css";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services");
      setServices([]);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (service) => {
    if (!service.name.trim() || !service.price || service.price <= 0) {
      setError("Service name and price are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const method = service.id ? "PUT" : "POST";
      const res = await fetch(`/api/services/${service.id || ""}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save service");
      }

      setEditing(null);
      setNewService({ name: "", price: "", description: "" });
      fetchServices();
    } catch (err) {
      console.error("Error saving service:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const service = services.find((s) => s.id === id);
    setDeleteConfirmation({
      id: id,
      service: service,
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
      const res = await fetch(`/api/services/${deleteConfirmation.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete service");
      }
      setDeleteConfirmation(null);
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setEditing({ ...s });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
    }).format(price);
  };

  return (
    <div className="manage-services-page">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add Service Card */}
      <div className="services-card">
        <div className="card-header">
          <div className="header-info">
            <h2>
              <Plus size={20} />
              Add New Service
            </h2>
            <p className="subtext">Create a new service for your barbershop</p>
          </div>
        </div>

        <div className="service-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <Scissors size={16} />
                Service Name
              </label>
              <input
                type="text"
                placeholder="e.g., Hair Cut"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <DollarSign size={16} />
                Price
              </label>
              <input
                type="number"
                placeholder="25.00"
                step="0.01"
                min="0"
                value={newService.price}
                onChange={(e) =>
                  setNewService({
                    ...newService,
                    price: parseFloat(e.target.value) || "",
                  })
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FileText size={16} />
              Description
            </label>
            <textarea
              placeholder="Optional description of the service"
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              className="add-button"
              onClick={() => handleSave(newService)}
              disabled={loading}
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Service"}
            </button>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="services-list-card">
        <div className="card-header">
          <div className="header-info">
            <h2>
              <Package size={20} />
              Services Management
            </h2>
            <p className="subtext">
              {services.length} service{services.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>
        </div>

        <div className="services-table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    {editing?.id === service.id ? (
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                        disabled={loading}
                      />
                    ) : (
                      <div className="service-name">
                        <Scissors size={16} />
                        <span>{service.name}</span>
                      </div>
                    )}
                  </td>

                  <td>
                    {editing?.id === service.id ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editing.price}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            price: parseFloat(e.target.value) || "",
                          })
                        }
                        disabled={loading}
                      />
                    ) : (
                      <span className="service-price">
                        {formatPrice(service.price)}
                      </span>
                    )}
                  </td>

                  <td>
                    {editing?.id === service.id ? (
                      <textarea
                        value={editing.description || ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                        disabled={loading}
                        rows={2}
                      />
                    ) : (
                      <span className="service-description">
                        {service.description || "—"}
                      </span>
                    )}
                  </td>

                  <td>
                    {editing?.id === service.id ? (
                      <div className="action-buttons">
                        <button
                          className="save-button"
                          onClick={() => handleSave(editing)}
                          disabled={loading}
                          title="Save"
                        >
                          <Save size={16} />
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => setEditing(null)}
                          disabled={loading}
                          title="Cancel"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(service)}
                          disabled={loading}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(service.id)}
                          disabled={loading}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {services.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>No services yet</h3>
            <p>Add your first service to get started</p>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {services.length > 0 && (
        <div className="summary-card">
          <div className="summary-info">
            <h4>
              <Package size={18} />
              Services Summary
            </h4>
            <div className="subtext">Total services available</div>
          </div>
          <div className="summary-count">{services.length}</div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>Confirm Delete Service</h2>
              <button className="close-btn" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <AlertTriangle size={48} className="alert-icon" />
              <p>
                Are you sure you want to delete the service{" "}
                <strong>"{deleteConfirmation.service?.name}"</strong>?
                <br />
                <span className="service-details-text">
                  Price: {formatPrice(deleteConfirmation.service?.price)}
                  {deleteConfirmation.service?.description && (
                    <>
                      <br />
                      Description: {deleteConfirmation.service.description}
                    </>
                  )}
                </span>
                <br />
                This action cannot be undone and will remove all associated
                data.
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
                  {loading ? "Deleting..." : "Delete Service"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
