import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

// Arabic translations
const translations = {
  en: {
    // Header
    shopName: "Nassim Select Barber",
    pointOfSale: "Point of Sale System",
    logout: "Logout",

    // Payment Tracking
    total: "Total",
    transactions: "Transactions",
    cashPayments: "Cash Payments",
    cardPayments: "Card Payments",
    printSettlement: "Print Settlement",
    resetTotals: "Reset Totals",
    resetConfirm:
      "Are you sure you want to reset all payment totals? This action cannot be undone.",

    // Customer & Barber
    newCustomer: "New Customer",
    walkInCustomer: "Walk-in Customer",
    enterCustomerName: "Enter customer name",
    selectBarber: "Select Barber",

    // Tabs
    services: "Services",
    products: "Products",
    noServicesAvailable: "No services available",
    noProductsAvailable: "No products available",

    // Bill Panel
    currentBill: "Current Bill",
    noItemsAdded: "No items added",
    selectItemsToAdd: "Select services or products to add them",
    customer: "Customer",
    barber: "Barber",
    walkIn: "Walk-in",
    service: "Service",
    product: "Product",
    stock: "Stock",
    available: "available",

    // Payment
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Card",
    discountAmount: "Discount Amount (EGP)",
    enterDiscountAmount: "Enter discount amount",
    sendInvoice: "Send Invoice (visible to financial users)",

    // Bill Summary
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax (8%)",
    checkout: "Checkout",

    // Validation Messages
    pleaseEnterCustomer:
      "Please enter customer name and select a barber (or use Walk-in option).",
    pleaseAddItems: "Please add at least one service or product.",
    checkoutFailed: "Failed to checkout",
    cannotAddMore: "Cannot add more",
    onlyAvailable: "Only",
    availableInStock: "available in stock.",
    outOfStock: "is out of stock.",

    // Settlement Receipt
    settlementReport: "Settlement Report",
    endOfDayReport: "End of Day Summary",
    date: "Date",
    time: "Time",
    totalTransactions: "TOTAL TRANSACTIONS",
    totalRevenue: "TOTAL REVENUE",
    settlementCompleted: "Settlement completed by cashier",
    thankYouMessage: "Thank you for using Nassim POS System",
  },

  ar: {
    // Header
    shopName: "صالون نسيم للحلاقة",
    pointOfSale: "نظام نقاط البيع",
    logout: "تسجيل خروج",

    // Payment Tracking
    total: "المجموع",
    transactions: "المعاملات",
    cashPayments: "المدفوعات النقدية",
    cardPayments: "مدفوعات البطاقة",
    printSettlement: "طباعة التسوية",
    resetTotals: "إعادة تعيين المجاميع",
    resetConfirm:
      "هل أنت متأكد من أنك تريد إعادة تعيين جميع مجاميع الدفع؟ لا يمكن التراجع عن هذا الإجراء.",

    // Customer & Barber
    newCustomer: "عميل جديد",
    walkInCustomer: "عميل عابر",
    enterCustomerName: "أدخل اسم العميل",
    selectBarber: "اختر الحلاق",

    // Tabs
    services: "الخدمات",
    products: "المنتجات",
    noServicesAvailable: "لا توجد خدمات متاحة",
    noProductsAvailable: "لا توجد منتجات متاحة",

    // Bill Panel
    currentBill: "الفاتورة الحالية",
    noItemsAdded: "لم يتم إضافة عناصر",
    selectItemsToAdd: "اختر الخدمات أو المنتجات لإضافتها",
    customer: "العميل",
    barber: "الحلاق",
    walkIn: "عميل عابر",
    service: "خدمة",
    product: "منتج",
    stock: "المخزون",
    available: "متاح",

    // Payment
    paymentMethod: "طريقة الدفع",
    cash: "نقداً",
    card: "بطاقة",
    discountAmount: "مبلغ الخصم (جنيه)",
    enterDiscountAmount: "أدخل مبلغ الخصم",
    sendInvoice: "إرسال فاتورة (مرئية للمستخدمين الماليين)",

    // Bill Summary
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    tax: "الضريبة (8%)",
    checkout: "الدفع",

    // Validation Messages
    pleaseEnterCustomer:
      "يرجى إدخال اسم العميل واختيار حلاق (أو استخدام خيار العميل العابر).",
    pleaseAddItems: "يرجى إضافة خدمة أو منتج واحد على الأقل.",
    checkoutFailed: "فشل في عملية الدفع",
    cannotAddMore: "لا يمكن إضافة المزيد",
    onlyAvailable: "متاح فقط",
    availableInStock: "في المخزون.",
    outOfStock: "غير متوفر في المخزون.",

    // Settlement Receipt
    settlementReport: "تقرير التسوية",
    endOfDayReport: "ملخص نهاية اليوم",
    date: "التاريخ",
    time: "الوقت",
    totalTransactions: "إجمالي المعاملات",
    totalRevenue: "إجمالي الإيرادات",
    settlementCompleted: "تمت التسوية بواسطة أمين الصندوق",
    thankYouMessage: "شكراً لاستخدام نظام نسيم للحلاقة",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("pos-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("pos-language", language);

    // Set document direction for Arabic
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        toggleLanguage,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
