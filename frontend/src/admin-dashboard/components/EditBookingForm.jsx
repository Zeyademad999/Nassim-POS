import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  FileText,
} from "lucide-react";

export default function EditBookingForm({
  booking,
  barbers = [],
  onSubmit,
  onCancel,
}) {
  const parseServiceIds = (booking) => {
    if (!booking) return [];

    console.log("Parsing service IDs from booking:", booking);
    console.log("service_ids value:", booking.service_ids);
    console.log("service_ids type:", typeof booking.service_ids);

    // Handle different possible formats of service_ids
    if (booking.service_ids) {
      if (typeof booking.service_ids === "string") {
        try {
          // Try to parse as JSON first (this is how your backend stores it)
          const parsed = JSON.parse(booking.service_ids);
          if (Array.isArray(parsed)) {
            console.log("Parsed as JSON array:", parsed);
            return parsed;
          }
        } catch (e) {
          // If JSON parsing fails, try comma-separated string
          const ids = booking.service_ids
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
          console.log("Parsed as comma-separated string:", ids);
          return ids;
        }
      } else if (Array.isArray(booking.service_ids)) {
        // If it's already an array
        console.log("Already an array:", booking.service_ids);
        return booking.service_ids;
      }
    }

    // If services are provided as objects with id property
    if (booking.services && Array.isArray(booking.services)) {
      const ids = booking.services.map(
        (service) => service.id || service.service_id
      );
      console.log("Parsed from services array:", ids);
      return ids;
    }

    console.log("No service IDs found, returning empty array");
    return [];
  };
  const [formData, setFormData] = useState({
    barber_id: booking?.barber_id || "",
    booking_date: booking?.booking_date || "",
    booking_time: booking?.booking_time || "",
    service_ids: parseServiceIds(booking),
    duration_minutes: booking?.duration_minutes || 60,
    estimated_cost: booking?.estimated_cost || 0,
    notes: booking?.notes || "",
    status: booking?.status || "scheduled",
  });

  // Add this helper function at the top of the component

  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  // Check availability when barber or date changes
  useEffect(() => {
    if (formData.barber_id && formData.booking_date) {
      checkAvailability();
    }
  }, [formData.barber_id, formData.booking_date]);

  // Calculate estimated cost when services change
  useEffect(() => {
    calculateEstimatedCost();
  }, [formData.service_ids, services]);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const checkAvailability = async () => {
    if (!formData.barber_id || !formData.booking_date) return;

    setCheckingAvailability(true);
    try {
      const res = await fetch(
        `/api/bookings/availability/${formData.barber_id}/${formData.booking_date}?exclude=${booking.id}`
      );
      if (!res.ok) throw new Error("Failed to check availability");
      const data = await res.json();

      // Include current booking time in available slots
      const allSlots = [...(data.availableSlots || [])];
      if (booking.booking_time && !allSlots.includes(booking.booking_time)) {
        allSlots.push(booking.booking_time);
        allSlots.sort();
      }

      setAvailableSlots(allSlots);
    } catch (err) {
      console.error("Failed to check availability:", err);
      // Fallback: include original time
      setAvailableSlots([booking.booking_time]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateEstimatedCost = () => {
    const totalCost = formData.service_ids.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service ? parseFloat(service.price) || 0 : 0);
    }, 0);

    setFormData((prev) => ({ ...prev, estimated_cost: totalCost }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.barber_id) {
      newErrors.barber_id = "Please select a barber";
    }

    if (!formData.booking_date) {
      newErrors.booking_date = "Please select a date";
    }

    if (!formData.booking_time) {
      newErrors.booking_time = "Please select a time";
    }

    if (formData.service_ids.length === 0) {
      newErrors.service_ids = "Please select at least one service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    console.log("🔄 Updating booking:", booking.id, "with data:", formData);

    try {
      const updateData = {
        ...formData,
        service_ids: formData.service_ids, // Send as array, backend will handle JSON.stringify
      };

      console.log("📤 Sending update data:", updateData);

      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      console.log("📡 Update response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Update API Error:", errorData);
        throw new Error(errorData.error || "Failed to update booking");
      }

      const updatedBooking = await res.json();
      console.log("✅ Booking updated successfully:", updatedBooking);

      onSubmit(updatedBooking);
    } catch (err) {
      console.error("❌ Error updating booking:", err);
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }));
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="edit-booking-form">
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      {/* Customer Info (Read-only) */}
      <div className="form-section">
        <h3>
          <User size={16} />
          Customer Information
        </h3>
        <div className="customer-info">
          <p>
            <strong>Name:</strong> {booking.customer_name}
          </p>
          <p>
            <strong>Mobile:</strong> {booking.customer_mobile}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="form-section">
        <h3>Booking Status</h3>
        <div className="form-group">
          <select
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Barber & Schedule */}
      <div className="form-section">
        <h3>
          <Scissors size={16} />
          Barber & Schedule
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Barber *</label>
            <select
              value={formData.barber_id}
              onChange={(e) => handleInputChange("barber_id", e.target.value)}
              className={errors.barber_id ? "error" : ""}
            >
              <option value="">Choose a barber</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name} - {barber.specialty}
                </option>
              ))}
            </select>
            {errors.barber_id && (
              <span className="error-text">{errors.barber_id}</span>
            )}
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.booking_date}
              onChange={(e) =>
                handleInputChange("booking_date", e.target.value)
              }
              min={new Date().toISOString().split("T")[0]}
              className={errors.booking_date ? "error" : ""}
            />
            {errors.booking_date && (
              <span className="error-text">{errors.booking_date}</span>
            )}
          </div>
        </div>

        {/* Time Selection */}
        <div className="form-group">
          <label>Available Times *</label>
          {checkingAvailability ? (
            <div className="loading-message">Checking availability...</div>
          ) : availableSlots.length > 0 ? (
            <div className="time-slots">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time-slot ${
                    formData.booking_time === slot ? "selected" : ""
                  }`}
                  onClick={() => handleInputChange("booking_time", slot)}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-slots-message">
              No available time slots for this barber on the selected date
            </div>
          )}
          {errors.booking_time && (
            <span className="error-text">{errors.booking_time}</span>
          )}
        </div>
      </div>

      {/* Services Selection */}
      {/* Services Selection */}
      <div className="form-section">
        <h3>
          <Scissors size={16} />
          Services
        </h3>
        {services.length === 0 ? (
          <div className="loading-message">Loading services...</div>
        ) : (
          <div className="services-grid">
            {services.map((service) => {
              const isSelected = formData.service_ids.includes(service.id);
              return (
                <div
                  key={service.id}
                  className={`service-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p className="service-price">{service.price} EGP</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
        {errors.service_ids && (
          <span className="error-text">{errors.service_ids}</span>
        )}
      </div>

      {/* Duration and Cost */}
      <div className="form-section">
        <h3>
          <Clock size={16} />
          Duration & Cost
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Duration (minutes)</label>
            <select
              value={formData.duration_minutes}
              onChange={(e) =>
                handleInputChange("duration_minutes", parseInt(e.target.value))
              }
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <DollarSign size={16} />
              Estimated Cost
            </label>
            <div className="estimated-cost">
              {(formData.estimated_cost || 0).toFixed(2)} EGP
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <h3>
          <FileText size={16} />
          Notes
        </h3>
        <div className="form-group">
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Any special requests or notes..."
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={loading}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || checkingAvailability}
        >
          <Save size={16} />
          {loading ? "Updating..." : "Update Booking"}
        </button>
      </div>
    </form>
  );
}
