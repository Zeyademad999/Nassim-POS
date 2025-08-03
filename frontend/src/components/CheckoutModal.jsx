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
  Printer, // Add this line
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
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
  const { t, isRTL } = useLanguage();

  const currentDate = new Date();
  const cairoDate = new Date(
    currentDate.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
    })
  );
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
    doc.text(t("Premium Grooming & Retail Services"), 20, 35);

    // Invoice header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text(t("INVOICE"), 150, 55);

    // Invoice details box
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(140, 60, 60, 35);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`${t("Invoice #")}: ${invoiceNumber}`, 142, 68);
    doc.text(`${t("Receipt #")}: ${receiptNumber}`, 142, 75);
    doc.text(
      `${t("Date")}: ${currentDate.toLocaleDateString("en-GB")}`,
      142,
      82
    );
    doc.text(
      `${t("Time")}: ${currentDate.toLocaleTimeString("en-GB", {
        hour12: false,
      })}`,
      142,
      89
    );

    // Company details
    let yPos = 55;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`${t("Business Details")}:`, 20, yPos);

    yPos += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text("Nassim Select Barber Shop", 20, yPos);
    yPos += 5;
    doc.text(
      "The Fount Mall,Abdallah Ibn Salamah,First New Cairo, Egypt",
      20,
      yPos
    );
    yPos += 5;
    doc.text("Phone: +20 100 016 6364", 20, yPos);
    yPos += 5;
    doc.text("Email: lebanon_nassim@hotmail.com", 20, yPos);

    // Customer details
    yPos += 15;
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text(`${t("Customer Details")}:`, 20, yPos);

    yPos += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`${t("Customer")}: ${customerName}`, 20, yPos);
    yPos += 5;
    if (barberName && barberName !== "Walk-in") {
      doc.text(`${t("Barber")}: ${barberName}`, 20, yPos);
      yPos += 5;
    }
    doc.text(`${t("Service Date")}: ${serviceDate}`, 20, yPos);
    yPos += 5;
    doc.text(
      `${t("Payment Method")}: ${t(paymentMethod.toUpperCase())}`,
      20,
      yPos
    );

    // Items table
    yPos += 20;

    // Table header
    doc.setFillColor(249, 250, 251);
    doc.rect(20, yPos - 3, 170, 10, "F");
    doc.setFont(undefined, "bold");
    doc.setFontSize(10);
    doc.text(t("Description"), 25, yPos + 3);
    doc.text(t("Type"), 100, yPos + 3);
    doc.text(t("Qty"), 130, yPos + 3);
    doc.text(t("Price"), 150, yPos + 3);
    doc.text(t("Total"), 175, yPos + 3);

    yPos += 12;
    doc.setFont(undefined, "normal");

    // Services
    services.forEach((service) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      doc.text(service.name, 25, yPos);
      doc.text(t("Service"), 100, yPos);
      doc.text(service.quantity.toString(), 135, yPos);
      doc.text(`${service.price.toFixed(2)} ${t("currency")}`, 150, yPos);
      doc.text(
        `${(service.price * service.quantity).toFixed(2)} ${t("currency")}`,
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
      doc.text(t("Product"), 100, yPos);
      doc.text(product.quantity.toString(), 135, yPos);
      doc.text(`${product.price.toFixed(2)} ${t("currency")}`, 150, yPos);
      doc.text(
        `${(product.price * product.quantity).toFixed(2)} ${t("currency")}`,
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

    doc.text(`${t("Subtotal")}:`, totalsStartX, yPos);
    doc.text(`${subtotal.toFixed(2)} ${t("currency")}`, 175, yPos);
    yPos += 7;

    if (discountAmount > 0) {
      doc.setTextColor(5, 150, 105); // Green for discount
      doc.text(`${t("Discount")}:`, totalsStartX, yPos);
      doc.text(`-${discountAmount.toFixed(2)} ${t("currency")}`, 175, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);
    }

    doc.text(`${t("Tax")} (8%):`, totalsStartX, yPos);
    doc.text(`${tax.toFixed(2)} ${t("currency")}`, 175, yPos);
    yPos += 7;

    // Total with background
    doc.setFillColor(17, 24, 39);
    doc.rect(totalsStartX - 5, yPos - 4, 55, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text(`${t("TOTAL")}:`, totalsStartX, yPos + 3);
    doc.text(`${total.toFixed(2)} ${t("currency")}`, 175, yPos + 3);

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    yPos += 25;
    doc.text(t("Thank you for choosing Nassim Select Barber!"), 20, yPos);
    yPos += 5;
    doc.text(t("Follow us on social media @nassimbarber"), 20, yPos);
    yPos += 5;
    if (sendInvoice) {
      doc.text(
        `📧 ${t("This invoice has been sent to financial records.")}`,
        20,
        yPos
      );
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
      [t("NASSIM SELECT BARBER - INVOICE")],
      [t("Premium Grooming & Retail Services")],
      [""],
      [`${t("Invoice #")}: ${invoiceNumber}`],
      [`${t("Receipt #")}: ${receiptNumber}`],
      [
        `${t("Date")}: ${currentDate.toLocaleDateString(
          "en-GB"
        )} ${currentDate.toLocaleTimeString("en-GB")}`,
      ],
      [`${t("Service Date")}: ${serviceDate}`],
      [`${t("Customer")}: ${customerName}`],
      ...(barberName && barberName !== "Walk-in"
        ? [[`${t("Barber")}: ${barberName}`]]
        : []),
      [`${t("Payment Method")}: ${t(paymentMethod.toUpperCase())}`],
      [""],
      [t("SERVICES & PRODUCTS")],
      [
        t("Description"),
        t("Type"),
        t("Quantity"),
        `${t("Unit Price")} (${t("currency")})`,
        `${t("Total")} (${t("currency")})`,
      ],
      ...services.map((service) => [
        service.name,
        t("Service"),
        service.quantity,
        service.price,
        service.price * service.quantity,
      ]),
      ...products.map((product) => [
        product.name,
        t("Product"),
        product.quantity,
        product.price,
        product.price * product.quantity,
      ]),
      [""],
      [t("TOTALS")],
      [t("Subtotal"), "", "", "", subtotal],
      ...(discountAmount > 0
        ? [[t("Discount"), "", "", "", -discountAmount]]
        : []),
      [`${t("Tax")} (8%)`, "", "", "", tax],
      [t("TOTAL"), "", "", "", total],
      [""],
      [
        `${t("Invoice Sent to Financial Records")}: ${
          sendInvoice ? t("YES") : t("NO")
        }`,
      ],
      [""],
      [t("Thank you for choosing Nassim Select Barber!")],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("Invoice"));
    XLSX.writeFile(workbook, `invoice-${invoiceNumber}.xlsx`);
  };

  const printInvoice = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          @page { size: A4; margin: 0.5in; }
          body { font-family: Arial; font-size: 12px; color: #333; }
          .header { background: #111827; color: white; padding: 20px; text-align: center; }
          .company-name { font-size: 24px; font-weight: bold; }
          .invoice-details { margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background: #f5f5f5; }
          .totals { margin-top: 20px; text-align: right; }
          .total-row { margin: 5px 0; }
          .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">NASSIM SELECT BARBER</div>
          <div>${t("Premium Grooming & Retail Services")}</div>
        </div>
        
        <div class="invoice-details">
          <div class="details-row"><strong>${t(
            "Invoice #"
          )}:</strong> ${invoiceNumber}</div>
          <div class="details-row"><strong>${t(
            "Receipt #"
          )}:</strong> ${receiptNumber}</div>
          <div class="details-row"><strong>${t(
            "Date"
          )}:</strong> ${currentDate.toLocaleDateString()}</div>
          <div class="details-row"><strong>${t(
            "Customer"
          )}:</strong> ${customerName}</div>
          ${
            barberName && barberName !== "Walk-in"
              ? `<div class="details-row"><strong>${t(
                  "Barber"
                )}:</strong> ${barberName}</div>`
              : ""
          }
          <div class="details-row"><strong>${t("Payment Method")}:</strong> ${t(
      paymentMethod.toUpperCase()
    )}</div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>${t("Description")}</th>
              <th>${t("Type")}</th>
              <th>${t("Qty")}</th>
              <th>${t("Price")}</th>
              <th>${t("Total")}</th>
            </tr>
          </thead>
          <tbody>
            ${services
              .map(
                (service) => `
              <tr>
                <td>${service.name}</td>
                <td>${t("Service")}</td>
                <td>${service.quantity}</td>
                <td>${service.price.toFixed(2)} ${t("currency")}</td>
                <td>${(service.price * service.quantity).toFixed(2)} ${t(
                  "currency"
                )}</td>
              </tr>
            `
              )
              .join("")}
            ${products
              .map(
                (product) => `
              <tr>
                <td>${product.name}</td>
                <td>${t("Product")}</td>
                <td>${product.quantity}</td>
                <td>${product.price.toFixed(2)} ${t("currency")}</td>
                <td>${(product.price * product.quantity).toFixed(2)} ${t(
                  "currency"
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">${t("Subtotal")}: ${subtotal.toFixed(2)} ${t(
      "currency"
    )}</div>
          ${
            discountAmount > 0
              ? `<div class="total-row" style="color: #059669;">${t(
                  "Discount"
                )}: -${discountAmount.toFixed(2)} ${t("currency")}</div>`
              : ""
          }
          <div class="total-row">${t("Tax")} (8%): ${tax.toFixed(2)} ${t(
      "currency"
    )}</div>
          <div class="final-total">${t("TOTAL")}: ${total.toFixed(2)} ${t(
      "currency"
    )}</div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #666;">
          <p>${t("Thank you for choosing Nassim Select Barber!")}</p>
          ${
            sendInvoice
              ? `<p>📧 ${t(
                  "This invoice has been sent to financial records."
                )}</p>`
              : ""
          }
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Print after content loads
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const totalItems = services.length + products.length;

  return (
    <div className={`checkout-modal-overlay ${isRTL ? "rtl" : "ltr"}`}>
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
          <h2>{t("Transaction Complete!")}</h2>
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
                {t("Payment Successful")}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
                {t("Transaction has been processed")}
              </p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="invoice-details">
            <div className="invoice-row">
              <span className="invoice-label">{t("Invoice Number")}:</span>
              <span className="invoice-value">{invoiceNumber}</span>
            </div>
            <div className="invoice-row">
              <span className="invoice-label">{t("Receipt Number")}:</span>
              <span className="invoice-value">{receiptNumber}</span>
            </div>
            <div className="invoice-row">
              <span className="invoice-label">{t("Date & Time")}:</span>
              <span className="invoice-value">
                {currentDate.toLocaleDateString("en-GB")} {t("at")}{" "}
                {currentDate.toLocaleTimeString("en-GB")}
              </span>
            </div>
            <div className="invoice-row">
              <span className="invoice-label">{t("Service Date")}:</span>
              <span className="invoice-value">{serviceDate}</span>
            </div>
          </div>

          {/* Customer & Barber Info */}
          {(customerName || barberName) && (
            <div className="receipt-meta">
              {customerName && (
                <p>
                  <strong>{t("Customer")}:</strong> {customerName}
                </p>
              )}
              {barberName && barberName !== "Walk-in" && (
                <p>
                  <strong>{t("Barber")}:</strong> {barberName}
                </p>
              )}
              {customerName === "Walk-in" && (
                <p>
                  <strong>{t("Service Type")}:</strong> {t("Walk-in Customer")}
                </p>
              )}
            </div>
          )}

          {/* Items List */}
          <div className="receipt-services">
            <h4>
              {t("Items")} ({totalItems})
            </h4>
            <div className="receipt-items">
              {services.map((service) => (
                <div key={`service-${service.id}`} className="receipt-item">
                  <div className="item-info">
                    <Wrench size={16} color="#1d4ed8" />
                    <div className="item-details">
                      <div className="item-name">{service.name}</div>
                      <div className="item-qty-price">
                        {t("Qty")}: {service.quantity} ×{" "}
                        {service.price.toFixed(2)} {t("currency")}
                      </div>
                    </div>
                    <span className="item-type-badge service-badge">
                      {t("Service")}
                    </span>
                  </div>
                  <div className="item-total">
                    {(service.price * service.quantity).toFixed(2)}{" "}
                    {t("currency")}
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
                        {t("Qty")}: {product.quantity} ×{" "}
                        {product.price.toFixed(2)} {t("currency")}
                      </div>
                    </div>
                    <span className="item-type-badge product-badge">
                      {t("Product")}
                    </span>
                  </div>
                  <div className="item-total">
                    {(product.price * product.quantity).toFixed(2)}{" "}
                    {t("currency")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="receipt-totals-enhanced">
            <div className="total-line">
              <span>{t("Subtotal")}</span>
              <span>
                {subtotal.toFixed(2)} {t("currency")}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="total-line discount">
                <span>{t("Discount Applied")}</span>
                <span>
                  -{discountAmount.toFixed(2)} {t("currency")}
                </span>
              </div>
            )}
            <div className="total-line">
              <span>{t("Tax")} (8%)</span>
              <span>
                {tax.toFixed(2)} {t("currency")}
              </span>
            </div>
            <div className="total-line final">
              <span>{t("Total Paid")}</span>
              <span>
                {total.toFixed(2)} {t("currency")}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="payment-info">
            <CreditCard size={16} />
            <span>
              {t("Paid via")} {t(paymentMethod.toUpperCase())}
            </span>
          </div>

          {/* Invoice Status */}
          <div className="invoice-status">
            <Receipt size={16} />
            {sendInvoice ? (
              <span>🔒 {t("Invoice sent")}</span>
            ) : (
              <span>🔒 {t("Invoice sent")}</span>
            )}
          </div>

          {/* Export Buttons */}
          <div className="export-buttons">
            <button onClick={printInvoice} className="print-btn">
              <Printer size={18} />
              {t("Print Invoice")}
            </button>
            <button onClick={exportToPDF} className="pdf-btn">
              <FileText size={18} />
              {t("Download PDF")}
            </button>
            <button onClick={exportToExcel} className="excel-btn">
              <FileSpreadsheet size={18} />
              {t("Excel Report")}
            </button>
          </div>

          <button onClick={handleComplete} className="complete-btn">
            {t("Complete & New Transaction")}
          </button>
        </div>
      </div>
    </div>
  );
}
