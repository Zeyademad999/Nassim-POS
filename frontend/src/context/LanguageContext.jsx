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

      // Customer Management
      customerManagement: "Customer Management",
      manageCustomersSubtext: "Manage your customers and their preferences",
      addCustomer: "Add Customer",
      addNewCustomer: "Add New Customer",
      editCustomer: "Edit Customer",
      totalCustomers: "Total Customers",
      activeCustomers: "Active Customers",
      avgCustomerSpend: "Avg. Customer Spend",
      withPreferences: "With Preferences",
      searchCustomers: "Search customers by name or mobile...",
      nameAZ: "Name (A-Z)",
      nameZA: "Name (Z-A)",
      mostVisits: "Most Visits",
      highestSpender: "Highest Spender",
      newestFirst: "Newest First",
      recentVisit: "Recent Visit",
      viewDetails: "View Details",
      deleteCustomer: "Delete Customer",
      prefers: "Prefers",
      visits: "visits",
      preferences: "Preferences",
      notes: "Notes",
      bookAppointment: "Book Appointment",
      lastVisit: "Last visit",
      noCustomersFound: "No customers found",
      tryAdjustingSearch: "Try adjusting your search terms",
      addFirstCustomer: "Add your first customer to get started",
      addFirstCustomerBtn: "Add First Customer",
      customerDetails: "Customer Details",
      spent: "spent",
      preferencesAndNotes: "Preferences & Notes",
      preferredBarber: "Preferred Barber",
      noPreference: "No preference",
      servicePreferences: "Service Preferences",
      noneSpecified: "None specified",
      noNotes: "No notes",
      recentBookings: "Recent Bookings",
      recentTransactions: "Recent Transactions",
      bookAppointmentFor: "Book Appointment for",
      deleteCustomerConfirm: "Are you sure you want to delete this customer?",

      // Booking Management
      bookingManagement: "Booking Management",
      manageAppointmentsSubtext: "Manage appointments and schedules",
      refresh: "Refresh",
      newBooking: "New Booking",
      totalBookings: "Total Bookings",
      scheduled: "Scheduled",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      estRevenue: "Est. Revenue",
      date: "Date",
      allBarbers: "All Barbers",
      status: "Status",
      allStatus: "All Status",
      loadingBookings: "Loading bookings...",
      noBookingsFound: "No bookings found",
      noBookingsMatch: "No bookings match your current filters",
      noBookingsToday: "No bookings scheduled for today",
      createFirstBooking: "Create First Booking",
      services: "Services",
      estCost: "Est. Cost",
      confirmBooking: "Confirm Booking",
      completeBooking: "Complete Booking",
      complete: "Complete",
      cancelBooking: "Cancel Booking",
      editBooking: "Edit Booking",
      deleteBooking: "Delete Booking",
      createNewBooking: "Create New Booking",
      selectCustomerMessage:
        "Please select a customer from the Customer Management page to create a booking.",
      cancel: "Cancel",
      goToCustomers: "Go to Customers",
      deleteBookingConfirm: "Are you sure you want to delete this booking?",
      completeBookingConfirm:
        "Mark this booking as completed and create a transaction?",
      bookingCompletedSuccess:
        "Booking completed and transaction created successfully!",

      // Expense Management
      expenseTracking: "Expense Tracking",
      trackBusinessExpenses: "Track your business expenses",
      addExpense: "Add Expense",
      totalExpenses: "Total Expenses",
      totalAmount: "Total Amount",
      generalExpenses: "General Expenses",
      recurringExpenses: "Recurring Expenses",
      timePeriod: "Time Period",
      expenseType: "Expense Type",
      today: "Today",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      last3Months: "Last 3 Months",
      thisYear: "This Year",
      allTime: "All Time",
      allTypes: "All Types",
      general: "General",
      recurring: "Recurring",
      loadingExpenses: "Loading expenses...",
      noExpensesFound: "No expenses found",
      noExpensesMatch: "No expenses match your current filters",
      startTrackingExpenses: "Start tracking your business expenses",
      addFirstExpense: "Add First Expense",
      expenseDate: "Date",
      expenseName: "Name",
      expenseAmount: "Amount",
      expenseNotes: "Notes",
      actions: "Actions",
      addNewExpense: "Add New Expense",
      expenseNameLabel: "Expense Name",
      expenseNamePlaceholder: "Enter expense name",
      amountEGP: "Amount (EGP)",
      expenseTypeLabel: "Expense Type",
      generalExpense: "General Expense",
      recurringExpense: "Recurring Expense",
      notesOptional: "Notes (Optional)",
      notesPlaceholder: "Add any additional notes...",
      adding: "Adding...",
      deleteExpenseConfirm: "Are you sure you want to delete this expense?",
      nameAmountDateRequired: "Name, amount, and date are required",
      "Optional notes": "Optional notes",
      amountPlaceholder: "0.00",
      "Enter expense name": "Enter expense name",
      "Add any additional notes...": "Add any additional notes...",
      "Are you sure you want to delete this expense?":
        "Are you sure you want to delete this expense?",
      "Failed to load expenses": "Failed to load expenses",
      "Failed to add expense": "Failed to add expense",
      "Failed to update expense": "Failed to update expense",
      "Failed to delete expense": "Failed to delete expense",
      "No expenses match your current filters":
        "No expenses match your current filters",
      "Start tracking your business expenses":
        "Start tracking your business expenses",
      "Add First Expense": "Add First Expense",
      "Loading expenses...": "Loading expenses...",
      "No expenses found": "No expenses found",
      "Last 7 Days": "Last 7 Days",
      "Last 30 Days": "Last 30 Days",
      "Last 3 Months": "Last 3 Months",
      "This Year": "This Year",
      "All Time": "All Time",
      "All Types": "All Types",
      "General Expenses": "General Expenses",
      "Recurring Expenses": "Recurring Expenses",
      "Time Period": "Time Period",
      "Expense Type": "Expense Type",
      "General Expense": "General Expense",
      "Recurring Expense": "Recurring Expense",
      "Notes (Optional)": "Notes (Optional)",
      "Add New Expense": "Add New Expense",
      "Expense Name": "Expense Name",
      "Amount (EGP)": "Amount (EGP)",
      required: "*",

      // ManageProducts additional translations
      "Quick Add Supplier": "Quick Add Supplier",
      "Enter supplier name": "Enter supplier name",
      "Contact person name": "Contact person name",
      Phone: "Phone",
      "Select Supplier (Optional)": "Select Supplier (Optional)",
      "Enter product name": "Enter product name",
      "e.g., Hair Care, Styling": "e.g., Hair Care, Styling",
      "Select Supplier": "Select Supplier",
      "Product name": "Product name",
      "Selling price": "Selling price",
      "Cost price": "Cost price",
      "Stock quantity": "Stock quantity",
      "Selling Price:": "Selling Price",
      "Cost Price:": "Cost Price",
      "Stock:": "Stock",
      units: "units",
      "Reorder Level:": "Reorder Level",
      "Supplier:": "Supplier",
      margin: "margin",
      Remove: "Remove",
      "Add a new supplier to your network":
        "Add a new supplier to your network",
      "Phone Number": "Phone Number",
      "Supplier address": "Supplier address",
      "Contact:": "Contact",
      "Products Supplied:": "Products Supplied",
      items: "items",
      "Supplier name": "Supplier name",
      "Contact person": "Contact person",
      "Phone number": "Phone number",
      "Failed to load products": "Failed to load products",
      "Failed to load suppliers": "Failed to load suppliers",
      "Failed to add product": "Failed to add product",
      "Failed to add supplier": "Failed to add supplier",
      "Failed to update product": "Failed to update product",
      "Failed to update supplier": "Failed to update supplier",
      "Failed to delete product": "Failed to delete product",
      "Failed to delete supplier": "Failed to delete supplier",
      "Out of Stock": "Out of Stock",
      "Low Stock": "Low Stock",
      "In Stock": "In Stock",
      "No Supplier": "No Supplier",

      "Business Intelligence": "Business Intelligence",
      "Export PDF": "Export PDF",
      "Export Excel": "Export Excel",
      "Exporting...": "Exporting...",
      Refresh: "Refresh",
      "Loading...": "Loading...",
      "Report Filters": "Report Filters",
      "Custom Range": "Custom Range",
      "Start Date": "Start Date",
      "End Date": "End Date",
      Overview: "Overview",
      Financial: "Financial",
      "P&L Report": "P&L Report",
      "Staff Performance": "Staff Performance",
      Transactions: "Transactions",

      // Metrics
      "Total Revenue": "Total Revenue",
      "Total Transactions": "Total Transactions",
      "Average Order Value": "Average Order Value",
      "Top Service": "Top Service",
      "vs last period": "vs last period",
      revenue: "revenue",
      "Revenue Trend": "Revenue Trend",
      "No revenue data available for the selected period":
        "No revenue data available for the selected period",

      // Financial Tab
      "Revenue by Service": "Revenue by Service",
      "Payment Methods": "Payment Methods",
      "No service revenue data available": "No service revenue data available",
      "No payment method data available": "No payment method data available",
      "Revenue Insight": "Revenue Insight",
      "Payment Trends": "Payment Trends",
      "Your top service": "Your top service",
      "generates the highest revenue. Consider promoting similar services to maximize earnings.":
        "generates the highest revenue. Consider promoting similar services to maximize earnings.",
      "is your most popular payment method. Consider offering incentives for digital payments.":
        "is your most popular payment method. Consider offering incentives for digital payments.",

      // P&L Report
      "Total Income": "Total Income",
      "Service Revenue": "Service Revenue",
      "Product Revenue": "Product Revenue",
      "Net Profit": "Net Profit",
      "Profit Margin": "Profit Margin",
      "Expense Ratio": "Expense Ratio",
      "Profit & Loss Statement": "Profit & Loss Statement",
      Period: "Period",
      to: "to",
      Description: "Description",
      Amount: "Amount",
      "% of Revenue": "% of Revenue",
      INCOME: "INCOME",
      EXPENSES: "EXPENSES",
      "NET PROFIT/LOSS": "NET PROFIT/LOSS",
      "Recent Expenses": "Recent Expenses",

      // Products Tab
      "Product Sales Performance - Revenue & Units Sold":
        "Product Sales Performance - Revenue & Units Sold",
      "No product sales data available": "No product sales data available",
      "Low Stock Alert": "Low Stock Alert",
      Product: "Product",
      "Current Stock": "Current Stock",
      "Reorder Level": "Reorder Level",
      "Units Sold": "Units Sold",

      // Staff Performance
      "Barber Performance Analysis - Revenue & Transactions":
        "Barber Performance Analysis - Revenue & Transactions",
      "No barber performance data available":
        "No barber performance data available",
      "Detailed Staff Performance": "Detailed Staff Performance",
      Barber: "Barber",
      "Avg. per Transaction": "Avg. per Transaction",
      Performance: "Performance",
      "Top Performer": "Top Performer",
      Good: "Good",
      Average: "Average",
      "Your top barber": "Your top barber",
      "is leading with": "is leading with",
      "in revenue. Consider recognizing their excellent performance!":
        "in revenue. Consider recognizing their excellent performance!",
      "Growth Opportunity": "Growth Opportunity",
      "Focus on training and development for lower-performing staff members to boost overall team productivity and customer satisfaction.":
        "Focus on training and development for lower-performing staff members to boost overall team productivity and customer satisfaction.",

      // Transactions
      "Transaction Management": "Transaction Management",
      "Add Transaction": "Add Transaction",
      "Add New Transaction": "Add New Transaction",
      "Customer Name": "Customer Name",
      "Barber Name": "Barber Name",
      "Total Amount": "Total Amount",
      "Payment Method": "Payment Method",
      "Save Transaction": "Save Transaction",
      Customer: "Customer",
      "Recent Transactions": "Recent Transactions",
      "Services/Products": "Services/Products",

      // Chart labels
      "Daily Revenue": "Daily Revenue",
      Revenue: "Revenue",
      Count: "Count",

      // Common
      "Loading comprehensive reports...": "Loading comprehensive reports...",
      "Export failed": "Export failed",
      "Failed to export PDF. Please try again.":
        "Failed to export PDF. Please try again.",
      "Failed to export Excel. Please try again.":
        "Failed to export Excel. Please try again.",
      "Failed to update transaction": "Failed to update transaction",
      "Failed to update transaction. Please try again.":
        "Failed to update transaction. Please try again.",
      "Are you sure you want to delete this transaction? This action cannot be undone.":
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      "Failed to delete transaction": "Failed to delete transaction",
      "Failed to delete transaction. Please try again.":
        "Failed to delete transaction. Please try again.",
      "Failed to add transaction": "Failed to add transaction",
      "Failed to add transaction. Please try again.":
        "Failed to add transaction. Please try again.",

      // Payment method translations
      CASH: "CASH",
      CARD: "CARD",

      // Currency
      currency: "EGP",

      // ViewReceipts Component Translations
      "Receipts Management": "Receipts Management",
      "View and manage all transaction receipts":
        "View and manage all transaction receipts",
      "Export CSV": "Export CSV",
      Refresh: "Refresh",
      "Loading...": "Loading...",

      // Statistics
      "Total Receipts": "Total Receipts",
      "Total Revenue": "Total Revenue",
      "Average Receipt": "Average Receipt",
      "Top Barber": "Top Barber",

      // Filters
      "Search receipts...": "Search receipts...",
      "From Date": "From Date",
      "To Date": "To Date",
      "Filter by barber": "Filter by barber",
      "All Methods": "All Methods",
      Cash: "Cash",
      Card: "Card",
      "Min Amount": "Min Amount",
      "Max Amount": "Max Amount",
      "Clear Filters": "Clear Filters",

      // Table Headers
      "Date & Time": "Date & Time",
      "Receipt ID": "Receipt ID",
      Customer: "Customer",
      Barber: "Barber",
      Items: "Items",
      Payment: "Payment",
      Total: "Total",
      Actions: "Actions",

      // Table Content
      "Walk-in": "Walk-in",
      "N/A": "N/A",
      Empty: "Empty",
      Service: "Service",
      Product: "Product",
      s: "s", // plural suffix
      "View Receipt": "View Receipt",

      // Results and States
      Showing: "Showing",
      of: "of",
      receipts: "receipts",
      "Loading receipts...": "Loading receipts...",
      "No receipts found": "No receipts found",
      "No receipts available": "No receipts available",
      "No receipts match your filters": "No receipts match your filters",

      // Error Messages
      "Failed to fetch receipts": "Failed to fetch receipts",
      "Failed to load receipts. Please try again.":
        "Failed to load receipts. Please try again.",

      // CSV Export Headers
      Date: "Date",
      Services: "Services",
      Products: "Products",

      // Currency
      currency: "EGP",

      // CheckoutModal Component Translations
      "Transaction Complete!": "Transaction Complete!",
      "Payment Successful": "Payment Successful",
      "Transaction has been processed": "Transaction has been processed",

      // Invoice Details
      "Invoice Number": "Invoice Number",
      "Receipt Number": "Receipt Number",
      "Date & Time": "Date & Time",
      "Service Date": "Service Date",
      at: "at",

      // Customer & Service Info
      Customer: "Customer",
      Barber: "Barber",
      "Service Type": "Service Type",
      "Walk-in Customer": "Walk-in Customer",

      // Items Section
      Items: "Items",
      Qty: "Qty",
      Service: "Service",
      Product: "Product",

      // Totals Section
      Subtotal: "Subtotal",
      "Discount Applied": "Discount Applied",
      Tax: "Tax",
      "Total Paid": "Total Paid",

      // Payment Info
      "Paid via": "Paid via",
      CASH: "CASH",
      CARD: "CARD",

      // Invoice Status
      "Invoice sent to financial records (visible to finance team)":
        "Invoice sent to financial records (visible to finance team)",
      "Invoice visible to super admin only":
        "Invoice visible to super admin only",

      // Export Buttons
      "Professional PDF Invoice": "Professional PDF Invoice",
      "Excel Report": "Excel Report",
      "Complete & New Transaction": "Complete & New Transaction",

      // PDF Content
      "Premium Grooming & Retail Services":
        "Premium Grooming & Retail Services",
      INVOICE: "INVOICE",
      "Invoice #": "Invoice #",
      "Receipt #": "Receipt #",
      Date: "Date",
      Time: "Time",
      "Business Details": "Business Details",
      "Customer Details": "Customer Details",
      "Payment Method": "Payment Method",
      Description: "Description",
      Type: "Type",
      Qty: "Qty",
      Price: "Price",
      Total: "Total",
      Discount: "Discount",
      TOTAL: "TOTAL",
      "Thank you for choosing Nassim Select Barber!":
        "Thank you for choosing Nassim Select Barber!",
      "Follow us on social media @nassimbarber":
        "Follow us on social media @nassimbarber",
      "This invoice has been sent to financial records.":
        "This invoice has been sent to financial records.",

      // Excel Export
      "NASSIM SELECT BARBER - INVOICE": "NASSIM SELECT BARBER - INVOICE",
      "SERVICES & PRODUCTS": "SERVICES & PRODUCTS",
      Quantity: "Quantity",
      "Unit Price": "Unit Price",
      TOTALS: "TOTALS",
      "Invoice Sent to Financial Records": "Invoice Sent to Financial Records",
      YES: "YES",
      NO: "NO",
      Invoice: "Invoice",

      // Currency
      currency: "EGP",
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

      // Customer Management
      customerManagement: "إدارة العملاء",
      manageCustomersSubtext: "إدارة عملائك وتفضيلاتهم",
      addCustomer: "إضافة عميل",
      addNewCustomer: "إضافة عميل جديد",
      editCustomer: "تعديل العميل",
      totalCustomers: "إجمالي العملاء",
      activeCustomers: "العملاء النشطون",
      avgCustomerSpend: "متوسط إنفاق العميل",
      withPreferences: "مع التفضيلات",
      searchCustomers: "البحث عن العملاء بالاسم أو الهاتف...",
      nameAZ: "الاسم (أ-ي)",
      nameZA: "الاسم (ي-أ)",
      mostVisits: "الأكثر زيارة",
      highestSpender: "الأعلى إنفاقاً",
      newestFirst: "الأحدث أولاً",
      recentVisit: "زيارة حديثة",
      viewDetails: "عرض التفاصيل",
      deleteCustomer: "حذف العميل",
      prefers: "يفضل",
      visits: "زيارات",
      preferences: "التفضيلات",
      notes: "الملاحظات",
      bookAppointment: "حجز موعد",
      lastVisit: "آخر زيارة",
      noCustomersFound: "لم يتم العثور على عملاء",
      tryAdjustingSearch: "حاول تعديل مصطلحات البحث",
      addFirstCustomer: "أضف عميلك الأول للبدء",
      addFirstCustomerBtn: "إضافة أول عميل",
      customerDetails: "تفاصيل العميل",
      spent: "تم إنفاقه",
      preferencesAndNotes: "التفضيلات والملاحظات",
      preferredBarber: "الحلاق المفضل",
      noPreference: "لا يوجد تفضيل",
      servicePreferences: "تفضيلات الخدمة",
      noneSpecified: "لم يتم تحديد شيء",
      noNotes: "لا توجد ملاحظات",
      recentBookings: "الحجوزات الأخيرة",
      recentTransactions: "المعاملات الأخيرة",
      bookAppointmentFor: "حجز موعد لـ",
      deleteCustomerConfirm: "هل أنت متأكد من حذف هذا العميل؟",

      // Booking Management
      bookingManagement: "إدارة الحجوزات",
      manageAppointmentsSubtext: "إدارة المواعيد والجداول",
      refresh: "تحديث",
      newBooking: "حجز جديد",
      totalBookings: "إجمالي الحجوزات",
      scheduled: "مجدول",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
      estRevenue: "الإيرادات المتوقعة",
      date: "التاريخ",
      allBarbers: "جميع الحلاقين",
      status: "الحالة",
      allStatus: "جميع الحالات",
      loadingBookings: "جاري تحميل الحجوزات...",
      noBookingsFound: "لم يتم العثور على حجوزات",
      noBookingsMatch: "لا توجد حجوزات تطابق المرشحات الحالية",
      noBookingsToday: "لا توجد حجوزات مجدولة لليوم",
      createFirstBooking: "إنشاء أول حجز",
      services: "الخدمات",
      estCost: "التكلفة المتوقعة",
      confirmBooking: "تأكيد الحجز",
      completeBooking: "إكمال الحجز",
      complete: "إكمال",
      cancelBooking: "إلغاء الحجز",
      editBooking: "تعديل الحجز",
      deleteBooking: "حذف الحجز",
      createNewBooking: "إنشاء حجز جديد",
      selectCustomerMessage:
        "يرجى اختيار عميل من صفحة إدارة العملاء لإنشاء حجز.",
      cancel: "إلغاء",
      goToCustomers: "الذهاب إلى العملاء",
      deleteBookingConfirm: "هل أنت متأكد من حذف هذا الحجز؟",
      completeBookingConfirm: "هل تريد تمييز هذا الحجز كمكتمل وإنشاء معاملة؟",
      bookingCompletedSuccess: "تم إكمال الحجز وإنشاء المعاملة بنجاح!",

      // Expense Management
      expenseTracking: "تتبع المصروفات",
      trackBusinessExpenses: "تتبع مصروفات عملك",
      addExpense: "إضافة مصروف",
      totalExpenses: "إجمالي المصروفات",
      totalAmount: "المبلغ الإجمالي",
      generalExpenses: "المصروفات العامة",
      recurringExpenses: "المصروفات المتكررة",
      timePeriod: "الفترة الزمنية",
      expenseType: "نوع المصروف",
      today: "اليوم",
      last7Days: "آخر 7 أيام",
      last30Days: "آخر 30 يوم",
      last3Months: "آخر 3 أشهر",
      thisYear: "هذا العام",
      allTime: "كل الأوقات",
      allTypes: "جميع الأنواع",
      general: "عام",
      recurring: "متكرر",
      loadingExpenses: "جاري تحميل المصروفات...",
      noExpensesFound: "لم يتم العثور على مصروفات",
      noExpensesMatch: "لا توجد مصروفات تطابق المرشحات الحالية",
      startTrackingExpenses: "ابدأ في تتبع مصروفات عملك",
      addFirstExpense: "إضافة أول مصروف",
      expenseDate: "التاريخ",
      expenseName: "الاسم",
      expenseAmount: "المبلغ",
      expenseNotes: "الملاحظات",
      actions: "الإجراءات",
      addNewExpense: "إضافة مصروف جديد",
      expenseNameLabel: "اسم المصروف",
      expenseNamePlaceholder: "أدخل اسم المصروف",
      amountEGP: "المبلغ (جنيه)",
      expenseTypeLabel: "نوع المصروف",
      generalExpense: "مصروف عام",
      recurringExpense: "مصروف متكرر",
      notesOptional: "الملاحظات (اختياري)",
      notesPlaceholder: "أضف أي ملاحظات إضافية...",
      adding: "جاري الإضافة...",
      deleteExpenseConfirm: "هل أنت متأكد من حذف هذا المصروف؟",
      nameAmountDateRequired: "Name, amount, and date are required",

      // Auto-translation dictionary (add all English text here)
      "Customer Management": "إدارة العملاء",
      "Manage your customers and their preferences": "إدارة عملائك وتفضيلاتهم",
      "Add Customer": "إضافة عميل",
      "Total Customers": "إجمالي العملاء",
      "Active Customers": "العملاء النشطون",
      "Avg. Customer Spend": "متوسط إنفاق العميل",
      "With Preferences": "مع التفضيلات",
      "Search customers by name or mobile...":
        "البحث عن العملاء بالاسم أو الهاتف...",
      "Name (A-Z)": "الاسم (أ-ي)",
      "Name (Z-A)": "الاسم (ي-أ)",
      "Most Visits": "الأكثر زيارة",
      "Highest Spender": "الأعلى إنفاقاً",
      "Newest First": "الأحدث أولاً",
      "Recent Visit": "زيارة حديثة",
      "View Details": "عرض التفاصيل",
      "Edit Customer": "تعديل العميل",
      "Delete Customer": "حذف العميل",
      "Book Appointment": "حجز موعد",
      "Booking Management": "إدارة الحجوزات",
      "Manage appointments and schedules": "إدارة المواعيد والجداول",
      Refresh: "تحديث",
      "New Booking": "حجز جديد",
      "Expense Tracking": "تتبع المصروفات",
      "Track your business expenses": "تتبع مصروفات عملك",
      "Add Expense": "إضافة مصروف",
      "Loading...": "جاري التحميل...",
      "No data found": "لم يتم العثور على بيانات",
      Save: "حفظ",
      Cancel: "إلغاء",
      Edit: "تعديل",
      Delete: "حذف",
      Actions: "الإجراءات",
      Date: "التاريخ",
      Name: "الاسم",
      Amount: "المبلغ",
      Type: "النوع",
      Notes: "الملاحظات",
      General: "عام",
      Recurring: "متكرر",
      Today: "اليوم",
      "Last 7 Days": "آخر 7 أيام",
      "Last 30 Days": "آخر 30 يوم",
      "Last 3 Months": "آخر 3 أشهر",
      "This Year": "هذا العام",
      "All Time": "كل الأوقات",
      "All Types": "جميع الأنواع",
      "Time Period": "الفترة الزمنية",
      "Expense Type": "نوع المصروف",

      // ManageBarbers translations
      "Add New Barber": "إضافة حلاق جديد",
      "Add a new barber to your team": "أضف حلاقًا جديدًا إلى فريقك",
      "Full Name (e.g., Ahmed Hassan)": "الاسم الكامل (مثال: أحمد حسن)",
      "Mobile Number (e.g., +20 123 456 7890)":
        "رقم الهاتف (مثال: +20 123 456 7890)",
      "Specialty (e.g., Beard Trimming, Hair Styling)":
        "التخصص (مثال: تهذيب اللحية، تصفيف الشعر)",
      "Adding...": "جاري الإضافة...",
      "Add Barber": "إضافة حلاق",
      "Saving...": "جاري الحفظ...",
      Edit: "تعديل",
      Remove: "إزالة",
      "No barbers yet": "لا يوجد حلاقون بعد",
      "Add your first barber to get started": "أضف حلاقك الأول للبدء",
      "Team Summary": "ملخص الفريق",
      "Total active barbers": "إجمالي الحلاقين النشطين",
      "All fields are required": "جميع الحقول مطلوبة",
      "Are you sure you want to delete this barber?":
        "هل أنت متأكد من حذف هذا الحلاق؟",

      // ManageProducts translations
      "Inventory Management": "إدارة المخزون",
      Products: "المنتجات",
      Suppliers: "الموردين",
      "Add New Product": "إضافة منتج جديد",
      "Add a new retail product to your inventory":
        "أضف منتجًا جديدًا للبيع إلى مخزونك",
      "Quick Add Supplier": "إضافة مورد سريع",
      "Product Name": "اسم المنتج",
      "Enter product name": "أدخل اسم المنتج",
      "Selling Price (EGP)": "سعر البيع (جنيه)",
      "Cost Price (EGP)": "سعر التكلفة (جنيه)",
      "Stock Quantity": "كمية المخزون",
      "Reorder Level": "مستوى إعادة الطلب",
      Category: "الفئة",
      Supplier: "المورد",
      "Select Supplier (Optional)": "اختر المورد (اختياري)",
      "Add Product": "إضافة منتج",
      "Selling Price:": "سعر البيع:",
      "Cost Price:": "سعر التكلفة:",
      "Stock:": "المخزون:",
      units: "وحدة",
      "Reorder Level:": "مستوى إعادة الطلب:",
      "Supplier:": "المورد:",
      margin: "الهامش",
      "Out of Stock": "نفد المخزون",
      "Low Stock": "مخزون منخفض",
      "In Stock": "متوفر",
      "No Supplier": "لا يوجد مورد",
      "No products yet": "لا توجد منتجات بعد",
      "Add your first product to get started": "أضف منتجك الأول للبدء",
      "Add New Supplier": "إضافة مورد جديد",
      "Add a new supplier to your network": "أضف مورداً جديداً إلى شبكتك",
      "Supplier Name": "اسم المورد",
      "Enter supplier name": "أدخل اسم المورد",
      "Contact Person": "الشخص المسؤول",
      "Contact person name": "اسم الشخص المسؤول",
      "Phone Number": "رقم الهاتف",
      Email: "البريد الإلكتروني",
      "supplier@example.com": "المورد@مثال.com",
      Address: "العنوان",
      "Supplier address": "عنوان المورد",
      "Add Supplier": "إضافة مورد",
      "Contact:": "المسؤول:",
      "Products Supplied:": "المنتجات المُوردة:",
      items: "عنصر",
      "No suppliers yet": "لا يوجد موردون بعد",
      "Add your first supplier to get started": "أضف مورداً أول للبدء",
      "Supplier name is required": "اسم المورد مطلوب",
      "Are you sure you want to delete this product?":
        "هل أنت متأكد من حذف هذا المنتج؟",
      "Are you sure you want to delete this supplier?":
        "هل أنت متأكد من حذف هذا المورد؟",

      // ManageServices translations
      "Add New Service": "إضافة خدمة جديدة",
      "Create a new service for your barbershop":
        "أنشئ خدمة جديدة لمحل الحلاقة",
      "Service Name": "اسم الخدمة",
      "e.g., Hair Cut": "مثال: قص شعر",
      "Price ($)": "السعر (جنيه)",
      "25.00": "25.00",
      "+ Add Service": "+ إضافة خدمة",
      "Services Management": "إدارة الخدمات",
      Price: "السعر",

      // ManageUsers translations
      "User Management": "إدارة المستخدمين",
      "Add New User": "إضافة مستخدم جديد",
      Username: "اسم المستخدم",
      "Full Name": "الاسم الكامل",
      Role: "الدور",
      Status: "الحالة",
      Created: "تاريخ الإنشاء",
      Active: "نشط",
      Inactive: "غير نشط",
      "Edit User": "تعديل المستخدم",
      Password: "كلمة المرور",
      "(leave blank to keep current)": "(اتركه فارغاً للاحتفاظ بالحالي)",
      Cashier: "كاشير",
      Accountant: "محاسب",
      Admin: "مدير",
      "Active User": "مستخدم نشط",
      "Update User": "تحديث المستخدم",
      "Create User": "إنشاء مستخدم",
      "Cannot delete the main admin user":
        "لا يمكن حذف المستخدم المدير الرئيسي",
      "Are you sure you want to delete this user?":
        "هل أنت متأكد من حذف هذا المستخدم؟",
      admin: "مدير",
      accountant: "محاسب",
      cashier: "كاشير",

      // Sidebar navigation
      "Nassim Admin": "إدارة ناصم",
      "Customer Management": "إدارة العملاء",
      "Bookings & Appointments": "الحجوزات والمواعيد",
      "Staff Management": "إدارة الموظفين",
      "Manage Barbers": "إدارة الحلاقين",
      "Barber Profiles": "ملفات الحلاقين",
      "Manage Services": "إدارة الخدمات",
      "Manage Products": "إدارة المنتجات",
      "Expense Tracking": "تتبع المصروفات",
      "View Receipts": "عرض الإيصالات",
      Reports: "التقارير",
      "Manage Users": "إدارة المستخدمين",
      Logout: "تسجيل خروج",

      // Additional missing translations
      "Required fields missing": "الحقول المطلوبة مفقودة",
      "Failed to load products": "فشل في تحميل المنتجات",
      "Failed to load suppliers": "فشل في تحميل الموردين",
      "Failed to add product": "فشل في إضافة المنتج",
      "Failed to add supplier": "فشل في إضافة المورد",
      "Failed to update product": "فشل في تحديث المنتج",
      "Failed to update supplier": "فشل في تحديث المورد",
      "Failed to delete product": "فشل في حذف المنتج",
      "Failed to delete supplier": "فشل في حذف المورد",
      "Failed to load expenses": "فشل في تحميل المصروفات",
      "Failed to add expense": "فشل في إضافة المصروف",
      "Failed to update expense": "فشل في تحديث المصروف",
      "Failed to delete expense": "فشل في حذف المصروف",
      "Loading expenses...": "جاري تحميل المصروفات...",
      "Optional notes": "ملاحظات اختيارية",
      "Expense name": "اسم المصروف",
      "Product name": "اسم المنتج",
      "Selling price": "سعر البيع",
      "Cost price": "سعر التكلفة",
      "Stock quantity": "كمية المخزون",
      "Select Supplier": "اختر المورد",
      "Supplier name": "اسم المورد",
      "Contact person": "الشخص المسؤول",
      "Phone number": "رقم الهاتف",
      "Failed to save user": "فشل في حفظ المستخدم",
      "Failed to delete user": "فشل في حذف المستخدم",
      "Error fetching users": "خطأ في جلب المستخدمين",
      "Error saving user": "خطأ في حفظ المستخدم",
      "Error deleting user": "خطأ في حذف المستخدم",
      // Add more translations as needed

      // ManageProducts additional translations
      "Quick Add Supplier": "إضافة مورد سريع",
      "Enter supplier name": "أدخل اسم المورد",
      "Contact person name": "اسم الشخص المسؤول",
      Phone: "الهاتف",
      "Select Supplier (Optional)": "اختر المورد (اختياري)",
      "Enter product name": "أدخل اسم المنتج",
      "e.g., Hair Care, Styling": "مثال: منتجات العناية بالشعر، التصفيف",
      "Select Supplier": "اختر المورد",
      "Product name": "اسم المنتج",
      "Selling price": "سعر البيع",
      "Cost price": "سعر التكلفة",
      "Stock quantity": "كمية المخزون",
      "Selling Price:": "سعر البيع",
      "Cost Price:": "سعر التكلفة",
      "Stock:": "المخزون",
      units: "وحدة",
      "Reorder Level:": "مستوى إعادة الطلب",
      "Supplier:": "المورد",
      margin: "الهامش",
      Remove: "إزالة",
      "Add a new supplier to your network": "أضف مورداً جديداً إلى شبكتك",
      "Phone Number": "رقم الهاتف",
      "Supplier address": "عنوان المورد",
      "Contact:": "المسؤول",
      "Products Supplied:": "المنتجات المُوردة",
      items: "عنصر",
      "Supplier name": "اسم المورد",
      "Contact person": "الشخص المسؤول",
      "Phone number": "رقم الهاتف",
      "Failed to load products": "فشل في تحميل المنتجات",
      "Failed to load suppliers": "فشل في تحميل الموردين",
      "Failed to add product": "فشل في إضافة المنتج",
      "Failed to add supplier": "فشل في إضافة المورد",
      "Failed to update product": "فشل في تحديث المنتج",
      "Failed to update supplier": "فشل في تحديث المورد",
      "Failed to delete product": "فشل في حذف المنتج",
      "Failed to delete supplier": "فشل في حذف المورد",
      "Out of Stock": "نفد المخزون",
      "Low Stock": "مخزون منخفض",
      "In Stock": "متوفر",
      "No Supplier": "لا يوجد مورد",
      "Optional notes": "ملاحظات اختيارية",
      amountPlaceholder: "0.00",
      "Enter expense name": "أدخل اسم المصروف",
      "Add any additional notes...": "أضف أي ملاحظات إضافية...",
      "Are you sure you want to delete this expense?":
        "هل أنت متأكد من حذف هذا المصروف؟",
      "Failed to load expenses": "فشل في تحميل المصروفات",
      "Failed to add expense": "فشل في إضافة المصروف",
      "Failed to update expense": "فشل في تحديث المصروف",
      "Failed to delete expense": "فشل في حذف المصروف",
      "No expenses match your current filters":
        "لا توجد مصروفات تطابق المرشحات الحالية",
      "Start tracking your business expenses": "ابدأ في تتبع مصروفات عملك",
      "Add First Expense": "إضافة أول مصروف",
      "Loading expenses...": "جاري تحميل المصروفات...",
      "No expenses found": "لم يتم العثور على مصروفات",
      "Last 7 Days": "آخر 7 أيام",
      "Last 30 Days": "آخر 30 يوم",
      "Last 3 Months": "آخر 3 أشهر",
      "This Year": "هذا العام",
      "All Time": "كل الأوقات",
      "All Types": "جميع الأنواع",
      "General Expenses": "المصروفات العامة",
      "Recurring Expenses": "المصروفات المتكررة",
      "Time Period": "الفترة الزمنية",
      "Expense Type": "نوع المصروف",
      "General Expense": "مصروف عام",
      "Recurring Expense": "مصروف متكرر",
      "Notes (Optional)": "الملاحظات (اختياري)",
      "Add New Expense": "إضافة مصروف جديد",
      "Expense Name": "اسم المصروف",
      "Amount (EGP)": "المبلغ (جنيه)",
      required: "*",

      "Business Intelligence": "ذكاء الأعمال",
      "Export PDF": "تصدير PDF",
      "Export Excel": "تصدير Excel",
      "Exporting...": "جاري التصدير...",
      Refresh: "تحديث",
      "Loading...": "جاري التحميل...",
      "Report Filters": "مرشحات التقارير",
      "Custom Range": "نطاق مخصص",
      "Start Date": "تاريخ البداية",
      "End Date": "تاريخ النهاية",
      Overview: "نظرة عامة",
      Financial: "المالية",
      "P&L Report": "تقرير الأرباح والخسائر",
      "Staff Performance": "أداء الموظفين",
      Transactions: "المعاملات",

      // Metrics
      "Total Revenue": "إجمالي الإيرادات",
      "Total Transactions": "إجمالي المعاملات",
      "Average Order Value": "متوسط قيمة الطلب",
      "Top Service": "أفضل خدمة",
      "vs last period": "مقارنة بالفترة السابقة",
      revenue: "إيرادات",
      "Revenue Trend": "اتجاه الإيرادات",
      "No revenue data available for the selected period":
        "لا توجد بيانات إيرادات متاحة للفترة المحددة",

      // Financial Tab
      "Revenue by Service": "الإيرادات حسب الخدمة",
      "Payment Methods": "طرق الدفع",
      "No service revenue data available":
        "لا توجد بيانات إيرادات الخدمات متاحة",
      "No payment method data available": "لا توجد بيانات طرق الدفع متاحة",
      "Revenue Insight": "رؤى الإيرادات",
      "Payment Trends": "اتجاهات الدفع",
      "Your top service": "خدمتك الأفضل",
      "generates the highest revenue. Consider promoting similar services to maximize earnings.":
        "تحقق أعلى إيرادات. فكر في الترويج لخدمات مماثلة لتعظيم الأرباح.",
      "is your most popular payment method. Consider offering incentives for digital payments.":
        "هي طريقة الدفع الأكثر شيوعاً. فكر في تقديم حوافز للمدفوعات الرقمية.",

      // P&L Report
      "Total Income": "إجمالي الدخل",
      "Service Revenue": "إيرادات الخدمات",
      "Product Revenue": "إيرادات المنتجات",
      "Net Profit": "صافي الربح",
      "Profit Margin": "هامش الربح",
      "Expense Ratio": "نسبة المصروفات",
      "Profit & Loss Statement": "بيان الأرباح والخسائر",
      Period: "الفترة",
      to: "إلى",
      Description: "الوصف",
      Amount: "المبلغ",
      "% of Revenue": "% من الإيرادات",
      INCOME: "الدخل",
      EXPENSES: "المصروفات",
      "NET PROFIT/LOSS": "صافي الربح/الخسارة",
      "Recent Expenses": "المصروفات الأخيرة",

      // Products Tab
      "Product Sales Performance - Revenue & Units Sold":
        "أداء مبيعات المنتجات - الإيرادات والوحدات المباعة",
      "No product sales data available": "لا توجد بيانات مبيعات المنتجات متاحة",
      "Low Stock Alert": "تنبيه المخزون المنخفض",
      Product: "المنتج",
      "Current Stock": "المخزون الحالي",
      "Reorder Level": "مستوى إعادة الطلب",
      "Units Sold": "الوحدات المباعة",

      // Staff Performance
      "Barber Performance Analysis - Revenue & Transactions":
        "تحليل أداء الحلاقين - الإيرادات والمعاملات",
      "No barber performance data available":
        "لا توجد بيانات أداء الحلاقين متاحة",
      "Detailed Staff Performance": "تفاصيل أداء الموظفين",
      Barber: "الحلاق",
      "Avg. per Transaction": "المتوسط لكل معاملة",
      Performance: "الأداء",
      "Top Performer": "الأفضل أداءً",
      Good: "جيد",
      Average: "متوسط",
      "Your top barber": "حلاقك الأفضل",
      "is leading with": "يتصدر بـ",
      "in revenue. Consider recognizing their excellent performance!":
        "في الإيرادات. فكر في تقدير أدائهم الممتاز!",
      "Growth Opportunity": "فرصة النمو",
      "Focus on training and development for lower-performing staff members to boost overall team productivity and customer satisfaction.":
        "ركز على التدريب والتطوير لأعضاء الفريق ذوي الأداء المنخفض لتعزيز الإنتاجية الإجمالية للفريق ورضا العملاء.",

      // Transactions
      "Transaction Management": "إدارة المعاملات",
      "Add Transaction": "إضافة معاملة",
      "Add New Transaction": "إضافة معاملة جديدة",
      "Customer Name": "اسم العميل",
      "Barber Name": "اسم الحلاق",
      "Total Amount": "المبلغ الإجمالي",
      "Payment Method": "طريقة الدفع",
      "Save Transaction": "حفظ المعاملة",
      Customer: "العميل",
      "Recent Transactions": "المعاملات الأخيرة",
      "Services/Products": "الخدمات/المنتجات",

      // Chart labels
      "Daily Revenue": "الإيرادات اليومية",
      Revenue: "الإيرادات",
      Count: "العدد",

      // Common
      "Loading comprehensive reports...": "جاري تحميل التقارير الشاملة...",
      "Export failed": "فشل في التصدير",
      "Failed to export PDF. Please try again.":
        "فشل في تصدير PDF. يرجى المحاولة مرة أخرى.",
      "Failed to export Excel. Please try again.":
        "فشل في تصدير Excel. يرجى المحاولة مرة أخرى.",
      "Failed to update transaction": "فشل في تحديث المعاملة",
      "Failed to update transaction. Please try again.":
        "فشل في تحديث المعاملة. يرجى المحاولة مرة أخرى.",
      "Are you sure you want to delete this transaction? This action cannot be undone.":
        "هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
      "Failed to delete transaction": "فشل في حذف المعاملة",
      "Failed to delete transaction. Please try again.":
        "فشل في حذف المعاملة. يرجى المحاولة مرة أخرى.",
      "Failed to add transaction": "فشل في إضافة المعاملة",
      "Failed to add transaction. Please try again.":
        "فشل في إضافة المعاملة. يرجى المحاولة مرة أخرى.",

      // Payment method translations
      cash: "نقدي",
      card: "بطاقة",
      CASH: "نقدي",
      CARD: "بطاقة",

      // Currency
      currency: "جنيه",

      // Additional missing translations
      "Last 3 Months": "آخر 3 أشهر",
      "This Year": "هذا العام",
      "All Time": "كل الأوقات",
      "Custom Range": "نطاق مخصص",
      "N/A": "غير متاح",

      // ViewReceipts Component Translations
      "Receipts Management": "إدارة الإيصالات",
      "View and manage all transaction receipts":
        "عرض وإدارة جميع إيصالات المعاملات",
      "Export CSV": "تصدير CSV",
      Refresh: "تحديث",
      "Loading...": "جاري التحميل...",

      // Statistics
      "Total Receipts": "إجمالي الإيصالات",
      "Total Revenue": "إجمالي الإيرادات",
      "Average Receipt": "متوسط الإيصال",
      "Top Barber": "أفضل حلاق",

      // Filters
      "Search receipts...": "البحث في الإيصالات...",
      "From Date": "من تاريخ",
      "To Date": "إلى تاريخ",
      "Filter by barber": "تصفية حسب الحلاق",
      "All Methods": "جميع الطرق",
      Cash: "نقدي",
      Card: "بطاقة",
      "Min Amount": "الحد الأدنى للمبلغ",
      "Max Amount": "الحد الأقصى للمبلغ",
      "Clear Filters": "مسح المرشحات",

      // Table Headers
      "Date & Time": "التاريخ والوقت",
      "Receipt ID": "رقم الإيصال",
      Customer: "العميل",
      Barber: "الحلاق",
      Items: "العناصر",
      Payment: "الدفع",
      Total: "الإجمالي",
      Actions: "الإجراءات",

      // Table Content
      "Walk-in": "عميل عادي",
      "N/A": "غير متاح",
      Empty: "فارغ",
      Service: "خدمة",
      Product: "منتج",
      s: "ات", // Arabic plural suffix
      "View Receipt": "عرض الإيصال",

      // Results and States
      Showing: "عرض",
      of: "من",
      receipts: "إيصالات",
      "Loading receipts...": "جاري تحميل الإيصالات...",
      "No receipts found": "لم يتم العثور على إيصالات",
      "No receipts available": "لا توجد إيصالات متاحة",
      "No receipts match your filters": "لا توجد إيصالات تطابق مرشحاتك",

      // Error Messages
      "Failed to fetch receipts": "فشل في جلب الإيصالات",
      "Failed to load receipts. Please try again.":
        "فشل في تحميل الإيصالات. يرجى المحاولة مرة أخرى.",

      // CSV Export Headers
      Date: "التاريخ",
      Services: "الخدمات",
      Products: "المنتجات",

      // Currency
      currency: "جنيه",

      // Additional payment method translations for proper display
      CASH: "نقدي",
      CARD: "بطاقة",
      cash: "نقدي",
      card: "بطاقة",

      // CheckoutModal Component Translations
      "Transaction Complete!": "تمت المعاملة بنجاح!",
      "Payment Successful": "تم الدفع بنجاح",
      "Transaction has been processed": "تمت معالجة المعاملة",

      // Invoice Details
      "Invoice Number": "رقم الفاتورة",
      "Receipt Number": "رقم الإيصال",
      "Date & Time": "التاريخ والوقت",
      "Service Date": "تاريخ الخدمة",
      at: "في",

      // Customer & Service Info
      Customer: "العميل",
      Barber: "الحلاق",
      "Service Type": "نوع الخدمة",
      "Walk-in Customer": "عميل عادي",

      // Items Section
      Items: "العناصر",
      Qty: "الكمية",
      Service: "خدمة",
      Product: "منتج",

      // Totals Section
      Subtotal: "المجموع الفرعي",
      "Discount Applied": "تم تطبيق الخصم",
      Tax: "الضريبة",
      "Total Paid": "المبلغ المدفوع",

      // Payment Info
      "Paid via": "تم الدفع عبر",
      CASH: "نقدي",
      CARD: "بطاقة",

      // Invoice Status
      "Invoice sent to financial records (visible to finance team)":
        "تم إرسال الفاتورة إلى السجلات المالية (مرئية لفريق المالية)",
      "Invoice visible to super admin only": "الفاتورة مرئية للمدير العام فقط",

      // Export Buttons
      "Professional PDF Invoice": "فاتورة PDF احترافية",
      "Excel Report": "تقرير Excel",
      "Complete & New Transaction": "إكمال ومعاملة جديدة",

      // PDF Content
      "Premium Grooming & Retail Services": "خدمات العناية والتجميل المتميزة",
      INVOICE: "فاتورة",
      "Invoice #": "رقم الفاتورة",
      "Receipt #": "رقم الإيصال",
      Date: "التاريخ",
      Time: "الوقت",
      "Business Details": "تفاصيل العمل",
      "Customer Details": "تفاصيل العميل",
      "Payment Method": "طريقة الدفع",
      Description: "الوصف",
      Type: "النوع",
      Qty: "الكمية",
      Price: "السعر",
      Total: "الإجمالي",
      Discount: "الخصم",
      TOTAL: "الإجمالي",
      "Thank you for choosing Nassim Select Barber!":
        "شكراً لاختيارك حلاق ناصم المتميز!",
      "Follow us on social media @nassimbarber":
        "تابعونا على وسائل التواصل الاجتماعي @nassimbarber",
      "This invoice has been sent to financial records.":
        "تم إرسال هذه الفاتورة إلى السجلات المالية.",

      // Excel Export
      "NASSIM SELECT BARBER - INVOICE": "حلاق ناصم المتميز - فاتورة",
      "SERVICES & PRODUCTS": "الخدمات والمنتجات",
      Quantity: "الكمية",
      "Unit Price": "سعر الوحدة",
      TOTALS: "المجاميع",
      "Invoice Sent to Financial Records":
        "تم إرسال الفاتورة إلى السجلات المالية",
      YES: "نعم",
      NO: "لا",
      Invoice: "فاتورة",

      // Currency
      currency: "جنيه",

      // Additional payment method translations for proper display
      cash: "نقدي",
      card: "بطاقة",
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
        translations, // ✅ Add this line
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
