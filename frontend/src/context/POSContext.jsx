import React, { createContext, useContext, useState, useEffect } from "react";

const POSContext = createContext();

export const POSProvider = ({ children }) => {
  // Services and Products state
  const [selectedServices, setSelectedServices] = useState(() => {
    const stored = localStorage.getItem("selectedServices");
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedProducts, setSelectedProducts] = useState(() => {
    const stored = localStorage.getItem("selectedProducts");
    return stored ? JSON.parse(stored) : [];
  });

  // Customer and transaction info - Store both ID and name for proper lookup
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem("customerName") || "";
  });

  const [customerId, setCustomerId] = useState(() => {
    return localStorage.getItem("customerId") || "";
  });

  // Store both barber ID and name for proper database storage
  const [selectedBarber, setSelectedBarber] = useState(() => {
    const stored = localStorage.getItem("selectedBarber");
    return stored ? stored : "";
  });

  const [selectedBarberId, setSelectedBarberId] = useState(() => {
    return localStorage.getItem("selectedBarberId") || "";
  });

  const [serviceDate, setServiceDate] = useState(() => {
    const stored = localStorage.getItem("serviceDate");
    return stored ? new Date(stored) : new Date();
  });

  // Enhanced Discount State - NEW
  const [discountType, setDiscountType] = useState(() => {
    return localStorage.getItem("discountType") || "flat";
  });

  const [discountAmount, setDiscountAmount] = useState(() => {
    const stored = localStorage.getItem("discountAmount");
    return stored ? parseFloat(stored) : 0;
  });

  const [discountPercentage, setDiscountPercentage] = useState(() => {
    const stored = localStorage.getItem("discountPercentage");
    return stored ? parseFloat(stored) : 0;
  });

  // Payment and checkout state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [sendInvoice, setSendInvoice] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Payment tracking state
  const [cashTotal, setCashTotal] = useState(() => {
    const stored = localStorage.getItem("cashTotal");
    return stored ? parseFloat(stored) : 0;
  });

  const [cardTotal, setCardTotal] = useState(() => {
    const stored = localStorage.getItem("cardTotal");
    return stored ? parseFloat(stored) : 0;
  });

  const [transactionCount, setTransactionCount] = useState(() => {
    const stored = localStorage.getItem("transactionCount");
    return stored ? parseInt(stored) : 0;
  });

  const [cashCount, setCashCount] = useState(() => {
    const stored = localStorage.getItem("cashCount");
    return stored ? parseInt(stored) : 0;
  });

  const [cardCount, setCardCount] = useState(() => {
    const stored = localStorage.getItem("cardCount");
    return stored ? parseInt(stored) : 0;
  });

  const taxRate = 0;

  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerMobile, setCustomerMobile] = useState(() => {
    return localStorage.getItem("customerMobile") || "";
  });

  // LocalStorage sync - Updated to include discount type
  useEffect(() => {
    localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    localStorage.setItem("customerName", customerName);
    localStorage.setItem("customerId", customerId);
    localStorage.setItem("selectedBarber", selectedBarber);
    localStorage.setItem("selectedBarberId", selectedBarberId);
    localStorage.setItem("serviceDate", serviceDate.toISOString());
    localStorage.setItem("customerMobile", customerMobile); // Add this line

    localStorage.setItem("discountType", discountType);
    localStorage.setItem("discountAmount", discountAmount.toString());
    localStorage.setItem("discountPercentage", discountPercentage.toString());
    localStorage.setItem("cashTotal", cashTotal.toString());
    localStorage.setItem("cardTotal", cardTotal.toString());
    localStorage.setItem("transactionCount", transactionCount.toString());
    localStorage.setItem("cashCount", cashCount.toString());
    localStorage.setItem("cardCount", cardCount.toString());
  }, [
    selectedServices,
    selectedProducts,
    customerName,
    customerId,
    customerMobile, // Add this line

    selectedBarber,
    selectedBarberId,
    serviceDate,
    discountType,
    discountAmount,
    discountPercentage,
    cashTotal,
    cardTotal,
    transactionCount,
    cashCount,
    cardCount,
  ]);

  // Helper function to set barber with both ID and name
  const setBarberInfo = (barberId, barberName) => {
    setSelectedBarberId(barberId);
    setSelectedBarber(barberName);
  };

  // Helper function to set customer with both ID and name
  const setCustomerInfo = (id, name) => {
    setCustomerId(id);
    setCustomerName(name);
  };

  // Payment tracking functions
  const addPayment = (amount, method) => {
    if (method === "cash") {
      setCashTotal((prev) => prev + amount);
      setCashCount((prev) => prev + 1);
    } else if (method === "card") {
      setCardTotal((prev) => prev + amount);
      setCardCount((prev) => prev + 1);
    }
    setTransactionCount((prev) => prev + 1);
  };

  const resetPaymentTotals = () => {
    setCashTotal(0);
    setCardTotal(0);
    setTransactionCount(0);
    setCashCount(0);
    setCardCount(0);
    localStorage.removeItem("cashTotal");
    localStorage.removeItem("cardTotal");
    localStorage.removeItem("transactionCount");
    localStorage.removeItem("cashCount");
    localStorage.removeItem("cardCount");
  };

  const generateSettlementReceipt = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Settlement Receipt - ${dateStr}</title>
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
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 5px;
    }
    .settlement-title {
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
    }
    .section { 
      margin: 15px 0; 
    }
    .row { 
      display: flex; 
      justify-content: space-between; 
      margin: 5px 0; 
      font-size: 14px;
    }
    .total-row { 
      border-top: 2px solid #000; 
      font-weight: bold; 
      margin-top: 15px; 
      padding-top: 8px; 
      font-size: 16px;
    }
    .payment-section {
      margin: 15px 0;
      padding: 10px 0;
      border-top: 1px dashed #666;
    }
    .payment-method {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 13px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 11px; 
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">NASSIM BARBER SHOP</div>
    <div>Settlement Report</div>
    <div class="settlement-title">End of Day Summary</div>
  </div>
  
  <div class="section">
    <div class="row">
      <span>Date:</span>
      <span>${dateStr}</span>
    </div>
    <div class="row">
      <span>Time:</span>
      <span>${timeStr}</span>
    </div>
  </div>

  <div class="payment-section">
    <div class="payment-method">💵 CASH PAYMENTS</div>
    <div class="row">
      <span>Transactions:</span>
      <span>${cashCount}</span>
    </div>
    <div class="row">
      <span>Total Amount:</span>
      <span>${cashTotal.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="payment-section">
    <div class="payment-method">💳 CARD PAYMENTS</div>
    <div class="row">
      <span>Transactions:</span>
      <span>${cardCount}</span>
    </div>
    <div class="row">
      <span>Total Amount:</span>
      <span>${cardTotal.toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="total-row">
    <div class="row">
      <span>Total Transactions:</span>
      <span>${transactionCount}</span>
    </div>
    <div class="row">
      <span>Total Revenue:</span>
      <span>${(cashTotal + cardTotal).toFixed(2)} EGP</span>
    </div>
  </div>

  <div class="footer">
    Settlement Completed<br>
    Thank You
  </div>
</body>
</html>
    `;
  };

  // Service management functions
  const addService = (service) => {
    const existing = selectedServices.find((s) => s.id === service.id);
    if (existing) {
      const updated = selectedServices.map((s) =>
        s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
      );
      setSelectedServices(updated);
    } else {
      setSelectedServices([
        ...selectedServices,
        { ...service, quantity: 1, type: "service" },
      ]);
    }
  };

  const removeService = (id) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateServiceQuantity = (id, delta) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s
      )
    );
  };

  // Product management functions
  const addProduct = (product) => {
    const existing = selectedProducts.find((p) => p.id === product.id);
    if (existing) {
      // Check stock limit
      if (existing.quantity >= product.stock_quantity) {
        alert(
          `Cannot add more ${product.name}. Only ${product.stock_quantity} available in stock.`
        );
        return;
      }
      const updated = selectedProducts.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      );
      setSelectedProducts(updated);
    } else {
      if (product.stock_quantity === 0) {
        alert(`${product.name} is out of stock.`);
        return;
      }
      setSelectedProducts([
        ...selectedProducts,
        { ...product, quantity: 1, type: "product" },
      ]);
    }
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProductQuantity = (id, delta) => {
    const product = selectedProducts.find((p) => p.id === id);
    if (!product) return;

    const newQuantity = product.quantity + delta;

    // Check minimum quantity
    if (newQuantity < 1) return;

    // Check stock limit
    if (newQuantity > product.stock_quantity) {
      alert(
        `Cannot add more ${product.name}. Only ${product.stock_quantity} available in stock.`
      );
      return;
    }

    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: newQuantity } : p))
    );
  };

  // Clear all
  const clearBill = () => {
    setSelectedServices([]);
    setSelectedProducts([]);
    setCustomerName("");
    setCustomerId("");
    setSelectedBarber("");
    setSelectedBarberId("");
    setServiceDate(new Date());
    setDiscountType("flat");
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setPaymentMethod("cash");
    setSendInvoice(false);
    setCustomerMobile("");

    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedProducts");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerId");
    localStorage.removeItem("selectedBarber");
    localStorage.removeItem("selectedBarberId");
    localStorage.removeItem("serviceDate");
    localStorage.removeItem("discountType");
    localStorage.removeItem("discountAmount");
    localStorage.removeItem("discountPercentage");
    localStorage.removeItem("customerMobile"); // Add this line
  };

  // Enhanced Calculations with Discount Types
  const serviceSubtotal = selectedServices.reduce(
    (acc, s) => acc + s.price * s.quantity,
    0
  );

  const productSubtotal = selectedProducts.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0
  );

  const subtotal = serviceSubtotal + productSubtotal;

  // Calculate actual discount amount based on type
  const calculateDiscountAmount = () => {
    if (discountType === "percentage") {
      return (subtotal * discountPercentage) / 100;
    }
    return discountAmount;
  };

  const actualDiscountAmount = calculateDiscountAmount();
  const discountedSubtotal = Math.max(0, subtotal - actualDiscountAmount);
  const tax = +(discountedSubtotal * taxRate).toFixed(2);
  const total = +(discountedSubtotal + tax).toFixed(2);

  // Get all items for display
  const allItems = [
    ...selectedServices.map((s) => ({ ...s, itemType: "service" })),
    ...selectedProducts.map((p) => ({ ...p, itemType: "product" })),
  ];

  const itemCount = selectedServices.length + selectedProducts.length;

  return (
    <POSContext.Provider
      value={{
        // Services
        selectedServices,
        addService,
        removeService,
        updateServiceQuantity,
        searchCustomer: customerSearch,
        setSearchCustomer: setCustomerSearch,
        clearCustomerSearch: () => {
          setCustomerSearch("");
          setShowCustomerDropdown(false);
        },

        // Products
        selectedProducts,
        addProduct,
        removeProduct,
        updateProductQuantity,

        // Combined
        allItems,
        itemCount,
        clearBill,

        // Enhanced Calculations with Discount Types
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
        discountedSubtotal,
        tax,
        total,

        // Customer & Transaction
        customerName,
        setCustomerName,
        customerId,
        setCustomerId,
        setCustomerInfo,
        selectedBarber,
        setSelectedBarber,
        selectedBarberId,
        setSelectedBarberId,
        setBarberInfo,
        serviceDate,
        setServiceDate,
        customerMobile,
        setCustomerMobile,

        // Payment & Invoice
        paymentMethod,
        setPaymentMethod,
        sendInvoice,
        setSendInvoice,

        // Checkout
        isCheckoutOpen,
        setIsCheckoutOpen,

        // Payment Tracking
        cashTotal,
        cardTotal,
        transactionCount,
        cashCount,
        cardCount,
        addPayment,
        resetPaymentTotals,
        generateSettlementReceipt,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => useContext(POSContext);
