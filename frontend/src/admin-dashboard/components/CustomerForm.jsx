import React, { useState, useEffect } from "react";
import { Save, X, User, Phone, Mail, Star, FileText } from "lucide-react";

export default function CustomerForm({
  customer = null,
  onSubmit,
  onCancel,
  barbers = [],
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    preferred_barber_id: "",
    service_preferences: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
        preferred_barber_id: customer.preferred_barber_id || "",
        service_preferences: customer.service_preferences || "",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else {
      const mobileRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!mobileRegex.test(formData.mobile)) {
        newErrors.mobile = "Invalid mobile number format";
      }
    }

    // Email validation (optional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Clean up the data before submitting
      const cleanData = {
        ...formData,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || null,
        preferred_barber_id: formData.preferred_barber_id || null,
        service_preferences: formData.service_preferences.trim() || null,
        notes: formData.notes.trim() || null,
      };
      onSubmit(cleanData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="customer-form">
      {/* Basic Information */}
      <div className="form-section">
        <h3>
          <User size={16} />
          Basic Information
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter customer's full name"
              className={errors.name ? "error" : ""}
              disabled={loading}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">
              Mobile Number <span className="required">*</span>
            </label>
            <input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              placeholder="+20 123 456 7890"
              className={errors.mobile ? "error" : ""}
              disabled={loading}
            />
            {errors.mobile && (
              <span className="error-text">{errors.mobile}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">
            <Mail size={16} />
            Email Address (Optional)
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="customer@example.com"
            className={errors.email ? "error" : ""}
            disabled={loading}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
      </div>

      {/* Preferences */}
      <div className="form-section">
        <h3>
          <Star size={16} />
          Preferences
        </h3>

        <div className="form-group">
          <label htmlFor="preferred_barber">Preferred Barber</label>
          <select
            id="preferred_barber"
            value={formData.preferred_barber_id}
            onChange={(e) =>
              handleInputChange("preferred_barber_id", e.target.value)
            }
            disabled={loading}
          >
            <option value="">No preference</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name} - {barber.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="service_preferences">Service Preferences</label>
          <textarea
            id="service_preferences"
            value={formData.service_preferences}
            onChange={(e) =>
              handleInputChange("service_preferences", e.target.value)
            }
            placeholder="e.g., Beard trimming, specific hair style, preferred products..."
            rows={3}
            disabled={loading}
          />
          <small className="form-hint">
            Note any specific services, styles, or products the customer prefers
          </small>
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <h3>
          <FileText size={16} />
          Additional Notes
        </h3>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Any additional notes about the customer (allergies, special requests, etc.)"
            rows={3}
            disabled={loading}
          />
          <small className="form-hint">
            Include any important information about the customer
          </small>
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
        <button type="submit" className="btn-primary" disabled={loading}>
          <Save size={16} />
          {loading
            ? "Saving..."
            : customer
            ? "Update Customer"
            : "Add Customer"}
        </button>
      </div>
    </form>
  );
}
