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
  ShoppingCart,
  Users,
  Calendar,
  Scissors,
  ChevronDown,
  X,
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
    customerMobile,
    setCustomerMobile,
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
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [customerType, setCustomerType] = useState("walk-in"); // "walk-in", "new", "returning"

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching POS data...");

        const [serviceRes, productRes, barberRes, customerRes] =
          await Promise.all([
            fetch("/api/services"),
            fetch("/api/products"),
            fetch("/api/barbers"),
            fetch("/api/customers"),
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

        // Set default barber if available
        if (Array.isArray(barbersData) && barbersData.length > 0) {
          const defaultBarber = barbersData.find((barber) => barber.is_default);
          if (defaultBarber) {
            setBarberInfo(defaultBarber.id, defaultBarber.name);
          }
        }

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
      setCustomerType("returning"); // Set type when customer is selected
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
      setCustomerType("walk-in");
      setCustomerId("");
      setCustomerName("Walk-in");
      setCustomerMobile("");
      setCustomerSearch("Walk-in Customer");
      setShowCustomerDropdown(false);
    } else if (type === "new-customer") {
      setCustomerType("new");
      setCustomerId("");
      setCustomerName(""); // This will trigger showing the new customer fields
      setCustomerMobile("");
      setCustomerSearch("");
      setShowCustomerDropdown(false);
    } else if (type === "returning-customer") {
      setCustomerType("returning");
      setCustomerId("");
      setCustomerName(""); // This will trigger showing the search field
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

  // Initialize customer type on component mount
  useEffect(() => {
    if (customerType === "walk-in") {
      setCustomerName("Walk-in");
      setCustomerSearch("Walk-in Customer");
    }
  }, []);

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

  const toggleDetailsSection = () => {
    setIsDetailsExpanded(!isDetailsExpanded);
  };

  const closeDetailsSection = () => {
    setIsDetailsExpanded(false);
  };

  return (
    <div className="pos-app" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="pos-header">
        <div className="header-brand">
          <div className="brand-info">
            <h1 className="brand-title">{t("shopName")}</h1>
            <p className="brand-subtitle">{t("pointOfSale")}</p>
          </div>
        </div>

        <div className="header-controls">
          <button className="language-switch" onClick={toggleLanguage}>
            <Languages size={18} />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </button>

          <button className="logout-button" onClick={onLogout}>
            {t("logout")}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pos-main">
        {/* Left Panel - Services & Products */}
        <section className="pos-content">
          {/* Stats Dashboard */}
          <div className="stats-dashboard">
            <div className="stat-card total-stat">
              <div className="stat-icon">
                <ShoppingCart size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  {(cashTotal + cardTotal).toFixed(2)} {t("EGP")}
                </h3>
                <p className="stat-label">{t("Total Revenue")}</p>
              </div>
            </div>

            <div className="stat-card cash-stat">
              <div className="stat-icon">
                <Banknote size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  {cashTotal.toFixed(2)} {t("EGP")}
                </h3>
                <p className="stat-label">
                  {t("Cash")} ({cashCount})
                </p>
              </div>
            </div>

            <div className="stat-card card-stat">
              <div className="stat-icon">
                <CreditCard size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">
                  {cardTotal.toFixed(2)} {t("EGP")}
                </h3>
                <p className="stat-label">
                  {t("Card")} ({cardCount})
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn print-btn"
              onClick={handlePrintSettlement}
            >
              <Printer size={18} />
              <span>{t("printSettlement")}</span>
            </button>

            <button
              className="action-btn reset-btn"
              onClick={handleResetTotals}
            >
              <RotateCcw size={18} />
              <span>{t("resetTotals")}</span>
            </button>
          </div>

          {/* Collapsible Details Section */}
          <div className="details-section">
            <button className="details-toggle" onClick={toggleDetailsSection}>
              <span>{t("Fill Details")}</span>
              <ChevronDown
                size={18}
                className={`chevron ${isDetailsExpanded ? "expanded" : ""}`}
              />
            </button>

            {isDetailsExpanded && (
              <div className="details-content">
                <div className="details-header">
                  <h3>{t("Customer & Service Details")}</h3>
                  <button
                    className="close-details"
                    onClick={closeDetailsSection}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Customer & Barber Selection */}
                <div className="selection-panel">
                  <div className="selection-group">
                    <label className="selection-label">
                      <Users size={18} />
                      <span>{t("Customer")}</span>
                    </label>

                    <div className="customer-selection">
                      <div className="customer-tabs">
                        <button
                          className={`customer-tab ${
                            customerType === "walk-in" ? "active" : ""
                          }`}
                          onClick={() => handleCustomerTypeSelect("walk-in")}
                        >
                          {t("Walk-in")}
                        </button>
                        <button
                          className={`customer-tab ${
                            customerType === "returning" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleCustomerTypeSelect("returning-customer")
                          }
                        >
                          {t("Returning")}
                        </button>
                        <button
                          className={`customer-tab ${
                            customerType === "new" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleCustomerTypeSelect("new-customer")
                          }
                        >
                          {t("New")}
                        </button>
                      </div>

                      {customerType === "walk-in" ? (
                        <div className="walk-in-display">
                          <span>{t("Walk-in Customer")}</span>
                        </div>
                      ) : customerType === "new" ? (
                        // New customer - show name and mobile input fields
                        <div className="new-customer-fields">
                          <input
                            type="text"
                            placeholder={t("Customer name")}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="customer-input"
                          />
                          <input
                            type="tel"
                            placeholder={t("Mobile number (required)")}
                            value={customerMobile}
                            onChange={(e) => setCustomerMobile(e.target.value)}
                            className="customer-input"
                          />
                        </div>
                      ) : customerType === "returning" ? (
                        // Returning customer - show search input
                        <div className="customer-search-wrapper">
                          <input
                            type="text"
                            placeholder={t(
                              "Search customers by name or mobile..."
                            )}
                            value={customerSearch}
                            onChange={handleCustomerSearchChange}
                            onFocus={() =>
                              customerSearch && setShowCustomerDropdown(true)
                            }
                            className="customer-search-input"
                          />

                          {showCustomerDropdown &&
                            filteredCustomers.length > 0 && (
                              <div className="customer-dropdown">
                                {filteredCustomers
                                  .slice(0, 5)
                                  .map((customer) => (
                                    <div
                                      key={customer.id}
                                      className="customer-option"
                                      onClick={() =>
                                        handleCustomerSelect(customer)
                                      }
                                    >
                                      <div className="customer-info">
                                        <div className="customer-name">
                                          {customer.name}
                                        </div>
                                        <div className="customer-mobile">
                                          {customer.mobile}
                                        </div>
                                        {customer.total_visits > 0 && (
                                          <div className="customer-visits">
                                            {customer.total_visits}{" "}
                                            {t("visits")} •{" "}
                                            {customer.total_spent} {t("EGP")}{" "}
                                            {t("spent")}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                {filteredCustomers.length > 5 && (
                                  <div className="dropdown-more">
                                    +{filteredCustomers.length - 5}{" "}
                                    {t("more customers")}
                                  </div>
                                )}
                              </div>
                            )}

                          {showCustomerDropdown &&
                            customerSearch &&
                            filteredCustomers.length === 0 && (
                              <div className="customer-dropdown"></div>
                            )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="selection-group">
                    <label className="selection-label">
                      <Scissors size={18} />
                      <span>{t("Barber")}</span>
                    </label>
                    <select
                      value={selectedBarberId}
                      onChange={handleBarberChange}
                      className="barber-select"
                    >
                      <option value="">{t("Select a barber")}</option>
                      {Array.isArray(barbers) &&
                        barbers.map((barber) => (
                          <option key={barber.id} value={barber.id}>
                            {barber.name} – {barber.specialty}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="selection-group">
                    <label className="selection-label">
                      <Calendar size={18} />
                      <span>{t("Date")}</span>
                    </label>
                    <input
                      type="date"
                      value={serviceDate.toISOString().split("T")[0]}
                      onChange={(e) => setServiceDate(new Date(e.target.value))}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service/Product Tabs */}
          <div className="pos-tabs">
            <button
              className={`pos-tab ${activeTab === "services" ? "active" : ""}`}
              onClick={() => setActiveTab("services")}
            >
              <Scissors size={18} />
              <span>
                {t("services")} ({services.length})
              </span>
            </button>
            <button
              className={`pos-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <ShoppingCart size={18} />
              <span>
                {t("products")} ({products.length})
              </span>
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
        </section>

        {/* Right Panel - Bill */}
        <aside className="pos-sidebar">
          <BillPanel />
        </aside>
      </main>
    </div>
  );
};

export default POS;
