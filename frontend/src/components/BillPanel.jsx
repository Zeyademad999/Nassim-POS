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
    discountAmount,
    setDiscountAmount,
    discountedSubtotal,
    tax,
    total,
    customerName,
    selectedBarber,
    serviceDate,
    paymentMethod,
    setPaymentMethod,
    sendInvoice,
    setSendInvoice,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = usePOS();

  const handleCheckout = async () => {
    // ✅ Enhanced validation
    if (
      !customerName.trim() ||
      (!selectedBarber.trim() && customerName !== "Walk-in")
    ) {
      alert(
        "Please enter customer name and select a barber (or use Walk-in option)."
      );
      return;
    }

    if (itemCount === 0) {
      alert("Please add at least one service or product.");
      return;
    }

    setIsCheckoutOpen(true);

    // ✅ Enhanced bill data with products and payment info
    const bill = {
      customerName: customerName.trim(),
      barber: customerName === "Walk-in" ? "Walk-in" : selectedBarber,
      serviceDate: serviceDate.toISOString().split("T")[0],
      services: selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        quantity: s.quantity,
      })),
      products: selectedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
      subtotal,
      discountAmount,
      tax,
      total,
      paymentMethod,
      sendInvoice,
    };

    console.log("📦 Sending enhanced bill to backend:", bill);

    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bill),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save transaction");
      }

      const result = await res.json();
      console.log("✅ Bill saved to backend:", result);

      if (result.stockUpdated) {
        console.log("✅ Product stock levels updated");
      }
    } catch (err) {
      console.error("🔥 Failed to save bill:", err);
      alert(`Failed to checkout: ${err.message}`);
      setIsCheckoutOpen(false);
    }
  };

  const handleComplete = () => {
    clearBill();
  };

  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountAmount(Math.max(0, Math.min(value, subtotal)));
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
    <div className="bill-wrapper">
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

        .discount-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }

        .discount-input:focus {
          outline: none;
          border-color: #2563eb;
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
      `}</style>

      <div className="bill-header">
        <div className="bill-header-top">
          <div className="bill-header-title">
            <ShoppingCart className="icon" />
            <h2>Current Bill</h2>
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
            {customerName && <p>Customer: {customerName}</p>}
            {selectedBarber && customerName !== "Walk-in" && (
              <p>Barber: {selectedBarber}</p>
            )}
            {customerName === "Walk-in" && <p>Walk-in Customer</p>}
          </div>
        )}
      </div>

      <div className="bill-list">
        {itemCount === 0 ? (
          <div className="bill-empty">
            <ShoppingCart className="icon-large" />
            <p>No items added</p>
            <small>Select services or products to add them</small>
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
                          Service
                        </>
                      ) : (
                        <>
                          <Package size={10} />
                          Product
                        </>
                      )}
                    </span>
                  </h4>
                  <p className="price">{item.price.toFixed(2)} EGP</p>
                  {item.itemType === "product" && item.stock_quantity && (
                    <p style={{ fontSize: "11px", color: "#6b7280" }}>
                      Stock: {item.stock_quantity} available
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
              <label className="payment-option-label">Payment Method</label>
              <div className="payment-methods">
                <button
                  className={`payment-method ${
                    paymentMethod === "cash" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  💵 Cash
                </button>
                <button
                  className={`payment-method ${
                    paymentMethod === "card" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  💳 Card
                </button>
              </div>
            </div>

            <div className="payment-option-group">
              <label className="payment-option-label">
                <Percent
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                Discount Amount (EGP)
              </label>
              <input
                type="number"
                min="0"
                max={subtotal}
                step="0.01"
                value={discountAmount}
                onChange={handleDiscountChange}
                className="discount-input"
                placeholder="Enter discount amount"
              />
            </div>

            <div className="payment-option-group">
              <label className="invoice-checkbox">
                <input
                  type="checkbox"
                  checked={sendInvoice}
                  onChange={(e) => setSendInvoice(e.target.checked)}
                />
                <Receipt size={14} />
                Send Invoice (visible to financial users)
              </label>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bill-summary">
            {/* Breakdown */}
            <div className="breakdown-section">
              <div className="breakdown-item">
                <span>Services ({selectedServices.length})</span>
                <span>{serviceSubtotal.toFixed(2)} EGP</span>
              </div>
              <div className="breakdown-item">
                <span>Products ({selectedProducts.length})</span>
                <span>{productSubtotal.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Totals */}
            <div className="line">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            {discountAmount > 0 && (
              <div className="line discount-line">
                <span>Discount</span>
                <span>-{discountAmount.toFixed(2)} EGP</span>
              </div>
            )}
            <div className="line">
              <span>Tax (8%)</span>
              <span>{tax.toFixed(2)} EGP</span>
            </div>
            <div className="line bold">
              <span>Total</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              <CreditCard className="icon-small white" />
              <span>Checkout - {total.toFixed(2)} EGP</span>
            </button>
          </div>
        </>
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          services={selectedServices}
          products={selectedProducts}
          subtotal={subtotal}
          discountAmount={discountAmount}
          tax={tax}
          total={total}
          customerName={customerName}
          barberName={customerName === "Walk-in" ? "Walk-in" : selectedBarber}
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
