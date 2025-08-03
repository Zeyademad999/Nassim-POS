import React, { useEffect, useState } from "react";
import { usePOS } from "../context/POSContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import ServiceCard from "../components/ServiceCard";
import ProductCard from "../components/ProductCard";
import BillPanel from "../components/BillPanel";
import {
  Printer,
  RotateCcw,
  CreditCard,
  Banknote,
  Languages,
} from "lucide-react";
import "../styles/POS.css";

const POS = ({ onLogout }) => {
  const {
    customerName,
    setCustomerName,
    customerId,
    setCustomerId,
    selectedBarber,
    selectedBarberId,
    setBarberInfo,
    serviceDate,
    setServiceDate,
    cashTotal,
    cardTotal,
    transactionCount,
    cashCount,
    cardCount,
    resetPaymentTotals,
    generateSettlementReceipt,
    customerMobile, // Add this
    setCustomerMobile, // Add this
  } = usePOS();

  const { colors } = useTheme();
  const { t, toggleLanguage, isRTL, language } = useLanguage();

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("services");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching POS data...");

        const [serviceRes, productRes, barberRes, customerRes] =
          await Promise.all([
            fetch("/api/services"), // Remove localhost:5000 - use relative URLs
            fetch("/api/products"),
            fetch("/api/barbers"),
            fetch("/api/customers"), // This should match your backend route
          ]);

        console.log("📊 API Response Status:");
        console.log("- Services:", serviceRes.status);
        console.log("- Products:", productRes.status);
        console.log("- Barbers:", barberRes.status);
        console.log("- Customers:", customerRes.status);

        // Handle services
        let servicesData = [];
        if (serviceRes.ok) {
          servicesData = await serviceRes.json();
          console.log("🔧 Services data:", servicesData);
        }

        // Handle products
        let productsData = [];
        if (productRes.ok) {
          productsData = await productRes.json();
          console.log("📦 Products data:", productsData);
        }

        // Handle barbers
        let barbersData = [];
        if (barberRes.ok) {
          barbersData = await barberRes.json();
          console.log("💇 Barbers data:", barbersData);
        }

        // Handle customers with different response structures
        let customersData = [];
        if (customerRes.ok) {
          const customerResponse = await customerRes.json();
          console.log("👥 Raw customers response:", customerResponse);

          // Handle different possible response structures
          if (Array.isArray(customerResponse)) {
            customersData = customerResponse;
          } else if (
            customerResponse.customers &&
            Array.isArray(customerResponse.customers)
          ) {
            customersData = customerResponse.customers;
          } else if (
            customerResponse.data &&
            Array.isArray(customerResponse.data)
          ) {
            customersData = customerResponse.data;
          } else {
            console.warn(
              "🚨 Unexpected customers response structure:",
              customerResponse
            );
            customersData = [];
          }

          console.log("👥 Processed customers data:", customersData);
          console.log("👥 Number of customers:", customersData.length);
        } else {
          console.error("❌ Failed to fetch customers:", customerRes.status);
        }

        // Set all data
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setBarbers(Array.isArray(barbersData) ? barbersData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);

        console.log("✅ Final state:");
        console.log("- Services count:", servicesData.length);
        console.log("- Products count:", productsData.length);
        console.log("- Barbers count:", barbersData.length);
        console.log("- Customers count:", customersData.length);
      } catch (err) {
        console.error("❌ Failed to fetch POS data:", err);
        // Set default empty arrays on error
        setServices([]);
        setProducts([]);
        setBarbers([]);
        setCustomers([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("🔍 Customer search triggered:", {
      searchTerm: customerSearch,
      customersCount: customers.length,
    });

    if (customerSearch.trim() && customers.length > 0) {
      const searchLower = customerSearch.toLowerCase().trim();

      const filtered = customers.filter((customer) => {
        if (!customer) return false;

        const nameMatch =
          customer.name && customer.name.toLowerCase().includes(searchLower);
        const mobileMatch =
          customer.mobile && customer.mobile.includes(customerSearch.trim());

        return nameMatch || mobileMatch;
      });

      console.log("🔍 Filtered customers:", filtered);
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, customers]);

  // Handle barber selection - store both ID and name
  const handleBarberChange = (e) => {
    const selectedBarberId = e.target.value;
    if (selectedBarberId) {
      const selectedBarberData = barbers.find((b) => b.id === selectedBarberId);
      if (selectedBarberData) {
        setBarberInfo(selectedBarberData.id, selectedBarberData.name);
      }
    } else {
      setBarberInfo("", "");
    }
  };

  // Handle customer selection - store both ID and name
  const handleCustomerChange = (e) => {
    const value = e.target.value;

    if (value === "walk-in") {
      setCustomerId("");
      setCustomerName("Walk-in");
    } else if (value === "new-customer") {
      setCustomerId("");
      setCustomerName("");
    } else if (value) {
      // Existing customer selected
      const customer = customers.find((c) => c.id === value);
      if (customer) {
        setCustomerId(customer.id);
        setCustomerName(customer.name);
      }
    } else {
      setCustomerId("");
      setCustomerName("");
    }
  };

  const handleCustomerSelect = (customer) => {
    console.log("👤 Customer selected:", customer);

    if (customer && customer.id) {
      setCustomerId(customer.id);
      setCustomerName(customer.name || "");
      setCustomerMobile(customer.mobile || "");
      setCustomerSearch(`${customer.name} - ${customer.mobile}`);
      setShowCustomerDropdown(false);
    }
  };

  const handleCustomerSearchChange = (e) => {
    const value = e.target.value;
    console.log("🔍 Search input changed:", value);

    setCustomerSearch(value);

    // Clear selection if user is typing and it doesn't match current customer
    const currentCustomer = customers.find((c) => c.id === customerId);
    const expectedSearchValue = currentCustomer
      ? `${currentCustomer.name} - ${currentCustomer.mobile}`
      : "";

    if (value !== expectedSearchValue) {
      setCustomerId("");
      setCustomerName("");
      setCustomerMobile("");
    }
  };

  const handleCustomerTypeSelect = (type) => {
    console.log("👤 Customer type selected:", type);

    if (type === "walk-in") {
      setCustomerId("");
      setCustomerName("Walk-in");
      setCustomerMobile("");
      setCustomerSearch("Walk-in Customer");
      setShowCustomerDropdown(false);
    } else if (type === "new-customer") {
      setCustomerId("");
      setCustomerName("");
      setCustomerMobile("");
      setCustomerSearch("");
      setShowCustomerDropdown(false);
    } else if (type === "returning-customer") {
      setCustomerId("");
      setCustomerName("");
      setCustomerMobile("");
      setCustomerSearch("");
      setShowCustomerDropdown(false);

      setTimeout(() => {
        const searchInput = document.querySelector(".customer-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  const refreshCustomers = async () => {
    try {
      console.log("🔄 Refreshing customers...");
      const customerRes = await fetch("/api/customers");

      if (customerRes.ok) {
        const customerResponse = await customerRes.json();

        let customersData = [];
        if (Array.isArray(customerResponse)) {
          customersData = customerResponse;
        } else if (
          customerResponse.customers &&
          Array.isArray(customerResponse.customers)
        ) {
          customersData = customerResponse.customers;
        } else if (
          customerResponse.data &&
          Array.isArray(customerResponse.data)
        ) {
          customersData = customerResponse.data;
        }

        setCustomers(customersData);
        console.log("✅ Customers refreshed:", customersData.length);
      }
    } catch (err) {
      console.error("❌ Failed to refresh customers:", err);
    }
  };

  const handlePrintSettlement = () => {
    const receiptContent = generateSettlementReceipt();
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `settlement-${new Date().toISOString().split("T")[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetTotals = () => {
    if (confirm(t("resetConfirm"))) {
      resetPaymentTotals();
    }
  };

  return (
    <div className="pos-container" dir={isRTL ? "rtl" : "ltr"}>
      <style jsx>{`
        .pos-tabs {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .pos-tab {
          padding: 12px 24px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pos-tab.active {
          border-color: black;
          background: black;
          color: white;
        }

        .pos-tab:hover:not(.active) {
          border-color: #9ca3af;
        }

        .customer-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tab-content {
          min-height: 400px;
        }

        .payment-tracking-section {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .payment-labels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .payment-label {
          background: #f8fafc;
          border-radius: 8px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .payment-label.cash {
          border-left: 4px solid #059669;
          height: 52%;
        }

        .payment-label.card {
          border-left: 4px solid #2563eb;
        }

        .payment-label-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-amount {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .payment-count {
          font-size: 11px;
          color: #6b7280;
        }

        .settlement-actions {
          display: flex;
          gap: 8px;
        }

        .settlement-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .settlement-btn.print {
          background: #2563eb;
          color: white;
        }

        .settlement-btn.print:hover {
          background: #1d4ed8;
        }

        .settlement-btn.reset {
          background: #ef4444;
          color: white;
        }

        .settlement-btn.reset:hover {
          background: #dc2626;
        }

        .total-summary {
          text-align: center;
          padding: 10px;
          background: #f0f9ff;
          border-radius: 6px;
          border: 1px solid #0ea5e9;
          margin-bottom: 12px;
        }

        .total-summary-text {
          font-size: 13px;
          color: #0369a1;
          font-weight: 600;
        }

        .language-toggle {
          position: absolute;
          top: 40px;
          right: 980px;
          ${isRTL ? "left: 16px;" : "right: 130px;"}
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s ease;
          width: 120px;
        }

        .language-toggle:hover {
          background: white;
          border-color: #9ca3af;
        }

        .pos-header {
          position: relative;
        }

        /* RTL specific styles */
        ${isRTL
          ? `
          .payment-label.cash {
            border-right: 4px solid #059669;
            border-left: 1px solid #e2e8f0;
          }
          
          .payment-label.card {
            border-right: 4px solid #2563eb;
            border-left: 1px solid #e2e8f0;
          }
        `
          : ""}
      `}</style>

      <header
        className="pos-header"
        style={{ backgroundColor: colors.primary }}
      >
        <div>
          <h1 style={{ color: colors.secondary }}>{t("shopName")}</h1>
          <p style={{ color: colors.secondary, fontSize: "14px" }}>
            {t("pointOfSale")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="language-toggle" onClick={toggleLanguage}>
            <Languages size={14} />
            {language === "en" ? "العربية" : "English"}
          </button>

          <button
            className="logout-btn"
            onClick={onLogout}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {t("logout")}
          </button>
        </div>
      </header>
      <div className="pos-main">
        <div className="pos-left">
          {/* Payment Tracking Section */}
          <div className="payment-tracking-section">
            <div className="total-summary">
              <div className="total-summary-text">
                {t("total")}: {(cashTotal + cardTotal).toFixed(2)} EGP |{" "}
                {transactionCount} {t("transactions")}
              </div>
            </div>

            <div className="payment-labels">
              <div className="payment-label cash">
                <div className="payment-label-header">
                  <Banknote size={14} />
                  {t("cashPayments")}
                </div>
                <div className="payment-amount">{cashTotal.toFixed(2)} EGP</div>
                <div className="payment-count">
                  {cashCount} {t("transactions")}
                </div>
              </div>

              <div className="payment-label card">
                <div className="payment-label-header">
                  <CreditCard size={14} />
                  {t("cardPayments")}
                </div>
                <div className="payment-amount">{cardTotal.toFixed(2)} EGP</div>
                <div className="payment-count">
                  {cardCount} {t("transactions")}
                </div>
              </div>
            </div>

            <div className="settlement-actions">
              <button
                className="settlement-btn print"
                onClick={handlePrintSettlement}
              >
                <Printer size={14} />
                {t("printSettlement")}
              </button>
              <button
                className="settlement-btn reset"
                onClick={handleResetTotals}
              >
                <RotateCcw size={14} />
                {t("resetTotals")}
              </button>
            </div>
          </div>

          <div className="input-row">
            {/* Customer Selection */}
            <div className="customer-input-group">
              {/* Customer Type Selection */}
              <div className="customer-type-tabs">
                <button
                  type="button"
                  className={`customer-type-tab ${
                    customerName === "Walk-in" ? "active" : ""
                  }`}
                  onClick={() => handleCustomerTypeSelect("walk-in")}
                >
                  {t("walkInCustomer")}
                </button>
                <button
                  type="button"
                  className={`customer-type-tab ${
                    customerId && customerName !== "Walk-in" ? "active" : ""
                  }`}
                  onClick={() => handleCustomerTypeSelect("returning-customer")}
                >
                  Returning Customer
                </button>
                <button
                  type="button"
                  className={`customer-type-tab ${
                    !customerId && customerName !== "Walk-in" && customerName
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleCustomerTypeSelect("new-customer")}
                >
                  {t("newCustomer")}
                </button>
              </div>

              {/* Customer Input/Search */}
              {customerName === "Walk-in" ? (
                <div className="walk-in-display">
                  <span>{t("walkInCustomer")}</span>
                </div>
              ) : (
                <div className="customer-search-container">
                  <input
                    type="text"
                    placeholder={
                      customerId
                        ? "Customer selected"
                        : "Search by name or mobile number..."
                    }
                    value={customerSearch}
                    onChange={handleCustomerSearchChange}
                    onFocus={() =>
                      customerSearch && setShowCustomerDropdown(true)
                    }
                    className="pos-input customer-search-input"
                  />

                  {/* Customer Search Dropdown */}
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="customer-dropdown">
                      {filteredCustomers.slice(0, 5).map((customer) => (
                        <div
                          key={customer.id}
                          className="customer-option"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="customer-info">
                            <div className="customer-name">{customer.name}</div>
                            <div className="customer-mobile">
                              {customer.mobile}
                            </div>
                            {customer.total_visits > 0 && (
                              <div className="customer-visits">
                                {customer.total_visits} visits •{" "}
                                {customer.total_spent} EGP spent
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredCustomers.length > 5 && (
                        <div className="dropdown-more">
                          +{filteredCustomers.length - 5} more customers
                        </div>
                      )}
                    </div>
                  )}

                  {/* No results message */}
                  {showCustomerDropdown &&
                    customerSearch &&
                    filteredCustomers.length === 0 && (
                      <div className="customer-dropdown">
                        <div className="no-results">
                          No customers found. Customer will be created as new.
                        </div>
                      </div>
                    )}

                  {/* Manual customer input for new customers */}
                  {!customerId && customerName !== "Walk-in" && (
                    <div className="new-customer-inputs">
                      <input
                        type="text"
                        placeholder={t("enterCustomerName")}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pos-input"
                      />
                      <input
                        type="tel"
                        placeholder={t("Mobile number (required)")}
                        value={customerMobile}
                        onChange={(e) => setCustomerMobile(e.target.value)}
                        className="pos-input"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Barber Selection */}
            <select
              value={selectedBarberId}
              onChange={handleBarberChange}
              className="pos-input"
            >
              <option value="">{t("selectBarber")}</option>
              {Array.isArray(barbers) &&
                barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name} – {barber.specialty}
                  </option>
                ))}
            </select>

            <input
              type="date"
              value={serviceDate.toISOString().split("T")[0]}
              onChange={(e) => setServiceDate(new Date(e.target.value))}
              className="pos-input"
            />
          </div>

          {/* Service/Product Tabs */}
          <div className="pos-tabs">
            <button
              className={`pos-tab ${activeTab === "services" ? "active" : ""}`}
              onClick={() => setActiveTab("services")}
            >
              {t("services")} ({services.length})
            </button>
            <button
              className={`pos-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              {t("products")} ({products.length})
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="tab-content">
            {activeTab === "services" ? (
              <div className="card-grid">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
                {services.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#6b7280",
                    }}
                  >
                    <p>{t("noServicesAvailable")}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {products.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#6b7280",
                    }}
                  >
                    <p>{t("noProductsAvailable")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pos-right">
          <BillPanel />{" "}
        </div>
      </div>
    </div>
  );
};

export default POS;
