import React, { useEffect, useState } from "react";
import { FaSave, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/ManageServices.css";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    description: "",
  });

  const fetchServices = async () => {
    const res = await fetch("/api/services");
    setServices(await res.json());
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (service) => {
    const method = service.id ? "PUT" : "POST";
    await fetch(`/api/services/${service.id || ""}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    setEditing(null);
    setNewService({ name: "", price: "" });
    fetchServices();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    fetchServices();
  };

  const handleEdit = (s) => {
    setEditing({ ...s });
  };

  return (
    <div className="manage-services-container">
      <div className="card add-service-card">
        <h2>Add New Service</h2>
        <p className="subtext">Create a new service for your barbershop</p>
        <div className="form-grid">
          <div>
            <label>Service Name</label>
            <input
              className="form-input service-name-input"
              type="text"
              placeholder="e.g., Hair Cut"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
            />
          </div>
          <div>
            <label>Price ($)</label>
            <input
              className="form-input service-price-input"
              type="number"
              placeholder="25.00"
              value={newService.price}
              onChange={(e) =>
                setNewService({
                  ...newService,
                  price: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="form-button">
            <button
              className="primary"
              onClick={() => {
                if (newService.name && newService.price > 0) {
                  handleSave(newService);
                }
              }}
            >
              + Add Service
            </button>
          </div>
          <div>
            <label>Description</label>
            <textarea
              className="description-textarea"
              placeholder="Optional description"
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="card services-list">
        <h3>Services Management</h3>
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
            {services.map((s) => (
              <tr key={s.id}>
                <td>
                  {editing?.id === s.id ? (
                    <input
                      className="service-name-input"
                      type="text"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                    />
                  ) : (
                    <strong>{s.name}</strong>
                  )}
                </td>

                <td>
                  {editing?.id === s.id ? (
                    <input
                      className="service-price-input"
                      type="number"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `$${s.price.toFixed(2)}`
                  )}
                </td>

                <td>
                  {editing?.id === s.id ? (
                    <textarea
                      className="description-textarea"
                      value={editing.description || ""}
                      onChange={(e) =>
                        setEditing({ ...editing, description: e.target.value })
                      }
                      rows={2}
                    />
                  ) : (
                    <span>{s.description || "—"}</span>
                  )}
                </td>

                <td>
                  {editing?.id === s.id ? (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => handleSave(editing)}
                        title="Save"
                      >
                        <FaSave />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setEditing(null)}
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => handleEdit(s)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(s.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
