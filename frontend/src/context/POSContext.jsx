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

  // Customer and transaction info
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem("customerName") || "";
  });

  const [selectedBarber, setSelectedBarber] = useState(() => {
    return localStorage.getItem("selectedBarber") || "";
  });

  const [serviceDate, setServiceDate] = useState(() => {
    const stored = localStorage.getItem("serviceDate");
    return stored ? new Date(stored) : new Date();
  });

  // Payment and checkout state
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [sendInvoice, setSendInvoice] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const taxRate = 0.08;

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    localStorage.setItem("customerName", customerName);
    localStorage.setItem("selectedBarber", selectedBarber);
    localStorage.setItem("serviceDate", serviceDate.toISOString());
  }, [
    selectedServices,
    selectedProducts,
    customerName,
    selectedBarber,
    serviceDate,
  ]);

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
    setSelectedBarber("");
    setServiceDate(new Date());
    setDiscountAmount(0);
    setPaymentMethod("cash");
    setSendInvoice(false);

    localStorage.removeItem("selectedServices");
    localStorage.removeItem("selectedProducts");
    localStorage.removeItem("customerName");
    localStorage.removeItem("selectedBarber");
    localStorage.removeItem("serviceDate");
  };

  // Calculations
  const serviceSubtotal = selectedServices.reduce(
    (acc, s) => acc + s.price * s.quantity,
    0
  );

  const productSubtotal = selectedProducts.reduce(
    (acc, p) => acc + p.price * p.quantity,
    0
  );

  const subtotal = serviceSubtotal + productSubtotal;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
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

        // Products
        selectedProducts,
        addProduct,
        removeProduct,
        updateProductQuantity,

        // Combined
        allItems,
        itemCount,
        clearBill,

        // Calculations
        subtotal,
        serviceSubtotal,
        productSubtotal,
        discountAmount,
        setDiscountAmount,
        discountedSubtotal,
        tax,
        total,

        // Customer & Transaction
        customerName,
        setCustomerName,
        selectedBarber,
        setSelectedBarber,
        serviceDate,
        setServiceDate,

        // Payment & Invoice
        paymentMethod,
        setPaymentMethod,
        sendInvoice,
        setSendInvoice,

        // Checkout
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => useContext(POSContext);
