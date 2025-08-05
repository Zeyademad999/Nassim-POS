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
  Users,
  CalendarDays,
  Clock3,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Star,
  Phone,
  MapPin,
} from "lucide-react";
import "../styles/CustomerBookingForm.css";

export default function CustomerBookingForm({
  customers = [],
  barbers = [],
  onSubmit,
  onCancel,
}) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    barber_id: "",
    booking_date: "",
    booking_time: "",
    service_ids: [],
    duration_minutes: 60,
    estimated_cost: 0,
    notes: "",
  });

  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData((prev) => ({
      ...prev,
      booking_date: tomorrow.toISOString().split("T")[0],
    }));
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
        `/api/bookings/availability/${formData.barber_id}/${formData.booking_date}`
      );
      if (!res.ok) throw new Error("Failed to check availability");
      const data = await res.json();

      console.log("📅 Availability data:", data);
      setAvailableSlots(data.availableSlots || []);

      if (!data.availableSlots?.includes(formData.booking_time)) {
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
      return total + (service ? parseFloat(service.price) || 0 : 0);
    }, 0);

    setFormData((prev) => ({ ...prev, estimated_cost: totalCost }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCustomer) {
      newErrors.customer = "Please select a customer";
    }

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
    console.log("🚀 Creating booking with data:", {
      customer_id: selectedCustomer.id,
      ...formData,
    });

    try {
      const bookingData = {
        customer_id: selectedCustomer.id,
        barber_id: formData.barber_id,
        service_ids: formData.service_ids,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        duration_minutes: formData.duration_minutes,
        estimated_cost: formData.estimated_cost,
        notes: formData.notes,
      };

      console.log("📤 Sending booking data:", bookingData);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      console.log("📡 Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || "Failed to create booking");
      }

      const createdBooking = await res.json();
      console.log("✅ Booking created successfully:", createdBooking);

      onSubmit(createdBooking);
    } catch (err) {
      console.error("❌ Error creating booking:", err);
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

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="customer-booking-form-container">
      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Customer</span>
        </div>
        <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Schedule</span>
        </div>
        <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Services</span>
        </div>
        <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <span>Confirm</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="customer-booking-form">
        {errors.submit && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{errors.submit}</span>
            <button type="button" onClick={() => setErrors({})}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Step 1: Customer Selection */}
        <div className={`form-step ${currentStep === 1 ? "active" : ""}`}>
          <div className="step-header">
            <h2>
              <Users size={20} />
              Select Customer
            </h2>
            <p>Choose the customer for this booking</p>
          </div>

          <div className="customer-selection">
            <div className="form-group">
              <label>
                <User size={16} />
                Customer *
              </label>
              <select
                value={selectedCustomer?.id || ""}
                onChange={(e) => {
                  const customer = customers.find(
                    (c) => c.id === e.target.value
                  );
                  setSelectedCustomer(customer);
                  if (customer?.preferred_barber_id) {
                    setFormData((prev) => ({
                      ...prev,
                      barber_id: customer.preferred_barber_id,
                    }));
                  }
                  setCurrentStep(2);
                }}
                className={errors.customer ? "error" : ""}
              >
                <option value="">Choose a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.mobile}
                  </option>
                ))}
              </select>
              {errors.customer && (
                <span className="error-text">{errors.customer}</span>
              )}
            </div>

            {selectedCustomer && (
              <div className="selected-customer-card">
                <div className="customer-avatar">
                  <User size={24} />
                </div>
                <div className="customer-details">
                  <h3>{selectedCustomer.name}</h3>
                  <div className="customer-info">
                    <span>
                      <Phone size={14} />
                      {selectedCustomer.mobile}
                    </span>
                    {selectedCustomer.email && (
                      <span>{selectedCustomer.email}</span>
                    )}
                  </div>
                  {selectedCustomer.total_visits > 0 && (
                    <div className="customer-stats">
                      <span className="visits">
                        <Star size={14} />
                        {selectedCustomer.total_visits} visits
                      </span>
                      <span className="spent">
                        {selectedCustomer.total_spent} EGP spent
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="details-toggle"
                  onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Schedule Selection */}
        <div className={`form-step ${currentStep === 2 ? "active" : ""}`}>
          <div className="step-header">
            <h2>
              <CalendarDays size={20} />
              Schedule Appointment
            </h2>
            <p>Choose barber, date, and time</p>
          </div>

          <div className="schedule-selection">
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <Scissors size={16} />
                  Barber *
                </label>
                <select
                  value={formData.barber_id}
                  onChange={(e) =>
                    handleInputChange("barber_id", e.target.value)
                  }
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
                <label>
                  <Calendar size={16} />
                  Date *
                </label>
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

            {/* Barber Info Card */}
            {getSelectedBarber() && (
              <div className="barber-info-card">
                <div className="barber-avatar">
                  <Scissors size={24} />
                </div>
                <div className="barber-details">
                  <h3>{getSelectedBarber().name}</h3>
                  <p className="specialty">{getSelectedBarber().specialty}</p>
                  <div className="barber-stats">
                    <span className="experience">
                      <Star size={14} />
                      Experienced
                    </span>
                    <span className="rating">
                      <Star size={14} />
                      4.8/5
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Time Selection */}
            <div className="form-group">
              <label>
                <Clock3 size={16} />
                Available Times *
              </label>
              {checkingAvailability ? (
                <div className="loading-message">
                  <div className="loading-spinner"></div>
                  Checking availability...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="time-slots-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${
                        formData.booking_time === slot ? "selected" : ""
                      }`}
                      onClick={() => {
                        handleInputChange("booking_time", slot);
                        setCurrentStep(3);
                      }}
                    >
                      <Clock size={16} />
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              ) : formData.barber_id && formData.booking_date ? (
                <div className="no-slots-message">
                  <AlertCircle size={16} />
                  No available time slots for this barber on the selected date
                </div>
              ) : (
                <div className="select-barber-message">
                  <Info size={16} />
                  Please select a barber and date to see available times
                </div>
              )}
              {errors.booking_time && (
                <span className="error-text">{errors.booking_time}</span>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Services Selection */}
        <div className={`form-step ${currentStep === 3 ? "active" : ""}`}>
          <div className="step-header">
            <h2>
              <Scissors size={20} />
              Select Services
            </h2>
            <p>Choose the services for this appointment</p>
          </div>

          <div className="services-selection">
            {/* Services Summary */}
            <div className="services-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-number">
                    {formData.service_ids.length}
                  </span>
                  <span className="stat-label">Selected</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{services.length}</span>
                  <span className="stat-label">Available</span>
                </div>
                <div className="stat-item total">
                  <span className="stat-number">
                    {formData.estimated_cost.toFixed(2)}
                  </span>
                  <span className="stat-label">Total (EGP)</span>
                </div>
              </div>
            </div>

            {/* Services Dropdown */}
            <div className="services-dropdown-container">
              <div className="services-header">
                <h3>Available Services</h3>
                <div className="services-actions">
                  <button
                    type="button"
                    className="select-all-btn"
                    onClick={() => {
                      if (formData.service_ids.length === services.length) {
                        setFormData((prev) => ({ ...prev, service_ids: [] }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          service_ids: services.map((s) => s.id),
                        }));
                      }
                    }}
                  >
                    {formData.service_ids.length === services.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              </div>

              <div className="services-dropdown">
                <div className="dropdown-header">
                  <span>Select services from the list below</span>
                  <span className="selected-count">
                    {formData.service_ids.length} of {services.length} selected
                  </span>
                </div>

                <div className="services-list">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`service-item ${
                        formData.service_ids.includes(service.id)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="service-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.service_ids.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                        />
                        <CheckCircle size={16} />
                      </div>

                      <div className="service-info">
                        <div className="service-main">
                          <h4 className="service-name">{service.name}</h4>
                          <p className="service-description">
                            {service.description ||
                              "Professional service with expert care"}
                          </p>
                        </div>

                        <div className="service-details">
                          <span className="service-duration">
                            <Clock size={14} />
                            {service.duration_minutes || 30} min
                          </span>
                          <span className="service-category">
                            <Scissors size={14} />
                            {service.category || "Hair"}
                          </span>
                          {service.is_popular && (
                            <span className="popular-badge">
                              <Star size={12} />
                              Popular
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="service-price">{service.price} EGP</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Services Preview */}
            {formData.service_ids.length > 0 && (
              <div className="selected-services-preview">
                <h3>Selected Services ({formData.service_ids.length})</h3>
                <div className="selected-services-list">
                  {formData.service_ids.map((serviceId) => {
                    const service = services.find((s) => s.id === serviceId);
                    return (
                      <div key={serviceId} className="selected-service-item">
                        <div className="service-info">
                          <span className="service-name">{service?.name}</span>
                          <span className="service-duration">
                            {service?.duration_minutes || 30} min
                          </span>
                        </div>
                        <div className="service-price">
                          {service?.price} EGP
                        </div>
                        <button
                          type="button"
                          className="remove-service"
                          onClick={() => handleServiceToggle(serviceId)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="total-estimate">
                  <span>Total Estimate:</span>
                  <span className="total-amount">
                    {formData.estimated_cost.toFixed(2)} EGP
                  </span>
                </div>
              </div>
            )}

            {errors.service_ids && (
              <span className="error-text">{errors.service_ids}</span>
            )}
          </div>
        </div>

        {/* Step 4: Confirmation */}
        <div className={`form-step ${currentStep === 4 ? "active" : ""}`}>
          <div className="step-header">
            <h2>
              <CheckCircle size={20} />
              Confirm Booking
            </h2>
            <p>Review and confirm your booking details</p>
          </div>

          <div className="booking-summary">
            <div className="summary-card">
              <div className="summary-section">
                <h3>
                  <User size={16} />
                  Customer
                </h3>
                <p>{selectedCustomer?.name}</p>
                <p className="text-muted">{selectedCustomer?.mobile}</p>
              </div>

              <div className="summary-section">
                <h3>
                  <Calendar size={16} />
                  Appointment
                </h3>
                <p>{new Date(formData.booking_date).toLocaleDateString()}</p>
                <p className="text-muted">
                  {formatTime(formData.booking_time)}
                </p>
              </div>

              <div className="summary-section">
                <h3>
                  <Scissors size={16} />
                  Barber
                </h3>
                <p>{getSelectedBarber()?.name}</p>
                <p className="text-muted">{getSelectedBarber()?.specialty}</p>
              </div>

              <div className="summary-section">
                <h3>
                  <DollarSign size={16} />
                  Total Cost
                </h3>
                <div className="total-cost">
                  {formData.estimated_cost.toFixed(2)} EGP
                </div>
              </div>
            </div>

            <div className="selected-services">
              <h3>Selected Services</h3>
              <div className="services-list">
                {formData.service_ids.map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  return (
                    <div key={serviceId} className="service-item">
                      <span>{service?.name}</span>
                      <span>{service?.price} EGP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && !selectedCustomer) ||
                (currentStep === 2 &&
                  (!formData.barber_id || !formData.booking_time)) ||
                (currentStep === 3 && formData.service_ids.length === 0)
              }
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || checkingAvailability}
            >
              <Save size={16} />
              {loading ? "Creating Booking..." : "Confirm Booking"}
            </button>
          )}
        </div>

        {/* Cancel Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={loading}
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
