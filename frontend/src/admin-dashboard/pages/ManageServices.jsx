import React, { useEffect, useState } from "react";
import "../styles/ManageServices.css";
import { FaPlus, FaSave, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newService, setNewService] = useState({ name: "", price: "" });

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

  return (
    <div className="manage-services-container">
      <div className="card add-service-card">
        <h2>Add New Service</h2>
        <p className="subtext">Create a new service for your barbershop</p>
      </div>

      <div className="card services-list">
        <h3>Services Management</h3>
        <p className="subtext">Manage your services and pricing</p>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>
                  {editing?.id === s.id ? (
                    <input
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
                <td className="actions">
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
                        onClick={() => setEditing(s)}
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
