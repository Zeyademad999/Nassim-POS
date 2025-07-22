import React from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  X,
  FileText,
  FileSpreadsheet,
  CreditCard,
  Package,
  Wrench,
  Receipt,
  CheckCircle,
} from "lucide-react";
import "../styles/CheckoutModal.css";

export default function CheckoutModal({
  services = [],
  products = [],
  subtotal,
  discountAmount = 0,
  tax,
  total,
  customerName,
  barberName,
  serviceDate,
  paymentMethod = "cash",
  sendInvoice = false,
  onClose,
  onComplete,
}) {
  const currentDate = new Date();
  const receiptNumber = `NSB-${Date.now()}`;
  const invoiceNumber = `INV-${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(Date.now()).slice(-6)}`;

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Company branding and header
    doc.setFillColor(17, 24, 39); // Dark blue background
    doc.rect(0, 0, 210, 40, "F");

    // Company name
    doc.setFont(undefined, "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("NASSIM SELECT BARBER", 20, 25);

    // Tagline
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Premium Grooming & Retail Services", 20, 35);

    // Invoice header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", 150, 55);

    // Invoice details box
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(140, 60, 60, 35);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Invoice #: ${invoiceNumber}`, 142, 68);
    doc.text(`Receipt #: ${receiptNumber}`, 142, 75);
    doc.text(`Date: ${currentDate.toLocaleDateString("en-GB")}`, 142, 82);
    doc.text(
      `Time: ${currentDate.toLocaleTimeString("en-GB", { hour12: false })}`,
      142,
      89
    );

    // Company details
    let yPos = 55;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Business Details:", 20, yPos);

    yPos += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text("Nassim Select Barber Shop", 20, yPos);
    yPos += 5;
    doc.text("123 Main Street, Tanta, Gharbia", 20, yPos);
    yPos += 5;
    doc.text("Phone: +20 40 123 4567", 20, yPos);
    yPos += 5;
    doc.text("Email: info@nassimbarber.com", 20, yPos);

    // Customer details
    yPos += 15;
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Customer Details:", 20, yPos);

    yPos += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Customer: ${customerName}`, 20, yPos);
    yPos += 5;
    if (barberName && barberName !== "Walk-in") {
      doc.text(`Barber: ${barberName}`, 20, yPos);
      yPos += 5;
    }
    doc.text(`Service Date: ${serviceDate}`, 20, yPos);
    yPos += 5;
    doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, yPos);

    // Items table
    yPos += 20;

    // Table header
    doc.setFillColor(249, 250, 251);
    doc.rect(20, yPos - 3, 170, 10, "F");
    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text("Description", 25, yPos + 3);
    doc.text("Type", 100, yPos + 3);
    doc.text("Qty", 130, yPos + 3);
    doc.text("Price", 150, yPos + 3);
    doc.text("Total", 175, yPos + 3);

    yPos += 12;
    doc.setFont(undefined, "normal");

    // Services
    services.forEach((service) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      doc.text(service.name, 25, yPos);
      doc.text("Service", 100, yPos);
      doc.text(service.quantity.toString(), 135, yPos);
      doc.text(`${service.price.toFixed(2)} EGP`, 150, yPos);
      doc.text(
        `${(service.price * service.quantity).toFixed(2)} EGP`,
        170,
        yPos
      );
      yPos += 8;
    });

    // Products
    products.forEach((product) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      doc.text(product.name, 25, yPos);
      doc.text("Product", 100, yPos);
      doc.text(product.quantity.toString(), 135, yPos);
      doc.text(`${product.price.toFixed(2)} EGP`, 150, yPos);
      doc.text(
        `${(product.price * product.quantity).toFixed(2)} EGP`,
        170,
        yPos
      );
      yPos += 8;
    });

    // Totals section
    yPos += 10;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;
    const totalsStartX = 140;

    doc.text("Subtotal:", totalsStartX, yPos);
    doc.text(`${subtotal.toFixed(2)} EGP`, 175, yPos);
    yPos += 7;

    if (discountAmount > 0) {
      doc.setTextColor(5, 150, 105); // Green for discount
      doc.text("Discount:", totalsStartX, yPos);
      doc.text(`-${discountAmount.toFixed(2)} EGP`, 175, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);
    }

    doc.text("Tax (8%):", totalsStartX, yPos);
    doc.text(`${tax.toFixed(2)} EGP`, 175, yPos);
    yPos += 7;

    // Total with background
    doc.setFillColor(17, 24, 39);
    doc.rect(totalsStartX - 5, yPos - 4, 55, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", totalsStartX, yPos + 3);
    doc.text(`${total.toFixed(2)} EGP`, 175, yPos + 3);

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    yPos += 25;
    doc.text("Thank you for choosing Nassim Select Barber!", 20, yPos);
    yPos += 5;
    doc.text("Follow us on social media @nassimbarber", 20, yPos);
    yPos += 5;
    if (sendInvoice) {
      doc.text("📧 This invoice has been sent to financial records.", 20, yPos);
    }

    // Watermark
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(50);
    doc.text("NASSIM", 30, 200, { angle: -45 });

    // Save the PDF
    doc.save(`invoice-${invoiceNumber}.pdf`);
  };

  const exportToExcel = () => {
    const sheetData = [
      ["NASSIM SELECT BARBER - INVOICE"],
      ["Premium Grooming & Retail Services"],
      [""],
      [`Invoice #: ${invoiceNumber}`],
      [`Receipt #: ${receiptNumber}`],
      [
        `Date: ${currentDate.toLocaleDateString(
          "en-GB"
        )} ${currentDate.toLocaleTimeString("en-GB")}`,
      ],
      [`Service Date: ${serviceDate}`],
      [`Customer: ${customerName}`],
      ...(barberName && barberName !== "Walk-in"
        ? [[`Barber: ${barberName}`]]
        : []),
      [`Payment Method: ${paymentMethod.toUpperCase()}`],
      [""],
      ["SERVICES & PRODUCTS"],
      ["Description", "Type", "Quantity", "Unit Price (EGP)", "Total (EGP)"],
      ...services.map((service) => [
        service.name,
        "Service",
        service.quantity,
        service.price,
        service.price * service.quantity,
      ]),
      ...products.map((product) => [
        product.name,
        "Product",
        product.quantity,
        product.price,
        product.price * product.quantity,
      ]),
      [""],
      ["TOTALS"],
      ["Subtotal", "", "", "", subtotal],
      ...(discountAmount > 0
        ? [["Discount", "", "", "", -discountAmount]]
        : []),
      ["Tax (8%)", "", "", "", tax],
      ["TOTAL", "", "", "", total],
      [""],
      [`Invoice Sent to Financial Records: ${sendInvoice ? "YES" : "NO"}`],
      [""],
      ["Thank you for choosing Nassim Select Barber!"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
    XLSX.writeFile(workbook, `invoice-${invoiceNumber}.xlsx`);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const totalItems = services.length + products.length;

  return (
    <div className="checkout-modal-overlay">
      <style jsx>{`
        .checkout-success-badge {
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .invoice-details {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }

        .invoice-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .invoice-row:last-child {
          margin-bottom: 0;
        }

        .invoice-label {
          color: #6b7280;
          font-weight: 500;
        }

        .invoice-value {
          color: #1f2937;
          font-weight: 600;
        }

        .receipt-items {
          max-height: 200px;
          overflow-y: auto;
          margin: 16px 0;
        }

        .receipt-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .receipt-item:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .item-type-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .service-badge {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .product-badge {
          background: #dcfce7;
          color: #166534;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .item-qty-price {
          font-size: 12px;
          color: #6b7280;
        }

        .item-total {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .receipt-totals-enhanced {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .total-line.discount {
          color: #059669;
          font-weight: 600;
        }

        .total-line.final {
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 12px;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .payment-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 6px;
          margin: 16px 0;
        }

        .invoice-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: ${sendInvoice ? "#dcfce7" : "#fef3c7"};
          color: ${sendInvoice ? "#166534" : "#92400e"};
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          margin: 12px 0;
        }
      `}</style>

      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>Transaction Complete!</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="checkout-content">
          {/* Success Badge */}
          <div className="checkout-success-badge">
            <CheckCircle size={24} />
            <div>
              <h3 style={{ margin: 0, fontSize: "16px" }}>
                Payment Successful
              </h3>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
                Transaction has been processed
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="invoice-details">
            <div className="invoice-row">
              <span className="invoice-label">Invoice Number:</span>
              <span className="invoice-value">{invoiceNumber}</span>
            </div>
            <div className="invoice-row">
              <span className="invoice-label">Receipt Number:</span>
              <span className="invoice-value">{receiptNumber}</span>
            </div>
            <div className="invoice-row">
              <span className="invoice-label">Date & Time:</span>
              <span className="invoice-value">
                {currentDate.toLocaleDateString("en-GB")} at{" "}
                {currentDate.toLocaleTimeString("en-GB")}
              </span>
            </div>
            <div className="invoice-row">
              <span className="invoice-label">Service Date:</span>
              <span className="invoice-value">{serviceDate}</span>
            </div>
          </div>

          {/* Customer & Barber Info */}
          {(customerName || barberName) && (
            <div className="receipt-meta">
              {customerName && (
                <p>
                  <strong>Customer:</strong> {customerName}
                </p>
              )}
              {barberName && barberName !== "Walk-in" && (
                <p>
                  <strong>Barber:</strong> {barberName}
                </p>
              )}
              {customerName === "Walk-in" && (
                <p>
                  <strong>Service Type:</strong> Walk-in Customer
                </p>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="receipt-services">
            <h4>Items ({totalItems})</h4>
            <div className="receipt-items">
              {services.map((service) => (
                <div key={`service-${service.id}`} className="receipt-item">
                  <div className="item-info">
                    <Wrench size={16} color="#1d4ed8" />
                    <div className="item-details">
                      <div className="item-name">{service.name}</div>
                      <div className="item-qty-price">
                        Qty: {service.quantity} × {service.price.toFixed(2)} EGP
                      </div>
                    </div>
                    <span className="item-type-badge service-badge">
                      Service
                    </span>
                  </div>
                  <div className="item-total">
                    {(service.price * service.quantity).toFixed(2)} EGP
                  </div>
                </div>
              ))}
              {products.map((product) => (
                <div key={`product-${product.id}`} className="receipt-item">
                  <div className="item-info">
                    <Package size={16} color="#166534" />
                    <div className="item-details">
                      <div className="item-name">{product.name}</div>
                      <div className="item-qty-price">
                        Qty: {product.quantity} × {product.price.toFixed(2)} EGP
                      </div>
                    </div>
                    <span className="item-type-badge product-badge">
                      Product
                    </span>
                  </div>
                  <div className="item-total">
                    {(product.price * product.quantity).toFixed(2)} EGP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="receipt-totals-enhanced">
            <div className="total-line">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            {discountAmount > 0 && (
              <div className="total-line discount">
                <span>Discount Applied</span>
                <span>-{discountAmount.toFixed(2)} EGP</span>
              </div>
            )}
            <div className="total-line">
              <span>Tax (8%)</span>
              <span>{tax.toFixed(2)} EGP</span>
            </div>
            <div className="total-line final">
              <span>Total Paid</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-info">
            <CreditCard size={16} />
            <span>Paid via {paymentMethod.toUpperCase()}</span>
          </div>

          {/* Invoice Status */}
          <div className="invoice-status">
            <Receipt size={16} />
            {sendInvoice ? (
              <span>
                📧 Invoice sent to financial records (visible to finance team)
              </span>
            ) : (
              <span>🔒 Invoice visible to super admin only</span>
            )}
          </div>

          {/* Export Buttons */}
          <div className="export-buttons">
            <button onClick={exportToPDF} className="pdf-btn">
              <FileText size={18} />
              Professional PDF Invoice
            </button>
            <button onClick={exportToExcel} className="excel-btn">
              <FileSpreadsheet size={18} />
              Excel Report
            </button>
          </div>

          <button onClick={handleComplete} className="complete-btn">
            Complete & New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
