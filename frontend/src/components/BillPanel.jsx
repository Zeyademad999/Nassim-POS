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
  DollarSign,
  Calculator,
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
    const transactionData = {
      customer_name: customerName.trim(),
      customer_mobile: customerMobile?.trim() || null,
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
    <div className="bill-panel" dir={isRTL ? "rtl" : "ltr"}>
      {/* Bill Header */}
      <div className="bill-header">
        <div className="bill-title">
          <ShoppingCart size={20} />
          <h2>Current Bill</h2>
          {itemCount > 0 && <span className="item-count">{itemCount}</span>}
        </div>

        {itemCount > 0 && (
          <button className="clear-bill-btn" onClick={clearBill}>
            <X size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Bill Info */}
      {(customerName || selectedBarber) && (
        <div className="bill-info">
          {customerName && (
            <div className="info-item">
              <span className="info-label">Customer:</span>
              <span className="info-value">{customerName}</span>
            </div>
          )}
          {selectedBarber && customerName !== "Walk-in" && (
            <div className="info-item">
              <span className="info-label">Barber:</span>
              <span className="info-value">{selectedBarber}</span>
            </div>
          )}
          {customerName === "Walk-in" && (
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">Walk-in</span>
            </div>
          )}
        </div>
      )}

      {/* Bill Items */}
      <div className="bill-items">
        {itemCount === 0 ? (
          <div className="empty-bill">
            <ShoppingCart size={48} />
            <h3>No Items Added</h3>
            <p>Select services or products to add to your bill</p>
          </div>
        ) : (
          <div className="items-list">
            {allItems.map((item) => (
              <div key={`${item.itemType}-${item.id}`} className="bill-item">
                <div className="item-header">
                  <div className="item-info">
                    <div className="item-name">
                      {item.name}
                      <span className="item-type">
                        {item.itemType === "service" ? (
                          <>
                            <Wrench size={12} />
                            Service
                          </>
                        ) : (
                          <>
                            <Package size={12} />
                            Product
                          </>
                        )}
                      </span>
                    </div>
                    <div className="item-price">
                      {item.price.toFixed(2)} EGP
                    </div>
                    {item.itemType === "product" && item.stock_quantity && (
                      <div className="item-stock">
                        Stock: {item.stock_quantity} available
                      </div>
                    )}
                  </div>

                  <button
                    className="remove-item-btn"
                    onClick={() => removeItem(item)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item, 1)}
                      disabled={
                        item.itemType === "product" &&
                        item.quantity >= item.stock_quantity
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="item-total">
                    {(item.price * item.quantity).toFixed(2)} EGP
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Options */}
      {itemCount > 0 && (
        <div className="payment-section">
          <div className="section-title">
            <CreditCard size={16} />
            <span>Payment Options</span>
          </div>

          <div className="payment-methods">
            <button
              className={`payment-method ${
                paymentMethod === "cash" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("cash")}
            >
              <DollarSign size={16} />
              <span>Cash</span>
            </button>
            <button
              className={`payment-method ${
                paymentMethod === "card" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <CreditCard size={16} />
              <span>Card</span>
            </button>
          </div>

          {/* Discount Section */}
          <div className="discount-section">
            <div className="section-title">
              <Percent size={16} />
              <span>Discount</span>
            </div>

            <div className="discount-type-selector">
              <button
                className={`discount-type ${
                  discountType === "flat" ? "active" : ""
                }`}
                onClick={() => handleDiscountTypeChange("flat")}
              >
                EGP
              </button>
              <button
                className={`discount-type ${
                  discountType === "percentage" ? "active" : ""
                }`}
                onClick={() => handleDiscountTypeChange("percentage")}
              >
                %
              </button>
            </div>

            <div className="discount-input-wrapper">
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
                    ? "Enter percentage"
                    : "Enter amount"
                }
              />
              <span className="discount-unit">
                {discountType === "percentage" ? "%" : "EGP"}
              </span>
            </div>

            {discountType === "percentage" && discountPercentage > 0 && (
              <div className="discount-preview">
                Discount: {actualDiscountAmount.toFixed(2)} EGP
              </div>
            )}
          </div>

          {/* Invoice Option */}
          <div className="invoice-option">
            <label className="invoice-checkbox">
              <input
                type="checkbox"
                checked={sendInvoice}
                onChange={(e) => setSendInvoice(e.target.checked)}
              />
              <Receipt size={16} />
              <span>Send Invoice</span>
            </label>
          </div>
        </div>
      )}

      {/* Bill Summary */}
      {itemCount > 0 && (
        <div className="bill-summary">
          <div className="summary-breakdown">
            <div className="breakdown-item">
              <span>Services ({selectedServices.length})</span>
              <span>{serviceSubtotal.toFixed(2)} EGP</span>
            </div>
            <div className="breakdown-item">
              <span>Products ({selectedProducts.length})</span>
              <span>{productSubtotal.toFixed(2)} EGP</span>
            </div>
          </div>

          <div className="summary-totals">
            <div className="total-line">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>

            {actualDiscountAmount > 0 && (
              <div className="total-line discount">
                <span>
                  Discount
                  {discountType === "percentage" && ` (${discountPercentage}%)`}
                </span>
                <span>-{actualDiscountAmount.toFixed(2)} EGP</span>
              </div>
            )}

            <div className="total-line">
              <span>Tax</span>
              <span>{tax.toFixed(2)} EGP</span>
            </div>

            <div className="total-line final">
              <span>Total</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>
          </div>

          <button className="checkout-button" onClick={handleCheckout}>
            <Calculator size={18} />
            <span>Checkout - {total.toFixed(2)} EGP</span>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
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
