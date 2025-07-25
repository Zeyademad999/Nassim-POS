import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const translations = {
    en: {
      // Shop & Navigation
      shopName: "Nassim Barber Shop",
      pointOfSale: "Point of Sale System",
      logout: "Logout",

      // Products & Services
      services: "Services",
      products: "Products",
      service: "Service",
      product: "Product",
      noServicesAvailable: "No services available",
      noProductsAvailable: "No products available",

      // Customer Management
      customer: "Customer",
      barber: "Barber",
      newCustomer: "New Customer",
      walkInCustomer: "Walk-in Customer",
      walkIn: "Walk-in Service",
      enterCustomerName: "Enter customer name",
      selectBarber: "Select Barber",
      pleaseEnterCustomer: "Please enter customer and barber details",

      // Bill & Cart
      currentBill: "Current Bill",
      noItemsAdded: "No items added",
      selectItemsToAdd: "Select services or products to add",
      stock: "Stock",
      available: "available",

      // Payment & Checkout
      paymentMethod: "Payment Method",
      cash: "Cash",
      card: "Card",

      // Enhanced Discount Translations
      discount: "Discount",
      discountAmount: "Discount Amount",
      flat: "Flat",
      percentage: "Percentage",
      enterDiscountAmount: "Enter discount amount",
      enterDiscountPercentage: "Enter discount %",

      // Financial
      subtotal: "Subtotal",
      tax: "Tax (8%)",
      total: "Total",
      checkout: "Checkout",

      // Invoice
      sendInvoice: "Send Invoice",

      // Settlement
      transactions: "Transactions",
      cashPayments: "Cash Payments",
      cardPayments: "Card Payments",
      printSettlement: "Print Settlement",
      resetTotals: "Reset Totals",
      resetConfirm: "Are you sure you want to reset all payment totals?",

      // Errors & Validation
      pleaseAddItems: "Please add items to the bill",
      checkoutFailed: "Checkout failed",
    },

    ar: {
      // Shop & Navigation
      shopName: "حلاق ناصم",
      pointOfSale: "نظام نقطة البيع",
      logout: "تسجيل خروج",

      // Products & Services
      services: "الخدمات",
      products: "المنتجات",
      service: "خدمة",
      product: "منتج",
      noServicesAvailable: "لا توجد خدمات متاحة",
      noProductsAvailable: "لا توجد منتجات متاحة",

      // Customer Management
      customer: "العميل",
      barber: "الحلاق",
      newCustomer: "عميل جديد",
      walkInCustomer: "عميل عادي",
      walkIn: "خدمة عادية",
      enterCustomerName: "أدخل اسم العميل",
      selectBarber: "اختر الحلاق",
      pleaseEnterCustomer: "يرجى إدخال بيانات العميل والحلاق",

      // Bill & Cart
      currentBill: "الفاتورة الحالية",
      noItemsAdded: "لم تتم إضافة عناصر",
      selectItemsToAdd: "اختر الخدمات أو المنتجات للإضافة",
      stock: "المخزون",
      available: "متاح",

      // Payment & Checkout
      paymentMethod: "طريقة الدفع",
      cash: "نقدي",
      card: "بطاقة",

      // Enhanced Discount Translations
      discount: "خصم",
      discountAmount: "مبلغ الخصم",
      flat: "مبلغ ثابت",
      percentage: "نسبة مئوية",
      enterDiscountAmount: "أدخل مبلغ الخصم",
      enterDiscountPercentage: "أدخل نسبة الخصم %",

      // Financial
      subtotal: "المجموع الفرعي",
      tax: "ضريبة (8%)",
      total: "الإجمالي",
      checkout: "إتمام الشراء",

      // Invoice
      sendInvoice: "إرسال فاتورة",

      // Settlement
      transactions: "المعاملات",
      cashPayments: "المدفوعات النقدية",
      cardPayments: "مدفوعات البطاقة",
      printSettlement: "طباعة التسوية",
      resetTotals: "إعادة تعيين المجاميع",
      resetConfirm: "هل أنت متأكد من إعادة تعيين جميع مجاميع الدفع؟",

      // Errors & Validation
      pleaseAddItems: "يرجى إضافة عناصر للفاتورة",
      checkoutFailed: "فشل في إتمام الشراء",
    },
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
