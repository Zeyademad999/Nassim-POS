import React, { useEffect, useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import "../styles/ServiceForm.css";

export default function ServiceForm({ service, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPrice(service.price);
    } else {
      setName("");
      setPrice("");
    }
  }, [service]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (name.trim() && numericPrice >= 0) {
      onSave({ id: service?.id, name, price: numericPrice });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="service-form">
      <div className="form-row">
        <div className="form-group">
          <label>Service Name</label>
          <input
            type="text"
            value={name}
            placeholder="e.g., Hair Cut"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price ($)</label>
          <input
            type="number"
            value={price}
            placeholder="25.00"
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <button type="submit" className="icon-btn-submit" title="Add">
          +
        </button>
      </div>
    </form>
  );
}
