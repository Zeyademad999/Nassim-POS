import React, { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Users, UserPlus } from "lucide-react";

const BarbersSection = ({ barbers, onUpdateBarbers }) => {
  const [editingBarber, setEditingBarber] = useState(null);
  const [newBarber, setNewBarber] = useState({ name: "" });

  const addBarber = () => {
    if (newBarber.name.trim()) {
      const barber = {
        id: Date.now().toString(),
        name: newBarber.name.trim(),
      };
      onUpdateBarbers([...barbers, barber]);
      setNewBarber({ name: "" });
    }
  };

  const updateBarber = (id, updatedBarber) => {
    const updated = barbers.map((barber) =>
      barber.id === id ? { ...barber, ...updatedBarber } : barber
    );
    onUpdateBarbers(updated);
    setEditingBarber(null);
  };

  const deleteBarber = (id) => {
    onUpdateBarbers(barbers.filter((barber) => barber.id !== id));
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="manage-barbers-page">
      {/* Add Barber Card */}
      <div className="barbers-card">
        <h2>
          <UserPlus size={18} />
          Add New Barber
        </h2>
        <p className="subtext">Add a new barber to your team</p>
        <input
          type="text"
          placeholder="e.g., Ahmed Hassan"
          value={newBarber.name}
          onChange={(e) => setNewBarber({ name: e.target.value })}
        />
        <button onClick={addBarber}>
          <Plus size={16} />
          Add Barber
        </button>
      </div>

      {/* Barbers Grid */}
      <div className="barbers-list">
        {barbers.map((barber) => (
          <div key={barber.id} className="barber-card">
            <div className="barber-avatar">{getInitials(barber.name)}</div>
            {editingBarber?.id === barber.id ? (
              <>
                <input
                  type="text"
                  value={editingBarber.name}
                  onChange={(e) =>
                    setEditingBarber({ ...editingBarber, name: e.target.value })
                  }
                />
                <div className="barber-actions">
                  <button
                    onClick={() => updateBarber(barber.id, editingBarber)}
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button onClick={() => setEditingBarber(null)}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="barber-name">{barber.name}</div>
                <div className="barber-role">Professional Barber</div>
                <div className="barber-actions">
                  <button onClick={() => setEditingBarber(barber)}>
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button onClick={() => deleteBarber(barber.id)}>
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Summary Card */}
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
    </div>
  );
};

export default BarbersSection;
