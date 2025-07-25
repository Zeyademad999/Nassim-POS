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

export default function BookingForm({
  customer,
  onSubmit,
  onCancel,
  barbers = [],
}) {
  const [formData, setFormData] = useState({
    barber_id: customer?.preferred_barber_id || "",
    booking_date: "",
    booking_time: "",
    service_ids: [],
    duration_minutes: 60,
  });

  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData((prev) => ({
      ...prev,
      booking_date: tomorrow.toISOString().split("T")[0],
    }));
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
        `/api/bookings/availability/${formData.barber_id}/${formData.booking_date}`
      );
      if (!res.ok) throw new Error("Failed to check availability");
      const data = await res.json();
      setAvailableSlots(data.availableSlots);

      // Clear selected time if it's no longer available
      if (!data.availableSlots.includes(formData.booking_time)) {
        setFormData((prev) => ({ ...prev, booking_time: "" }));
      }
    } catch (err) {
      console.error("Failed to check availability:", err);
      setAvailableSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateEstimatedCost = () => {
    const totalCost = formData.service_ids.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service ? service.price : 0);
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
    } else {
      const selectedDate = new Date(formData.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.booking_date = "Cannot book appointments in the past";
      }
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
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      onSubmit();
    } catch (err) {
      console.error("Error creating booking:", err);
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

  const getSelectedBarber = () => {
    return barbers.find((b) => b.id === formData.barber_id);
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      {/* Customer Info */}
      <div className="form-section">
        <h3>
          <User size={16} />
          Customer Information
        </h3>
        <div className="customer-info">
          <p>
            <strong>Name:</strong> {customer.name}
          </p>
          <p>
            <strong>Mobile:</strong> {customer.mobile}
          </p>
          {customer.preferred_barber_name && (
            <p>
              <strong>Preferred Barber:</strong>{" "}
              {customer.preferred_barber_name}
            </p>
          )}
        </div>
      </div>

      {/* Barber Selection */}
      <div className="form-section">
        <h3>
          <Scissors size={16} />
          Barber & Schedule
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="barber">
              Select Barber <span className="required">*</span>
            </label>
            <select
              id="barber"
              value={formData.barber_id}
              onChange={(e) => handleInputChange("barber_id", e.target.value)}
              className={errors.barber_id ? "error" : ""}
              disabled={loading}
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
            <label htmlFor="date">
              Date <span className="required">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={formData.booking_date}
              onChange={(e) =>
                handleInputChange("booking_date", e.target.value)
              }
              min={new Date().toISOString().split("T")[0]}
              className={errors.booking_date ? "error" : ""}
              disabled={loading}
            />
            {errors.booking_date && (
              <span className="error-text">{errors.booking_date}</span>
            )}
          </div>
        </div>

        {/* Time Selection */}
        <div className="form-group">
          <label>
            Available Times <span className="required">*</span>
          </label>
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
                  disabled={loading}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : formData.barber_id && formData.booking_date ? (
            <div className="no-slots-message">
              No available time slots for this barber on the selected date
            </div>
          ) : (
            <div className="select-barber-message">
              Please select a barber and date to see available times
            </div>
          )}
          {errors.booking_time && (
            <span className="error-text">{errors.booking_time}</span>
          )}
        </div>
      </div>

      {/* Services Selection */}
      <div className="form-section">
        <h3>
          <Scissors size={16} />
          Services
        </h3>
        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-card ${
                formData.service_ids.includes(service.id) ? "selected" : ""
              }`}
              onClick={() => handleServiceToggle(service.id)}
            >
              <div className="service-info">
                <h4>{service.name}</h4>
                <p className="service-price">{service.price} EGP</p>
              </div>
              <input
                type="checkbox"
                checked={formData.service_ids.includes(service.id)}
                onChange={() => handleServiceToggle(service.id)}
                disabled={loading}
              />
            </div>
          ))}
        </div>
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
            <label htmlFor="duration">Duration (minutes)</label>
            <select
              id="duration"
              value={formData.duration_minutes}
              onChange={(e) =>
                handleInputChange("duration_minutes", parseInt(e.target.value))
              }
              disabled={loading}
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
              {formData.estimated_cost.toFixed(2)} EGP
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <h3>
          <FileText size={16} />
          Additional Notes
        </h3>

        <div className="form-group">
          <label htmlFor="notes">Booking Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Any special requests or notes for this appointment..."
            rows={3}
            disabled={loading}
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
          <Calendar size={16} />
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>
      </div>
    </form>
  );
}
