import React, { useEffect, useState } from "react";
import "../styles/BarberProfiles.css";

export default function BarberProfiles() {
  const [barbers, setBarbers] = useState([]);
  const [newBarber, setNewBarber] = useState({
    name: "",
    mobile: "",
    specialty: "",
  });

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    const res = await fetch("/api/barbers");
    const data = await res.json();
    setBarbers(data);
  };

  const handleAdd = async () => {
    if (!newBarber.name.trim()) return;
    await fetch("/api/barbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBarber),
    });
    setNewBarber({ name: "", mobile: "", specialty: "" });
    fetchBarbers();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/barbers/${id}`, { method: "DELETE" });
    fetchBarbers();
  };

  return (
    <div className="barber-profiles">
      <h2>Barber Profiles</h2>
      <div className="barber-form">
        <input
          placeholder="Name"
          value={newBarber.name}
          onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
        />
        <input
          placeholder="Mobile"
          value={newBarber.mobile}
          onChange={(e) =>
            setNewBarber({ ...newBarber, mobile: e.target.value })
          }
        />
        <input
          placeholder="Specialty"
          value={newBarber.specialty}
          onChange={(e) =>
            setNewBarber({ ...newBarber, specialty: e.target.value })
          }
        />
        <button onClick={handleAdd}>Add Barber</button>
      </div>

      <div className="barber-list">
        {barbers.map((b) => (
          <div key={b.id} className="barber-item">
            <strong>{b.name}</strong> — {b.specialty} | 📞 {b.mobile}
            <button onClick={() => handleDelete(b.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
