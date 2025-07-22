import React from "react";
import {
  X,
  Calendar,
  User,
  Scissors,
  Package,
  DollarSign,
  FileText,
  CreditCard,
  Download,
  Wrench,
} from "lucide-react";
import "../styles/ReceiptModal.css";

export default function ReceiptModal({ receipt, onClose }) {
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

  const downloadReceipt = () => {
    const receiptContent = generateReceiptHTML();
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receipt.id.substring(0, 8)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReceiptHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${receipt.id.substring(0, 8)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Arial', sans-serif; 
      width: 80mm; 
      padding: 10px; 
      background: white;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #000; 
      padding-bottom: 10px; 
      margin-bottom: 15px; 
    }
    .shop-name { 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 5px;
    }
    .receipt-id { 
      font-size: 12px; 
      margin-top: 5px; 
      color: #666;
    }
    .section { 
      margin: 10px 0; 
    }
    .row { 
      display: flex; 
      justify-content: space-between; 
      margin: 3px 0; 
      font-size: 14px;
    }
    .items-section {
      margin: 15px 0;
    }
    .item-header {
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
      margin-bottom: 5px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 13px;
    }
    .total-row { 
      border-top: 2px solid #000; 
      font-weight: bold; 
      margin-top: 15px; 
      padding-top: 8px; 
      font-size: 16px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 11px; 
      color: #666;
    }
    .empty-note {
      font-style: italic;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">NASSIM BARBER SHOP</div>
    <div>Premium Grooming Services</div>
    <div class="receipt-id">Receipt: ${receipt.id.substring(0, 8)}</div>
  </div>
  
  <div class="section">
    <div class="row">
      <span>Date:</span>
      <span>${formatDate(receipt.created_at)}</span>
    </div>
    <div class="row">
      <span>Customer:</span>
      <span>${receipt.customer_name || "Walk-in"}</span>
    </div>
    <div class="row">
      <span>Barber:</span>
      <span>${receipt.barber_name || "N/A"}</span>
    </div>
    <div class="row">
      <span>Payment:</span>
      <span>${(receipt.payment_method || "cash").toUpperCase()}</span>
    </div>
  </div>

  ${
    receipt.services && receipt.services.length > 0
      ? `
  <div class="items-section">
    <div class="item-header">SERVICES</div>
    ${receipt.services
      .map(
        (service) => `
    <div class="item-row">
      <span>${service.name} ${
          service.quantity > 1 ? `x${service.quantity}` : ""
        }</span>
      <span>${(service.price * (service.quantity || 1)).toFixed(2)} EGP</span>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    receipt.products && receipt.products.length > 0
      ? `
  <div class="items-section">
    <div class="item-header">PRODUCTS</div>
    ${receipt.products
      .map(
        (product) => `
    <div class="item-row">
      <span>${product.name} ${
          product.quantity > 1 ? `x${product.quantity}` : ""
        }</span>
      <span>${(product.price * (product.quantity || 1)).toFixed(2)} EGP</span>
    </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    (!receipt.services || receipt.services.length === 0) &&
    (!receipt.products || receipt.products.length === 0)
      ? `
  <div class="items-section">
    <div class="empty-note">No items recorded</div>
  </div>
  `
      : ""
  }

  <div class="total-row">
    <div class="row">
      <span>TOTAL:</span>
      <span>${(receipt.total || 0).toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="footer">
    Thank you for visiting Nassim Barber Shop!<br>
    We appreciate your business
  </div>
</body>
</html>
    `;
  };

  const hasItems =
    (receipt.services && receipt.services.length > 0) ||
    (receipt.products && receipt.products.length > 0);

  return (
    <div className="modal-overlay">
      <div className="receipt-modal">
        <div className="modal-header">
          <div className="header-info">
            <h2>
              <FileText size={18} />
              Receipt Details
            </h2>
            <div className="receipt-id">
              ID: <code>{receipt.id.substring(0, 16)}...</code>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content">
          <div className="receipt-header">
            <div className="receipt-date">
              <Calendar size={16} />
              <span>{formatDate(receipt.created_at)}</span>
            </div>
            <div className="receipt-status">
              <span className="status-badge">Completed</span>
            </div>
          </div>

          <div className="receipt-info-grid">
            <div className="info-section">
              <h3>
                <User size={16} />
                Customer
              </h3>
              <p>{receipt.customer_name || "Walk-in Customer"}</p>
            </div>

            <div className="info-section">
              <h3>
                <Scissors size={16} />
                Barber
              </h3>
              <p>{receipt.barber_name || "N/A"}</p>
            </div>
          </div>

          <div className="items-section">
            <h3>
              <Package size={16} />
              Items & Services
            </h3>

            {hasItems ? (
              <div className="items-container">
                {receipt.services && receipt.services.length > 0 && (
                  <div className="item-category">
                    <h4>
                      <Wrench size={14} />
                      Services ({receipt.services.length})
                    </h4>
                    <div className="items-list">
                      {receipt.services.map((service, index) => (
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
                            {(
                              (service.price || 0) * (service.quantity || 1)
                            ).toFixed(2)}{" "}
                            EGP
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {receipt.products && receipt.products.length > 0 && (
                  <div className="item-category">
                    <h4>
                      <Package size={14} />
                      Products ({receipt.products.length})
                    </h4>
                    <div className="items-list">
                      {receipt.products.map((product, index) => (
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
                            {(
                              (product.price || 0) * (product.quantity || 1)
                            ).toFixed(2)}{" "}
                            EGP
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-items">
                <p>No items recorded for this receipt</p>
              </div>
            )}
          </div>

          <div className="payment-section">
            <div className="payment-info">
              <div className="payment-method">
                <CreditCard size={16} />
                <span>Payment Method</span>
                <span
                  className={`payment-badge ${
                    receipt.payment_method || "cash"
                  }`}
                >
                  {(receipt.payment_method || "cash").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="total-section">
              <div className="total-row">
                <DollarSign size={18} />
                <span>Total Amount</span>
                <span className="total-amount">
                  {(receipt.total || 0).toFixed(2)} EGP
                </span>
              </div>
            </div>
          </div>

          {receipt.notes && (
            <div className="notes-section">
              <h3>
                <FileText size={16} />
                Additional Notes
              </h3>
              <p>{receipt.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={downloadReceipt}>
            <Download size={16} />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
