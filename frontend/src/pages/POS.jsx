import React, { useEffect, useState } from "react";
import { usePOS } from "../context/POSContext";
import { useTheme } from "../context/ThemeContext";
import ServiceCard from "../components/ServiceCard";
import ProductCard from "../components/ProductCard";
import BillPanel from "../components/BillPanel";
import "../styles/POS.css";

const POS = () => {
  const {
    customerName,
    setCustomerName,
    selectedBarber,
    setSelectedBarber,
    serviceDate,
    setServiceDate,
  } = usePOS();

  const { colors } = useTheme();

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [barbers, setBarbers] = useState([]);
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

        setServices(servicesData);
        setProducts(productsData);
        setBarbers(barbersData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="pos-container">
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
          border-color: #2563eb;
          background: #2563eb;
          color: white;
        }

        .pos-tab:hover:not(.active) {
          border-color: #9ca3af;
        }

        .walk-in-option {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .walk-in-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #2563eb;
        }

        .walk-in-label {
          font-size: 14px;
          color: #6b7280;
          cursor: pointer;
        }

        .tab-content {
          min-height: 400px;
        }
      `}</style>

      <header
        className="pos-header"
        style={{ backgroundColor: colors.primary }}
      >
        <div>
          <h1 style={{ color: colors.secondary }}>Nassim Select Barber</h1>
          <p style={{ color: colors.secondary, fontSize: "14px" }}>
            Point of Sale System
          </p>
        </div>
        <button className="logout-btn">Logout</button>
      </header>

      <div className="pos-main">
        <div className="pos-left">
          <div className="input-row">
            <input
              type="text"
              placeholder="Enter customer name or select Walk-in"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pos-input"
              disabled={customerName === "Walk-in"}
            />

            <div className="walk-in-option">
              <input
                type="checkbox"
                id="walk-in-checkbox"
                className="walk-in-checkbox"
                checked={customerName === "Walk-in"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCustomerName("Walk-in");
                  } else {
                    setCustomerName("");
                  }
                }}
              />
              <label htmlFor="walk-in-checkbox" className="walk-in-label">
                Walk-in Customer
              </label>
            </div>

            <select
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              className="pos-input"
            >
              <option value="">Select Barber</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.name}>
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
              <span>🔧</span>
              Services ({services.length})
            </button>
            <button
              className={`pos-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <span>📦</span>
              Products ({products.length})
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
                    <p>No services available</p>
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
                    <p>No products available</p>
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
