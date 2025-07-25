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
  } = usePOS();

  const { colors } = useTheme();
  const { t, toggleLanguage, isRTL, language } = useLanguage();

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, productRes, barberRes] = await Promise.all([
          fetch("http://localhost:5000/api/services"),
          fetch("http://localhost:5000/api/products"),
          fetch("http://localhost:5000/api/barbers"),
        ]);

        const servicesData = await serviceRes.json();
        const productsData = await productRes.json();
        const barbersData = await barberRes.json();

        // Try to fetch customers, but don't fail if the endpoint doesn't exist
        let customersData = [];
        try {
          const customerRes = await fetch(
            "http://localhost:5000/api/customers"
          );
          if (customerRes.ok) {
            customersData = await customerRes.json();
          }
        } catch (customerErr) {
          console.warn("Customers endpoint not available:", customerErr);
        }

        setServices(servicesData || []);
        setProducts(productsData || []);
        setBarbers(barbersData || []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Set default empty arrays on error
        setServices([]);
        setProducts([]);
        setBarbers([]);
        setCustomers([]);
      }
    };

    fetchData();
  }, []);

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
              <select
                value={
                  customerId ||
                  (customerName === "Walk-in" ? "walk-in" : "new-customer")
                }
                onChange={handleCustomerChange}
                className="pos-input"
              >
                <option value="new-customer">{t("newCustomer")}</option>
                <option value="walk-in">{t("walkInCustomer")}</option>
                {Array.isArray(customers) &&
                  customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.mobile}
                    </option>
                  ))}
              </select>

              {/* Manual customer name input for new customers */}
              {!customerId && customerName !== "Walk-in" && (
                <input
                  type="text"
                  placeholder={t("enterCustomerName")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pos-input"
                />
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
          <BillPanel />
        </div>
      </div>
    </div>
  );
};

export default POS;
