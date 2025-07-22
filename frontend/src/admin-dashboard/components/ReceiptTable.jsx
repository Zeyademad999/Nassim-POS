import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Calendar,
  User,
  Scissors,
  Package,
  DollarSign,
  FileText,
  CreditCard,
} from "lucide-react";

export default function ReceiptModal({
  receipt,
  mode,
  onClose,
  onSave,
  canEdit,
}) {
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(mode === "edit");

  useEffect(() => {
    setEditData({
      customer_name: receipt.customer_name || "",
      barber_name: receipt.barber_name || "",
      total: receipt.total || 0,
      payment_method: receipt.payment_method || "cash",
      service_date:
        receipt.service_date || receipt.created_at?.split("T")[0] || "",
      notes: receipt.notes || "",
    });
    setIsEditing(mode === "edit");
  }, [receipt, mode]);

  const handleSave = () => {
    if (!editData.customer_name.trim() || !editData.barber_name.trim()) {
      alert("Customer name and barber name are required.");
      return;
    }

    if (!editData.total || editData.total <= 0) {
      alert("Total amount must be greater than 0.");
      return;
    }

    onSave({
      ...receipt,
      ...editData,
      total: parseFloat(editData.total),
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatServices = (services) => {
    if (!services || services.length === 0) return [];
    return services.map((service) => ({
      name: service.name || service,
      price: service.price || 0,
      quantity: service.quantity || 1,
    }));
  };

  const formatProducts = (products) => {
    if (!products || products.length === 0) return [];
    return products.map((product) => ({
      name: product.name || product,
      price: product.price || 0,
      quantity: product.quantity || 1,
    }));
  };

  const services = formatServices(receipt.services);
  const products = formatProducts(receipt.products);
  const hasItems = services.length > 0 || products.length > 0;

  return (
    <div className="modal-overlay">
      <div className="receipt-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-info">
            <h2>
              <FileText size={18} />
              Receipt Details
            </h2>
            <div className="receipt-id">
              Receipt ID: <code>{receipt.id.substring(0, 16)}...</code>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content">
          {/* Receipt Status & Date */}
          <div className="receipt-header-info">
            <div className="receipt-date">
              <Calendar size={16} />
              <span>{formatDate(receipt.created_at)}</span>
            </div>
            <div className="receipt-status">
              <span className="status-badge">Completed</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Customer & Barber Information */}
            <div className="receipt-parties">
              <div className="customer-section">
                <h3>
                  <User size={16} />
                  Customer
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.customer_name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        customer_name: e.target.value,
                      })
                    }
                    placeholder="Enter customer name"
                    className="edit-input"
                  />
                ) : (
                  <p className="customer-name">
                    {receipt.customer_name || "Walk-in Customer"}
                  </p>
                )}
              </div>

              <div className="barber-section">
                <h3>
                  <Scissors size={16} />
                  Barber
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.barber_name}
                    onChange={(e) =>
                      setEditData({ ...editData, barber_name: e.target.value })
                    }
                    placeholder="Enter barber name"
                    className="edit-input"
                  />
                ) : (
                  <p className="barber-name">{receipt.barber_name || "N/A"}</p>
                )}
              </div>
            </div>

            {/* Services & Products */}
            {hasItems && (
              <div style={{ display: "grid", gap: "16px" }}>
                {/* Services Section */}
                {services.length > 0 && (
                  <div className="receipt-section">
                    <h3>
                      <Scissors size={16} />
                      Services ({services.length})
                    </h3>
                    <div className="items-list">
                      {services.map((service, index) => (
                        <div key={index} className="item-row">
                          <div className="item-info">
                            <span className="item-name">{service.name}</span>
                            {service.quantity > 1 && (
                              <span className="item-quantity">
                                ×{service.quantity}
                              </span>
                            )}
                          </div>
                          <div className="item-price">
                            {service.price > 0
                              ? `${service.price.toFixed(2)} EGP`
                              : "Included"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {products.length > 0 && (
                  <div className="receipt-section">
                    <h3>
                      <Package size={16} />
                      Products ({products.length})
                    </h3>
                    <div className="items-list">
                      {products.map((product, index) => (
                        <div key={index} className="item-row">
                          <div className="item-info">
                            <span className="item-name">{product.name}</span>
                            {product.quantity > 1 && (
                              <span className="item-quantity">
                                ×{product.quantity}
                              </span>
                            )}
                          </div>
                          <div className="item-price">
                            {product.price > 0
                              ? `${product.price.toFixed(2)} EGP`
                              : "Included"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment & Financial Information */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Payment Details */}
              <div className="receipt-section">
                <h3>
                  <CreditCard size={16} />
                  Payment
                </h3>
                <div className="payment-details">
                  <div className="payment-row">
                    <span>Method:</span>
                    {isEditing ? (
                      <select
                        value={editData.payment_method}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            payment_method: e.target.value,
                          })
                        }
                        className="edit-select"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                      </select>
                    ) : (
                      <span
                        className={`payment-badge ${
                          receipt.payment_method === "cash"
                            ? "payment-cash"
                            : "payment-card"
                        }`}
                      >
                        {receipt.payment_method?.toUpperCase() || "CASH"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Date */}
              <div className="receipt-section">
                <h3>
                  <Calendar size={16} />
                  Service Date
                </h3>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.service_date}
                    onChange={(e) =>
                      setEditData({ ...editData, service_date: e.target.value })
                    }
                    className="edit-input"
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
                    {receipt.service_date
                      ? new Date(receipt.service_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "Same as receipt date"}
                  </p>
                )}
              </div>
            </div>

            {/* Total Amount - Highlighted */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <DollarSign size={18} />
                  Total Amount
                </h3>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editData.total}
                    onChange={(e) =>
                      setEditData({ ...editData, total: e.target.value })
                    }
                    placeholder="0.00"
                    className="edit-input amount-input"
                    style={{
                      width: "140px",
                      textAlign: "right",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#166534",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#166534",
                    }}
                  >
                    {(receipt.total || 0).toFixed(2)} EGP
                  </span>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="receipt-section">
              <h3>
                <FileText size={16} />
                Additional Notes
              </h3>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  placeholder="Add any additional notes or comments..."
                  rows={3}
                  className="edit-textarea"
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
              ) : (
                <div className="receipt-notes">
                  {receipt.notes || "No additional notes provided"}
                </div>
              )}
            </div>

            {/* Receipt Summary (if not editing) */}
            {!isEditing && (
              <div className="receipt-summary">
                <div className="summary-row">
                  <span>Items Total:</span>
                  <span>
                    {[...services, ...products]
                      .reduce(
                        (sum, item) =>
                          sum + (item.price || 0) * (item.quantity || 1),
                        0
                      )
                      .toFixed(2)}{" "}
                    EGP
                  </span>
                </div>
                {receipt.discount_amount && receipt.discount_amount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount Applied:</span>
                    <span>-{receipt.discount_amount.toFixed(2)} EGP</span>
                  </div>
                )}
                {receipt.tax && receipt.tax > 0 && (
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>+{receipt.tax.toFixed(2)} EGP</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Final Total:</span>
                  <span>{(receipt.total || 0).toFixed(2)} EGP</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            {isEditing ? "Cancel" : "Close"}
          </button>

          {canEdit && !isEditing && (
            <button
              className="btn-secondary"
              onClick={() => setIsEditing(true)}
              style={{
                background: "#fef3c7",
                color: "#d97706",
                borderColor: "#fbbf24",
              }}
            >
              Edit Receipt
            </button>
          )}

          {isEditing && (
            <>
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    customer_name: receipt.customer_name || "",
                    barber_name: receipt.barber_name || "",
                    total: receipt.total || 0,
                    payment_method: receipt.payment_method || "cash",
                    service_date:
                      receipt.service_date ||
                      receipt.created_at?.split("T")[0] ||
                      "",
                    notes: receipt.notes || "",
                  });
                }}
              >
                Reset Changes
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                style={{
                  background: "#059669",
                  borderColor: "#059669",
                }}
              >
                <Save size={16} />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
