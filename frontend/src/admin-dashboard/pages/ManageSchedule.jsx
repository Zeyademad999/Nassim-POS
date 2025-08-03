// frontend/src/admin-dashboard/pages/ManageSchedule.jsx
import React, { useEffect, useState } from "react";
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import "../styles/ManageSchedule.css";

export default function ManageSchedule() {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTimeOff, setNewTimeOff] = useState({
    startDate: "",
    endDate: "",
    reason: "Personal",
    notes: "",
  });

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const defaultSchedule = daysOfWeek.map((day, index) => ({
    dayOfWeek: index,
    dayName: day,
    isWorking: index >= 1 && index <= 5, // Monday to Friday default
    startTime: "09:00",
    endTime: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
  }));

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      fetchBarberSchedule(selectedBarber.id);
    }
  }, [selectedBarber]);

  const fetchBarbers = async () => {
    try {
      const res = await fetch("/api/barbers");
      if (!res.ok) throw new Error("Failed to fetch barbers");
      const data = await res.json();
      setBarbers(data);
      if (data.length > 0 && !selectedBarber) {
        setSelectedBarber(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch barbers:", err);
      setError("Failed to load barbers");
    }
  };

  const fetchBarberSchedule = async (barberId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/barber-schedule/${barberId}`);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const data = await res.json();

      // Merge fetched schedule with default schedule
      const mergedSchedule = defaultSchedule.map((defaultDay) => {
        const existingDay = data.schedule.find(
          (s) => s.day_of_week === defaultDay.dayOfWeek
        );
        if (existingDay) {
          return {
            dayOfWeek: defaultDay.dayOfWeek,
            dayName: defaultDay.dayName,
            isWorking: Boolean(existingDay.is_working),
            startTime: existingDay.start_time,
            endTime: existingDay.end_time,
            breakStart: existingDay.break_start,
            breakEnd: existingDay.break_end,
          };
        }
        return defaultDay;
      });

      setSchedule(mergedSchedule);
      setTimeOff(data.timeOff || []);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
      // Use default schedule if no existing schedule
      setSchedule(defaultSchedule);
      setTimeOff([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async () => {
    if (!selectedBarber) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/barber-schedule/${selectedBarber.id}/schedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weeklySchedule: schedule }),
        }
      );

      if (!res.ok) throw new Error("Failed to update schedule");

      alert("Schedule updated successfully!");
    } catch (err) {
      console.error("Failed to update schedule:", err);
      setError("Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  const addTimeOff = async () => {
    if (!selectedBarber || !newTimeOff.startDate || !newTimeOff.endDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `/api/barber-schedule/${selectedBarber.id}/time-off`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTimeOff),
        }
      );

      if (!res.ok) throw new Error("Failed to add time off");

      setNewTimeOff({
        startDate: "",
        endDate: "",
        reason: "Personal",
        notes: "",
      });

      fetchBarberSchedule(selectedBarber.id);
    } catch (err) {
      console.error("Failed to add time off:", err);
      setError("Failed to add time off");
    } finally {
      setLoading(false);
    }
  };

  const removeTimeOff = async (timeOffId) => {
    if (!selectedBarber || !confirm("Remove this time off period?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/barber-schedule/${selectedBarber.id}/time-off/${timeOffId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to remove time off");

      fetchBarberSchedule(selectedBarber.id);
    } catch (err) {
      console.error("Failed to remove time off:", err);
      setError("Failed to remove time off");
    } finally {
      setLoading(false);
    }
  };

  const updateDaySchedule = (dayIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!selectedBarber) {
    return (
      <div className="manage-schedule-page">
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No barbers found</h3>
          <p>Please add barbers first to manage their schedules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-schedule-page">
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Barber Selection */}
      <div className="schedule-header">
        <h1>
          <Calendar size={24} />
          Manage Barber Schedules
        </h1>
        <select
          value={selectedBarber.id}
          onChange={(e) => {
            const barber = barbers.find((b) => b.id === e.target.value);
            setSelectedBarber(barber);
          }}
          className="barber-selector"
        >
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name}
            </option>
          ))}
        </select>
      </div>

      <div className="schedule-content">
        {/* Weekly Schedule */}
        <div className="schedule-card">
          <h2>
            <Clock size={18} />
            Weekly Schedule - {selectedBarber.name}
          </h2>

          <div className="schedule-grid">
            {schedule.map((day, index) => (
              <div key={day.dayOfWeek} className="day-schedule">
                <div className="day-header">
                  <h3>{day.dayName}</h3>
                  <label className="working-toggle">
                    <input
                      type="checkbox"
                      checked={day.isWorking}
                      onChange={(e) =>
                        updateDaySchedule(index, "isWorking", e.target.checked)
                      }
                      disabled={loading}
                    />
                    Working
                  </label>
                </div>

                {day.isWorking && (
                  <div className="time-inputs">
                    <div className="time-row">
                      <label>Start:</label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateDaySchedule(index, "startTime", e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="time-row">
                      <label>End:</label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateDaySchedule(index, "endTime", e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="break-section">
                      <h4>Break Time (Optional)</h4>
                      <div className="time-row">
                        <label>Break Start:</label>
                        <input
                          type="time"
                          value={day.breakStart || ""}
                          onChange={(e) =>
                            updateDaySchedule(
                              index,
                              "breakStart",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="time-row">
                        <label>Break End:</label>
                        <input
                          type="time"
                          value={day.breakEnd || ""}
                          onChange={(e) =>
                            updateDaySchedule(index, "breakEnd", e.target.value)
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={updateSchedule}
            className="save-schedule-btn"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Schedule"}
          </button>
        </div>

        {/* Time Off Management */}
        <div className="timeoff-card">
          <h2>
            <Calendar size={18} />
            Time Off Management
          </h2>

          {/* Add New Time Off */}
          <div className="add-timeoff">
            <h3>Add Time Off</h3>
            <div className="timeoff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={newTimeOff.startDate}
                    onChange={(e) =>
                      setNewTimeOff({
                        ...newTimeOff,
                        startDate: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={newTimeOff.endDate}
                    onChange={(e) =>
                      setNewTimeOff({ ...newTimeOff, endDate: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Reason:</label>
                  <select
                    value={newTimeOff.reason}
                    onChange={(e) =>
                      setNewTimeOff({ ...newTimeOff, reason: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes:</label>
                  <input
                    type="text"
                    placeholder="Optional notes..."
                    value={newTimeOff.notes}
                    onChange={(e) =>
                      setNewTimeOff({ ...newTimeOff, notes: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
              <button onClick={addTimeOff} disabled={loading}>
                <Plus size={16} />
                Add Time Off
              </button>
            </div>
          </div>

          {/* Existing Time Off */}
          <div className="timeoff-list">
            <h3>Scheduled Time Off</h3>
            {timeOff.length === 0 ? (
              <p className="no-timeoff">No time off scheduled</p>
            ) : (
              <div className="timeoff-items">
                {timeOff.map((item) => (
                  <div key={item.id} className="timeoff-item">
                    <div className="timeoff-info">
                      <div className="timeoff-dates">
                        {formatDate(item.start_date)} -{" "}
                        {formatDate(item.end_date)}
                      </div>
                      <div className="timeoff-reason">{item.reason}</div>
                      {item.notes && (
                        <div className="timeoff-notes">{item.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeTimeOff(item.id)}
                      className="remove-timeoff-btn"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
