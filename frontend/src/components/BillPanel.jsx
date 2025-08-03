import React from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  X,
  Package,
  Wrench,
  Percent,
  Receipt,
} from "lucide-react";
import { usePOS } from "../context/POSContext";
import { useLanguage } from "../context/LanguageContext";
import CheckoutModal from "./CheckoutModal";
import "../styles/BillPanel.css";

const BillPanel = () => {
  const {
    selectedServices,
    selectedProducts,
    allItems,
    itemCount,
    updateServiceQuantity,
    updateProductQuantity,
    removeService,
    removeProduct,
    clearBill,
    subtotal,
    serviceSubtotal,
    productSubtotal,
    discountType,
    setDiscountType,
    discountAmount,
    setDiscountAmount,
    discountPercentage,
    setDiscountPercentage,
    actualDiscountAmount,
    tax,
    total,
    customerMobile,
    customerName,
    selectedBarber,
    selectedBarberId,
    serviceDate,
    paymentMethod,
    setPaymentMethod,
    sendInvoice,
    setSendInvoice,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addPayment,
  } = usePOS();

  const { t, isRTL } = useLanguage();

  const handleCheckout = async () => {
    // Enhanced validation
    if (
      !customerName.trim() ||
      (!selectedBarber.trim() && customerName !== "Walk-in")
    ) {
      alert(t("pleaseEnterCustomer"));
      return;
    }

    if (itemCount === 0) {
      alert(t("pleaseAddItems"));
      return;
    }

    setIsCheckoutOpen(true);

    // Create items array with proper structure for transaction_items table
    const items = [
      ...selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        quantity: s.quantity,
        type: "service",
      })),
      ...selectedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        type: "product",
      })),
    ];

    // Enhanced bill data with proper field names matching the API
    // Enhanced bill data with proper field names matching the API
    const transactionData = {
      customer_name: customerName.trim(),
      customer_mobile: customerMobile?.trim() || null, // Add this line
      barber_name: selectedBarber || "No Barber Selected",
      barber_id: selectedBarberId || null,
      service_date: serviceDate.toISOString().split("T")[0],
      subtotal,
      discount_amount: actualDiscountAmount,
      discount_type: discountType,
      discount_percentage:
        discountType === "percentage" ? discountPercentage : null,
      tax,
      total,
      payment_method: paymentMethod,
      send_invoice: sendInvoice,
      items,
    };

    console.log("📦 Sending transaction data to backend:", transactionData);

    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save transaction");
      }

      const result = await res.json();
      console.log("✅ Transaction saved to backend:", result);

      // Track payment in local storage
      addPayment(total, paymentMethod);

      if (result.stockUpdated) {
        console.log("✅ Product stock levels updated");
      }
    } catch (err) {
      console.error("🔥 Failed to save transaction:", err);
      alert(`${t("checkoutFailed")}: ${err.message}`);
      setIsCheckoutOpen(false);
    }
  };

  const handleComplete = () => {
    clearBill();
  };

  // Enhanced discount change handler
  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;

    if (discountType === "percentage") {
      const clampedPercentage = Math.max(0, Math.min(value, 100));
      setDiscountPercentage(clampedPercentage);
    } else {
      const clampedAmount = Math.max(0, Math.min(value, subtotal));
      setDiscountAmount(clampedAmount);
    }
  };

  // Handle discount type change
  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    // Reset discount values when switching types
    if (type === "percentage") {
      setDiscountPercentage(0);
    } else {
      setDiscountAmount(0);
    }
  };

  const updateQuantity = (item, delta) => {
    if (item.itemType === "service") {
      updateServiceQuantity(item.id, delta);
    } else {
      updateProductQuantity(item.id, delta);
    }
  };

  const removeItem = (item) => {
    if (item.itemType === "service") {
      removeService(item.id);
    } else {
      removeProduct(item.id);
    }
  };

  return (
    <div className="bill-wrapper" dir={isRTL ? "rtl" : "ltr"}>
      <style jsx>{`
        .payment-options {
          margin: 16px 0;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .payment-option-group {
          margin-bottom: 12px;
        }

        .payment-option-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          display: block;
        }

        .payment-methods {
          display: flex;
          gap: 8px;
        }

        .payment-method {
          flex: 1;
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 13px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .payment-method.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
          font-weight: 500;
        }

        /* Enhanced Discount Styles */
        .discount-type-toggle {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .discount-type-btn {
          flex: 1;
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .discount-type-btn.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
        }

        .discount-type-btn:hover:not(.active) {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        .discount-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .discount-input {
          width: 100%;
          padding: 8px 40px 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }

        .discount-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .discount-unit {
          position: absolute;
          right: 12px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          pointer-events: none;
        }

        .discount-preview {
          font-size: 12px;
          color: #059669;
          font-weight: 500;
          margin-top: 4px;
          text-align: right;
          padding: 4px 8px;
          background: #ecfdf5;
          border-radius: 4px;
          border: 1px solid #d1fae5;
        }

        .invoice-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .invoice-checkbox input {
          width: 16px;
          height: 16px;
          accent-color: #2563eb;
        }

        .bill-item-type {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 8px;
        }

        .discount-line {
          color: #059669;
          font-weight: 500;
        }

        .breakdown-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 12px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        /* RTL specific styles */
        ${isRTL
          ? `
          .bill-item-type {
            margin-right: 8px;
            margin-left: 0;
          }
          
          .discount-unit {
            right: auto;
            left: 12px;
          }
          
          .discount-input {
            padding: 8px 12px 8px 40px;
          }
          
          .discount-preview {
            text-align: left;
          }
        `
          : ""}
      `}</style>

      <div className="bill-header">
        <div className="bill-header-top">
          <div className="bill-header-title">
            <ShoppingCart className="icon" />
            <h2>{t("currentBill")}</h2>
            {itemCount > 0 && (
              <span
                style={{
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {itemCount}
              </span>
            )}
          </div>
          {itemCount > 0 && (
            <button
              onClick={clearBill}
              className="bill-clear-btn"
              title="Clear all items"
            >
              <X className="icon" />
            </button>
          )}
        </div>
        {(customerName || selectedBarber) && (
          <div className="bill-meta">
            {customerName && (
              <p>
                {t("customer")}: {customerName}
              </p>
            )}
            {selectedBarber && customerName !== "Walk-in" && (
              <p>
                {t("barber")}: {selectedBarber}
              </p>
            )}
            {customerName === "Walk-in" && <p>{t("walkIn")}</p>}
          </div>
        )}
      </div>

      <div className="bill-list">
        {itemCount === 0 ? (
          <div className="bill-empty">
            <ShoppingCart className="icon-large" />
            <p>{t("noItemsAdded")}</p>
            <small>{t("selectItemsToAdd")}</small>
          </div>
        ) : (
          allItems.map((item) => (
            <div key={`${item.itemType}-${item.id}`} className="bill-item">
              <div className="bill-item-top">
                <div>
                  <h4>
                    {item.name}
                    <span className="bill-item-type">
                      {item.itemType === "service" ? (
                        <>
                          <Wrench size={10} />
                          {t("service")}
                        </>
                      ) : (
                        <>
                          <Package size={10} />
                          {t("product")}
                        </>
                      )}
                    </span>
                  </h4>
                  <p className="price">{item.price.toFixed(2)} EGP</p>
                  {item.itemType === "product" && item.stock_quantity && (
                    <p style={{ fontSize: "11px", color: "#6b7280" }}>
                      {t("stock")}: {item.stock_quantity} {t("available")}
                    </p>
                  )}
                </div>
                <button onClick={() => removeItem(item)} className="remove-btn">
                  <Trash2 className="icon-small" />
                </button>
              </div>
              <div className="bill-item-bottom">
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item, -1)}>
                    <Minus className="icon-small" />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item, 1)}
                    disabled={
                      item.itemType === "product" &&
                      item.quantity >= item.stock_quantity
                    }
                  >
                    <Plus className="icon-small white" />
                  </button>
                </div>
                <p className="total">
                  {(item.price * item.quantity).toFixed(2)} EGP
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {itemCount > 0 && (
        <>
          {/* Payment Options */}
          <div className="payment-options">
            <div className="payment-option-group">
              <label className="payment-option-label">
                {t("paymentMethod")}
              </label>
              <div className="payment-methods">
                <button
                  className={`payment-method ${
                    paymentMethod === "cash" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  💵 {t("cash")}
                </button>
                <button
                  className={`payment-method ${
                    paymentMethod === "card" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  💳 {t("card")}
                </button>
              </div>
            </div>

            {/* Enhanced Discount Section */}
            <div className="payment-option-group">
              <label className="payment-option-label">
                <Percent
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                {t("discount")}
              </label>

              {/* Discount Type Toggle */}
              <div className="discount-type-toggle">
                <button
                  className={`discount-type-btn ${
                    discountType === "flat" ? "active" : ""
                  }`}
                  onClick={() => handleDiscountTypeChange("flat")}
                  type="button"
                >
                  EGP {t("flat")}
                </button>
                <button
                  className={`discount-type-btn ${
                    discountType === "percentage" ? "active" : ""
                  }`}
                  onClick={() => handleDiscountTypeChange("percentage")}
                  type="button"
                >
                  % {t("percentage")}
                </button>
              </div>

              {/* Discount Input */}
              <div className="discount-input-container">
                <input
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? 100 : subtotal}
                  step={discountType === "percentage" ? "1" : "0.01"}
                  value={
                    discountType === "percentage"
                      ? discountPercentage
                      : discountAmount
                  }
                  onChange={handleDiscountChange}
                  className="discount-input"
                  placeholder={
                    discountType === "percentage"
                      ? t("enterDiscountPercentage")
                      : t("enterDiscountAmount")
                  }
                />
                <span className="discount-unit">
                  {discountType === "percentage" ? "%" : "EGP"}
                </span>
              </div>

              {/* Show calculated discount for percentage */}
              {discountType === "percentage" && discountPercentage > 0 && (
                <div className="discount-preview">
                  {t("discountAmount")}: {actualDiscountAmount.toFixed(2)} EGP
                </div>
              )}
            </div>

            <div className="payment-option-group">
              <label className="invoice-checkbox">
                <input
                  type="checkbox"
                  checked={sendInvoice}
                  onChange={(e) => setSendInvoice(e.target.checked)}
                />
                <Receipt size={14} />
                {t("sendInvoice")}
              </label>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bill-summary">
            {/* Breakdown */}
            <div className="breakdown-section">
              <div className="breakdown-item">
                <span>
                  {t("services")} ({selectedServices.length})
                </span>
                <span>{serviceSubtotal.toFixed(2)} EGP</span>
              </div>
              <div className="breakdown-item">
                <span>
                  {t("products")} ({selectedProducts.length})
                </span>
                <span>{productSubtotal.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Totals */}
            <div className="line">
              <span>{t("subtotal")}</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            {actualDiscountAmount > 0 && (
              <div className="line discount-line">
                <span>
                  {t("discount")}
                  {discountType === "percentage" && ` (${discountPercentage}%)`}
                </span>
                <span>-{actualDiscountAmount.toFixed(2)} EGP</span>
              </div>
            )}
            <div className="line">
              <span>{t("tax")}</span>
              <span>{tax.toFixed(2)} EGP</span>
            </div>
            <div className="line bold">
              <span>{t("total")}</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              <CreditCard className="icon-small white" />
              <span>
                {t("checkout")} - {total.toFixed(2)} EGP
              </span>
            </button>
          </div>
        </>
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          services={selectedServices}
          products={selectedProducts}
          subtotal={subtotal}
          discountAmount={actualDiscountAmount}
          discountType={discountType}
          discountPercentage={discountPercentage}
          tax={tax}
          total={total}
          customerName={customerName}
          barberName={selectedBarber || "No Barber Selected"}
          serviceDate={serviceDate.toISOString().split("T")[0]}
          paymentMethod={paymentMethod}
          sendInvoice={sendInvoice}
          onClose={() => setIsCheckoutOpen(false)}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default BillPanel;
