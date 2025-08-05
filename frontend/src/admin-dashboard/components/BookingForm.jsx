import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  Save,
  X,
  Scissors,
  DollarSign,
  FileText,
  Users,
  CalendarDays,
} from "lucide-react";
import "../styles/BookingForm.css";

export default function BookingForm({
  onSubmit,
  editingBooking = null,
  onCancel,
}) {
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [slotsData, setSlotsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [booking, setBooking] = useState({
    customer_id: "",
    barber_id: "",
    service_ids: [],
    booking_date: "",
    booking_time: "",
    duration_minutes: 60,
    notes: "",
    estimated_cost: 0,
  });

  useEffect(() => {
    fetchInitialData();
    if (editingBooking) {
      setBooking({
        customer_id: editingBooking.customer_id || "",
        barber_id: editingBooking.barber_id || "",
        service_ids: editingBooking.service_ids
          ? editingBooking.service_ids.split(",")
          : [],
        booking_date: editingBooking.booking_date || "",
        booking_time: editingBooking.booking_time || "",
        duration_minutes: editingBooking.duration_minutes || 60,
        notes: editingBooking.notes || "",
        estimated_cost: editingBooking.estimated_cost || 0,
      });
    }
  }, [editingBooking]);

  useEffect(() => {
    if (booking.barber_id && booking.booking_date) {
      fetchSlotsData();
    } else {
      setSlotsData(null);
    }
  }, [booking.barber_id, booking.booking_date]);

  useEffect(() => {
    calculateEstimatedCost();
  }, [booking.service_ids, services]);

  const fetchInitialData = async () => {
    try {
      const [barbersRes, customersRes, servicesRes] = await Promise.all([
        fetch("/api/barbers"),
        fetch("/api/customers"),
        fetch("/api/services"),
      ]);

      // Handle barbers response
      if (barbersRes.ok) {
        const barbersData = await barbersRes.json();
        console.log("Barbers data:", barbersData);
        setBarbers(Array.isArray(barbersData) ? barbersData : []);
      } else {
        console.error("Failed to fetch barbers");
        setBarbers([]);
      }

      // Handle customers response with detailed logging
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        console.log("Customers data in BookingForm:", customersData);
        console.log("Customers data type:", typeof customersData);
        console.log("Is customers array?", Array.isArray(customersData));

        // Handle different possible response structures
        let customersArray = [];

        if (Array.isArray(customersData)) {
          customersArray = customersData;
        } else if (
          customersData &&
          customersData.customers &&
          Array.isArray(customersData.customers)
        ) {
          customersArray = customersData.customers;
        } else if (
          customersData &&
          customersData.data &&
          Array.isArray(customersData.data)
        ) {
          customersArray = customersData.data;
        } else {
          console.warn(
            "Unexpected customers response structure:",
            customersData
          );
          customersArray = [];
        }

        console.log("Final customers array:", customersArray);
        setCustomers(customersArray);
      } else {
        console.error("Failed to fetch customers");
        setCustomers([]);
      }

      // Handle services response
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        console.log("Services data:", servicesData);
        setServices(Array.isArray(servicesData) ? servicesData : []);
      } else {
        console.error("Failed to fetch services");
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load form data");
      // Ensure all states are arrays even on error
      setCustomers([]);
      setBarbers([]);
      setServices([]);
    }
  };

  const fetchSlotsData = async () => {
    try {
      setLoading(true);
      setError("");

      const duration = Math.max(booking.duration_minutes, 30); // Minimum 30 minutes
      const res = await fetch(
        `/api/barber-schedule/${booking.barber_id}/slots/${booking.booking_date}?duration=${duration}`
      );

      if (res.ok) {
        const data = await res.json();
        setSlotsData(data);

        if (!data.success) {
          setError(data.error || "Failed to fetch availability");
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to fetch availability");
        setSlotsData(null);
      }
    } catch (err) {
      console.error("Failed to fetch slots data:", err);
      setError("Failed to check availability");
      setSlotsData(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedCost = () => {
    const totalCost = booking.service_ids.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
    setBooking((prev) => ({ ...prev, estimated_cost: totalCost }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !booking.customer_id ||
      !booking.barber_id ||
      !booking.booking_date ||
      !booking.booking_time
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (booking.service_ids.length === 0) {
      setError("Please select at least one service");
      return;
    }

    if (slotsData && !slotsData.isWorkingDay) {
      setError("Selected barber is not working on this date");
      return;
    }

    // Check if selected time is available
    if (slotsData && slotsData.availableSlots) {
      const isTimeAvailable = slotsData.availableSlots.some(
        (slot) => slot.time === booking.booking_time
      );

      if (!isTimeAvailable) {
        setError("Selected time slot is not available");
        return;
      }
    }

    onSubmit({
      ...booking,
      service_ids: booking.service_ids.join(","),
    });
  };

  const getAvailabilityStatus = () => {
    if (!slotsData) return null;

    if (slotsData.isPastDate) {
      return (
        <div className="availability-status unavailable">
          <AlertCircle size={16} />
          Cannot book appointments for past dates
        </div>
      );
    }

    if (slotsData.timeOff) {
      return (
        <div className="availability-status unavailable">
          <AlertCircle size={16} />
          Barber is on {slotsData.timeOff.reason.toLowerCase()}
          {slotsData.timeOff.notes && ` - ${slotsData.timeOff.notes}`}
        </div>
      );
    }

    if (!slotsData.isWorkingDay) {
      return (
        <div className="availability-status unavailable">
          <AlertCircle size={16} />
          {slotsData.message || "Barber is not working on this day"}
        </div>
      );
    }

    return (
      <div className="availability-status available">
        <CheckCircle size={16} />
        <div className="availability-details">
          <div>
            Working hours: {slotsData.schedule.startTime} -{" "}
            {slotsData.schedule.endTime}
          </div>
          {slotsData.schedule.breakStart && slotsData.schedule.breakEnd && (
            <div>
              Break: {slotsData.schedule.breakStart} -{" "}
              {slotsData.schedule.breakEnd}
            </div>
          )}
          <div className="slot-summary">
            {slotsData.summary.availableCount} available slots,
            {slotsData.summary.bookedCount} booked
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-booking-form">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="form-grid">
          {/* Customer Selection */}
          <div className="form-group">
            <label>
              <Users size={16} />
              Customer *
            </label>
            <select
              value={booking.customer_id}
              onChange={(e) =>
                setBooking((prev) => ({ ...prev, customer_id: e.target.value }))
              }
              required
            >
              <option value="">Select a customer</option>
              {customers && Array.isArray(customers) && customers.length > 0 ? (
                customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.mobile}
                  </option>
                ))
              ) : (
                <option disabled>
                  {customers && Array.isArray(customers)
                    ? "No customers available"
                    : "Loading customers..."}
                </option>
              )}
            </select>
          </div>

          {/* Barber Selection */}
          <div className="form-group">
            <label>
              <Scissors size={16} />
              Barber *
            </label>
            <select
              value={booking.barber_id}
              onChange={(e) =>
                setBooking((prev) => ({ ...prev, barber_id: e.target.value }))
              }
              required
            >
              <option value="">Select a barber</option>
              {barbers && Array.isArray(barbers) && barbers.length > 0 ? (
                barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}{" "}
                    {barber.specialty_names && `- ${barber.specialty_names}`}
                  </option>
                ))
              ) : (
                <option disabled>
                  {barbers && Array.isArray(barbers)
                    ? "No barbers available"
                    : "Loading barbers..."}
                </option>
              )}
            </select>
          </div>

          {/* Date Selection */}
          <div className="form-group">
            <label>
              <CalendarDays size={16} />
              Date *
            </label>
            <input
              type="date"
              value={booking.booking_date}
              onChange={(e) =>
                setBooking((prev) => ({
                  ...prev,
                  booking_date: e.target.value,
                }))
              }
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Duration Selection */}
          <div className="form-group">
            <label>
              <Clock size={16} />
              Duration (minutes)
            </label>
            <select
              value={booking.duration_minutes}
              onChange={(e) => {
                const newDuration = parseInt(e.target.value) || 60;
                setBooking((prev) => ({
                  ...prev,
                  duration_minutes: newDuration,
                }));
              }}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>
        </div>

        {/* Availability Status */}
        {booking.barber_id && booking.booking_date && (
          <div className="availability-section">
            {loading ? (
              <div className="loading-status">
                <Info size={16} />
                Checking availability...
              </div>
            ) : (
              getAvailabilityStatus()
            )}
          </div>
        )}

        {/* Time Selection */}
        <div className="form-group">
          <label>
            <Clock size={16} />
            Time *
          </label>
          {booking.barber_id && booking.booking_date && slotsData ? (
            <>
              {slotsData.success &&
              slotsData.isWorkingDay &&
              slotsData.availableSlots.length > 0 ? (
                <div className="time-slots-container">
                  <select
                    value={booking.booking_time}
                    onChange={(e) =>
                      setBooking((prev) => ({
                        ...prev,
                        booking_time: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select a time</option>
                    {slotsData.availableSlots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time} ({slot.duration} min slot)
                      </option>
                    ))}
                  </select>

                  {slotsData.bookedSlots.length > 0 && (
                    <div className="booked-slots-info">
                      <h4>Already Booked:</h4>
                      <div className="booked-slots-list">
                        {slotsData.bookedSlots.map((bookedSlot, index) => (
                          <div key={index} className="booked-slot">
                            {bookedSlot.time} -{" "}
                            {bookedSlot.booking?.customer || "Unknown"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-slots">
                  {slotsData.message || "No available time slots"}
                </div>
              )}
            </>
          ) : (
            <input
              type="time"
              value={booking.booking_time}
              onChange={(e) =>
                setBooking((prev) => ({
                  ...prev,
                  booking_time: e.target.value,
                }))
              }
              disabled
              placeholder="Select barber and date first"
            />
          )}
        </div>

        {/* Services Selection */}
        <div className="form-group services-group">
          <label>
            <Scissors size={16} />
            Services *
          </label>
          <div className="services-grid">
            {services && Array.isArray(services) && services.length > 0 ? (
              services.map((service) => (
                <label key={service.id} className="service-checkbox">
                  <input
                    type="checkbox"
                    checked={booking.service_ids.includes(service.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBooking((prev) => ({
                          ...prev,
                          service_ids: [...prev.service_ids, service.id],
                        }));
                      } else {
                        setBooking((prev) => ({
                          ...prev,
                          service_ids: prev.service_ids.filter(
                            (id) => id !== service.id
                          ),
                        }));
                      }
                    }}
                  />
                  <span className="service-info">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">{service.price} EGP</span>
                  </span>
                </label>
              ))
            ) : (
              <div className="no-services">
                {services && Array.isArray(services)
                  ? "No services available"
                  : "Loading services..."}
              </div>
            )}
          </div>
        </div>

        {/* Estimated Cost Display */}
        <div className="form-group">
          <label>
            <DollarSign size={16} />
            Estimated Cost
          </label>
          <div className="estimated-cost">
            {booking.estimated_cost.toFixed(2)} EGP
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label>
            <FileText size={16} />
            Notes
          </label>
          <textarea
            value={booking.notes}
            onChange={(e) =>
              setBooking((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Any special requirements or notes..."
            rows="3"
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            <Save size={16} />
            {editingBooking ? "Update Booking" : "Create Booking"}
          </button>
          <button type="button" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
