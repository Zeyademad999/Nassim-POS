import React, { useEffect, useState } from "react";

export default function BarberForm({ barber, onSave, onCancel }) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(barber ? barber.name : "");
  }, [barber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // ✅ Send name and id if editing
    const barberData = barber?.id ? { id: barber.id, name } : { name };
    onSave(barberData);
  };

  return (
    <form onSubmit={handleSubmit} className="barber-form">
      <input
        type="text"
        value={name}
        placeholder="Barber Name"
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">{barber ? "Update" : "Add Barber"}</button>
      {barber && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
