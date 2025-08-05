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
  Percent,
  Receipt,
  Printer, // Add this for print icon
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/ReceiptModal.css";

export default function ReceiptModal({ receipt, onClose }) {
  const { t, isRTL } = useLanguage();
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

  // Calculate subtotal from items if not provided
  const calculateSubtotal = () => {
    const servicesTotal = (receipt.services || []).reduce(
      (sum, service) => sum + (service.price || 0) * (service.quantity || 1),
      0
    );
    const productsTotal = (receipt.products || []).reduce(
      (sum, product) => sum + (product.price || 0) * (product.quantity || 1),
      0
    );
    return servicesTotal + productsTotal;
  };

  const subtotal = receipt.subtotal || calculateSubtotal();
  const discountAmount = receipt.discount_amount || 0;
  const taxAmount = receipt.tax || (subtotal - discountAmount) * 0; // Assuming 0% tax for now
  const finalTotal = receipt.total || subtotal - discountAmount + taxAmount;

  const printReceipt = () => {
    const printWindow = window.open("", "_blank");
    const receiptHTML = generateReceiptHTML();

    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Add a small delay to ensure content is rendered
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      // Close after printing (optional)
    }, 500);
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
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    @media screen {
      body { 
        font-family: 'Arial', sans-serif; 
        width: 80mm; 
        padding: 10px; 
        background: white;
        color: #333;
        margin: 20px auto;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
    }
    
    @media print {
      body { 
        font-family: 'Arial', sans-serif; 
        width: 58mm; 
        padding: 2mm; 
        background: white;
        color: #000;
        margin: 0;
        border: none;
        border-radius: 0;
      }
      
      @page {
        size: 58mm auto;
        margin: 0;
      }
    }
    
    .header { 
      text-align: center; 
      border-bottom: 2px solid #000; 
      padding-bottom: 8px; 
      margin-bottom: 12px; 
    }
    
    .shop-name { 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    
    .shop-subtitle {
      font-size: 11px;
      color: #666;
      margin-bottom: 6px;
    }
    
    .receipt-id { 
      font-size: 10px; 
      margin-top: 4px; 
      color: #666;
    }
    
    .section { 
      margin: 8px 0; 
    }
    
    .row { 
      display: flex; 
      justify-content: space-between; 
      margin: 2px 0; 
      font-size: 12px;
    }
    
    .items-section {
      margin: 12px 0;
    }
    
    .item-header {
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3px;
      margin-bottom: 4px;
      font-size: 11px;
      text-transform: uppercase;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
      font-size: 11px;
      line-height: 1.3;
    }
    
    .item-name {
      flex: 1;
      margin-right: 8px;
    }
    
    .item-price {
      font-weight: 600;
      white-space: nowrap;
    }
    
    .total-section { 
      border-top: 2px solid #000; 
      font-weight: bold; 
      margin-top: 12px; 
      padding-top: 6px; 
    }
    
    .total-row { 
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: bold;
    }
    
    .footer { 
      text-align: center; 
      margin-top: 15px; 
      font-size: 9px; 
      color: #666;
      border-top: 1px dashed #ccc;
      padding-top: 8px;
    }
    
    .empty-note {
      font-style: italic;
      color: #999;
      font-size: 10px;
      text-align: center;
      padding: 8px 0;
    }
    
    .date-info {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .customer-info {
      font-size: 11px;
      margin: 6px 0;
      text-align: center;
    }
    
    .barber-info {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .payment-info {
      font-size: 10px;
      text-align: center;
      margin: 6px 0;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">NASSIM SELECT</div>
    <div class="shop-subtitle">صالون نسيم سيليكت</div>
            <div class="shop-subtitle">${t("Premium Grooming Services")}</div>
        <div class="receipt-id">${t("Receipt")}: ${receipt.id.substring(
      0,
      8
    )}</div>
  </div>
  
  <div class="date-info">
    ${formatDate(receipt.created_at)}
  </div>
  
  <div class="customer-info">
    <strong>${t("Customer")}:</strong> ${
      receipt.customer_name || t("Walk-in Customer")
    }
  </div>
  
  <div class="barber-info">
    ${t("Served by")}: ${receipt.barber_name || t("Staff")}
  </div>

  ${
    receipt.services && receipt.services.length > 0
      ? `
  <div class="items-section">
            <div class="item-header">${t("SERVICES")}</div>
    ${receipt.services
      .map(
        (service) => `
    <div class="item-row">
      <div class="item-name">${service.name}${
          service.quantity > 1 ? ` x${service.quantity}` : ""
        }</div>
      <div class="item-price">${(
        service.price * (service.quantity || 1)
      ).toFixed(2)} EGP</div>
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
            <div class="item-header">${t("PRODUCTS")}</div>
    ${receipt.products
      .map(
        (product) => `
    <div class="item-row">
      <div class="item-name">${product.name}${
          product.quantity > 1 ? ` x${product.quantity}` : ""
        }</div>
      <div class="item-price">${(
        product.price * (product.quantity || 1)
      ).toFixed(2)} EGP</div>
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

  <div class="section">
    <div class="row">
      <span>Subtotal:</span>
      <span>${subtotal.toFixed(2)} EGP</span>
    </div>
    ${
      discountAmount > 0
        ? `
    <div class="row" style="color: #059669;">
      <span>Discount:</span>
      <span>-${discountAmount.toFixed(2)} EGP</span>
    </div>
    `
        : ""
    }
    <div class="row">
      <span>Tax (0%):</span>
      <span>${taxAmount.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="total-section">
    <div class="total-row">
      <span>TOTAL:</span>
      <span>${finalTotal.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="payment-info">
    Payment: ${(receipt.payment_method || "cash").toUpperCase()}
  </div>

  <div class="footer">
    Thank you for visiting Nassim Select!<br>
    We appreciate your business<br>
    --------------------------------<br>
    Floki Systems © ${new Date().getFullYear()}
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
      <div className={`receipt-modal ${isRTL ? "rtl" : ""}`}>
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
              <span className="status-badge">{t("Completed")}</span>
            </div>
          </div>

          <div className="receipt-info-grid">
            <div className="info-section">
              <h3>
                <User size={16} />
                {t("Customer")}
              </h3>
              <p>{receipt.customer_name || t("Walk-in Customer")}</p>
            </div>

            <div className="info-section">
              <h3>
                <Scissors size={16} />
                {t("Barber")}
              </h3>
              <p>{receipt.barber_name || t("N/A")}</p>
            </div>
          </div>

          <div className="items-section">
            <h3>
              <Package size={16} />
              {t("Items & Services")}
            </h3>

            {hasItems ? (
              <div className="items-container">
                {receipt.services && receipt.services.length > 0 && (
                  <div className="item-category">
                    <h4>
                      <Wrench size={14} />
                      {t("Services")} ({receipt.services.length})
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
                      {t("Products")} ({receipt.products.length})
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
                <p>{t("No items recorded for this receipt")}</p>
              </div>
            )}
          </div>

          <div className="payment-section">
            <div className="financial-breakdown">
              <h3>
                <Receipt size={16} />
                {t("Financial Summary")}
              </h3>

              <div className="breakdown-details">
                <div className="breakdown-row">
                  <span>{t("Subtotal")}</span>
                  <span>
                    {subtotal.toFixed(2)} {t("currency")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="breakdown-row discount">
                    <span>
                      <Percent size={14} />
                      {t("Discount")}
                      {receipt.discount_type === "percentage" &&
                        receipt.discount_percentage &&
                        ` (${receipt.discount_percentage}%)`}
                    </span>
                    <span>
                      -{discountAmount.toFixed(2)} {t("currency")}
                    </span>
                  </div>
                )}

                <div className="breakdown-row">
                  <span>{t("Tax (0%)")}</span>
                  <span>
                    {taxAmount.toFixed(2)} {t("currency")}
                  </span>
                </div>

                <div className="breakdown-row total">
                  <span>{t("Total Amount")}</span>
                  <span>
                    {finalTotal.toFixed(2)} {t("currency")}
                  </span>
                </div>
              </div>
            </div>

            <div className="payment-info">
              <div className="payment-method">
                <CreditCard size={16} />
                <span>{t("Payment Method")}</span>
                <span
                  className={`payment-badge ${
                    receipt.payment_method || "cash"
                  }`}
                >
                  {(receipt.payment_method || "cash").toUpperCase()}
                </span>
              </div>

              {receipt.send_invoice && (
                <div className="invoice-status">
                  <FileText size={14} />
                  <span>{t("Invoice sent to financial records")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="total-section">
            <div className="total-row">
              <DollarSign size={18} />
              <span>{t("Total Amount")}</span>
              <span className="total-amount">
                {(receipt.total || 0).toFixed(2)} {t("currency")}
              </span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              {t("Close")}
            </button>
            <button className="btn btn-secondary" onClick={printReceipt}>
              <Printer size={16} />
              {t("Print Receipt")}
            </button>
            <button className="btn btn-primary" onClick={downloadReceipt}>
              <Download size={16} />
              {t("Download Receipt")}
            </button>
          </div>
        </div>

        {receipt.notes && (
          <div className="notes-section">
            <h3>
              <FileText size={16} />
              {t("Additional Notes")}
            </h3>
            <p>{receipt.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
