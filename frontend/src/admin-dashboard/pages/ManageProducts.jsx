import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Package,
  ShoppingBag,
  AlertTriangle,
  Truck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState("products"); // "products" or "suppliers"
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    category: "",
    description: "",
    supplier_id: "",
    cost_price: "",
    reorder_level: "",
  });

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products");
      setProducts([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      setError("Failed to load suppliers");
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const addProduct = async () => {
    const requiredFields = ["name", "price", "stock_quantity"];
    const missingFields = requiredFields.filter(
      (field) => !newProduct[field]?.toString().trim()
    );

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const productData = {
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        category: newProduct.category.trim(),
        description: newProduct.description.trim(),
        supplier_id: newProduct.supplier_id || null,
        cost_price: newProduct.cost_price
          ? parseFloat(newProduct.cost_price)
          : null,
        reorder_level: newProduct.reorder_level
          ? parseInt(newProduct.reorder_level)
          : 5,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      setNewProduct({
        name: "",
        price: "",
        stock_quantity: "",
        category: "",
        description: "",
        supplier_id: "",
        cost_price: "",
        reorder_level: "",
      });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async () => {
    if (!newSupplier.name.trim()) {
      setError("Supplier name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSupplier.name.trim(),
          contact_person: newSupplier.contact_person.trim(),
          phone: newSupplier.phone.trim(),
          email: newSupplier.email.trim(),
          address: newSupplier.address.trim(),
          notes: newSupplier.notes.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add supplier");
      }

      setNewSupplier({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      });
      setShowSupplierForm(false);
      fetchSuppliers();
    } catch (err) {
      console.error("Error adding supplier:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    const requiredFields = ["name", "price", "stock_quantity"];
    const missingFields = requiredFields.filter(
      (field) => !updatedProduct[field]?.toString().trim()
    );

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const productData = {
        name: updatedProduct.name.trim(),
        price: parseFloat(updatedProduct.price),
        stock_quantity: parseInt(updatedProduct.stock_quantity),
        category: updatedProduct.category?.trim() || "",
        description: updatedProduct.description?.trim() || "",
        supplier_id: updatedProduct.supplier_id || null,
        cost_price: updatedProduct.cost_price
          ? parseFloat(updatedProduct.cost_price)
          : null,
        reorder_level: updatedProduct.reorder_level
          ? parseInt(updatedProduct.reorder_level)
          : 5,
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete supplier");
      }

      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, reorderLevel = 5) => {
    if (quantity === 0)
      return { status: "out", color: "#dc2626", text: "Out of Stock" };
    if (quantity <= reorderLevel)
      return { status: "low", color: "#f59e0b", text: "Low Stock" };
    return { status: "good", color: "#10b981", text: "In Stock" };
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "No Supplier";
  };

  const getMargin = (sellPrice, costPrice) => {
    if (!costPrice || !sellPrice) return null;
    const margin = (((sellPrice - costPrice) / sellPrice) * 100).toFixed(1);
    return `${margin}%`;
  };

  return (
    <div className="manage-products-page">
      <style jsx>{`
        .manage-products-page {
          padding: 32px;
          font-family: "Inter", sans-serif;
          background-color: #f9fafb;
          color: #1f2937;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tab-navigation {
          display: flex;
          gap: 4px;
          background: white;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .tab-button {
          padding: 8px 16px;
          border: none;
          background: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tab-button.active {
          background: #2563eb;
          color: white;
        }

        .tab-button:not(.active) {
          color: #6b7280;
        }

        .tab-button:not(.active):hover {
          background: #f3f4f6;
          color: #374151;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #fca5a5;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-message button {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content-card {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          border: 1px solid #e5e7eb;
          margin-bottom: 32px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .subtext {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: start;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 14px;
          font-size: 14px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #2563eb;
          background-color: #ffffff;
        }

        .form-button {
          background-color: #111827;
          color: white;
          font-size: 14px;
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s ease;
          white-space: nowrap;
          justify-content: center;
        }

        .form-button:hover:not(:disabled) {
          background-color: #000000;
        }

        .form-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .form-button.secondary {
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .form-button.secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .item-card {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }

        .item-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .item-icon {
          width: 48px;
          height: 48px;
          background-color: #f3f4f6;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #1f2937;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .detail-label {
          color: #6b7280;
        }

        .detail-value {
          color: #1f2937;
          font-weight: 500;
        }

        .price-display {
          font-size: 18px;
          font-weight: 700;
          color: #2563eb;
        }

        .stock-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .stock-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .category-badge {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .margin-badge {
          font-size: 12px;
          color: #059669;
          background: #dcfce7;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .supplier-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .item-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .action-button {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background-color: #111827;
          color: white;
          border-color: #111827;
        }

        .action-button.primary:hover:not(:disabled) {
          background-color: #000000;
        }

        .action-button.danger {
          color: #dc2626;
          border-color: #fca5a5;
        }

        .action-button.danger:hover:not(:disabled) {
          background-color: #fef2f2;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .edit-form input,
        .edit-form select,
        .edit-form textarea {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: #f9fafb;
          box-sizing: border-box;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-state svg {
          opacity: 0.4;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 18px;
        }

        .supplier-card {
          border-left: 4px solid #3b82f6;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @media (max-width: 768px) {
          .manage-products-page {
            padding: 16px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .items-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .card-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          <Package size={32} />
          Inventory Management
        </h1>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={16} />
            Products ({products.length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "suppliers" ? "active" : ""
            }`}
            onClick={() => setActiveTab("suppliers")}
          >
            <Truck size={16} />
            Suppliers ({suppliers.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          {/* Add Product Form */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <ShoppingBag size={18} />
                Add New Product
              </h2>
              {!showSupplierForm && (
                <button
                  className="form-button secondary"
                  onClick={() => setShowSupplierForm(true)}
                >
                  <Plus size={16} />
                  Quick Add Supplier
                </button>
              )}
            </div>
            <p className="subtext">
              Add a new retail product to your inventory
            </p>

            {showSupplierForm && (
              <div
                style={{
                  background: "#f9fafb",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}
                  >
                    <Truck
                      size={16}
                      style={{ display: "inline", marginRight: "8px" }}
                    />
                    Quick Add Supplier
                  </h3>
                  <button
                    className="form-button secondary"
                    onClick={() => setShowSupplierForm(false)}
                    style={{ padding: "6px" }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Supplier Name *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, name: e.target.value })
                      }
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      className="form-input"
                      type="text"
                      value={newSupplier.contact_person}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          contact_person: e.target.value,
                        })
                      }
                      placeholder="Contact person name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-input"
                      type="tel"
                      value={newSupplier.phone}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+20 123 456 7890"
                    />
                  </div>
                  <div className="form-group">
                    <button
                      className="form-button"
                      onClick={addSupplier}
                      disabled={loading}
                      style={{ marginTop: "23px" }}
                    >
                      <Plus size={16} />
                      {loading ? "Adding..." : "Add Supplier"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (EGP) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost Price (EGP)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  value={newProduct.cost_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, cost_price: e.target.value })
                  }
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  className="form-input"
                  type="number"
                  value={newProduct.stock_quantity}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stock_quantity: e.target.value,
                    })
                  }
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                <input
                  className="form-input"
                  type="number"
                  value={newProduct.reorder_level}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      reorder_level: e.target.value,
                    })
                  }
                  placeholder="5"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  className="form-input"
                  type="text"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  placeholder="e.g., Hair Care, Styling"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <select
                  className="form-select"
                  value={newProduct.supplier_id}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      supplier_id: e.target.value,
                    })
                  }
                  disabled={loading}
                >
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <button
                  className="form-button"
                  onClick={addProduct}
                  disabled={loading}
                  style={{ marginTop: "23px" }}
                >
                  <Plus size={16} />
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="items-grid">
            {products.map((product) => (
              <div key={product.id} className="item-card">
                <div className="item-header">
                  <div className="item-icon">
                    <Package size={24} />
                  </div>
                  <div className="item-info">
                    <div className="item-name">{product.name}</div>
                    {product.category && (
                      <div className="category-badge">{product.category}</div>
                    )}
                  </div>
                </div>

                {editingProduct?.id === product.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Product name"
                      disabled={loading}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: e.target.value,
                        })
                      }
                      placeholder="Selling price"
                      disabled={loading}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.cost_price || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          cost_price: e.target.value,
                        })
                      }
                      placeholder="Cost price"
                      disabled={loading}
                    />
                    <input
                      type="number"
                      value={editingProduct.stock_quantity}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock_quantity: e.target.value,
                        })
                      }
                      placeholder="Stock quantity"
                      disabled={loading}
                    />
                    <select
                      value={editingProduct.supplier_id || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          supplier_id: e.target.value,
                        })
                      }
                      disabled={loading}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    <div className="item-actions">
                      <button
                        className="action-button primary"
                        onClick={() =>
                          updateProduct(product.id, editingProduct)
                        }
                        disabled={loading}
                      >
                        <Save size={16} />
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="action-button"
                        onClick={() => setEditingProduct(null)}
                        disabled={loading}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-details">
                      <div className="detail-row">
                        <span className="detail-label">Selling Price:</span>
                        <span className="price-display">
                          {product.price.toFixed(2)} EGP
                        </span>
                      </div>
                      {product.cost_price && (
                        <div className="detail-row">
                          <span className="detail-label">Cost Price:</span>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <span className="detail-value">
                              {product.cost_price.toFixed(2)} EGP
                            </span>
                            {getMargin(product.price, product.cost_price) && (
                              <span className="margin-badge">
                                {getMargin(product.price, product.cost_price)}{" "}
                                margin
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Stock:</span>
                        <div
                          className="stock-display"
                          style={{
                            color: getStockStatus(
                              product.stock_quantity,
                              product.reorder_level
                            ).color,
                          }}
                        >
                          <div
                            className="stock-indicator"
                            style={{
                              backgroundColor: getStockStatus(
                                product.stock_quantity,
                                product.reorder_level
                              ).color,
                            }}
                          />
                          {product.stock_quantity} units
                          {product.stock_quantity <=
                            (product.reorder_level || 5) &&
                            product.stock_quantity > 0 && (
                              <AlertTriangle size={14} />
                            )}
                        </div>
                      </div>
                      {product.reorder_level && (
                        <div className="detail-row">
                          <span className="detail-label">Reorder Level:</span>
                          <span className="detail-value">
                            {product.reorder_level} units
                          </span>
                        </div>
                      )}
                      {product.supplier_id && (
                        <div className="detail-row">
                          <span className="detail-label">Supplier:</span>
                          <div className="supplier-info">
                            <Truck size={14} />
                            {getSupplierName(product.supplier_id)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <button
                        className="action-button primary"
                        onClick={() => setEditingProduct(product)}
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => deleteProduct(product.id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <Package size={48} />
              <h3>No products yet</h3>
              <p>Add your first product to get started</p>
            </div>
          )}
        </>
      )}

      {/* Suppliers Tab */}
      {activeTab === "suppliers" && (
        <>
          {/* Add Supplier Form */}
          <div className="content-card">
            <h2 className="card-title">
              <Truck size={18} />
              Add New Supplier
            </h2>
            <p className="subtext">Add a new supplier to your network</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Supplier Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  placeholder="Enter supplier name"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  className="form-input"
                  type="text"
                  value={newSupplier.contact_person}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      contact_person: e.target.value,
                    })
                  }
                  placeholder="Contact person name"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  placeholder="+20 123 456 7890"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  placeholder="supplier@example.com"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                  placeholder="Supplier address"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <button
                  className="form-button"
                  onClick={addSupplier}
                  disabled={loading}
                  style={{ marginTop: "23px" }}
                >
                  <Plus size={16} />
                  {loading ? "Adding..." : "Add Supplier"}
                </button>
              </div>
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="items-grid">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="item-card supplier-card">
                <div className="item-header">
                  <div
                    className="item-icon"
                    style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
                  >
                    <Building2 size={24} />
                  </div>
                  <div className="item-info">
                    <div className="item-name">{supplier.name}</div>
                    {supplier.contact_person && (
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginTop: "4px",
                        }}
                      >
                        Contact: {supplier.contact_person}
                      </div>
                    )}
                  </div>
                </div>

                {editingSupplier?.id === supplier.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingSupplier.name}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          name: e.target.value,
                        })
                      }
                      placeholder="Supplier name"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={editingSupplier.contact_person || ""}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          contact_person: e.target.value,
                        })
                      }
                      placeholder="Contact person"
                      disabled={loading}
                    />
                    <input
                      type="tel"
                      value={editingSupplier.phone || ""}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Phone number"
                      disabled={loading}
                    />
                    <input
                      type="email"
                      value={editingSupplier.email || ""}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email"
                      disabled={loading}
                    />
                    <div className="item-actions">
                      <button
                        className="action-button primary"
                        onClick={() =>
                          updateSupplier(supplier.id, editingSupplier)
                        }
                        disabled={loading}
                      >
                        <Save size={16} />
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="action-button"
                        onClick={() => setEditingSupplier(null)}
                        disabled={loading}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="contact-info">
                      {supplier.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="contact-item">
                          <Mail size={14} />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.address && (
                        <div className="contact-item">
                          <MapPin size={14} />
                          {supplier.address}
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <div className="detail-row">
                        <span className="detail-label">Products Supplied:</span>
                        <span className="detail-value">
                          {
                            products.filter(
                              (p) => p.supplier_id === supplier.id
                            ).length
                          }{" "}
                          items
                        </span>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="action-button primary"
                        onClick={() => setEditingSupplier(supplier)}
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => deleteSupplier(supplier.id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {suppliers.length === 0 && (
            <div className="empty-state">
              <Truck size={48} />
              <h3>No suppliers yet</h3>
              <p>Add your first supplier to get started</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Helper function for updating suppliers
  const updateSupplier = async (id, updatedSupplier) => {
    if (!updatedSupplier.name.trim()) {
      setError("Supplier name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedSupplier.name.trim(),
          contact_person: updatedSupplier.contact_person?.trim() || "",
          phone: updatedSupplier.phone?.trim() || "",
          email: updatedSupplier.email?.trim() || "",
          address: updatedSupplier.address?.trim() || "",
          notes: updatedSupplier.notes?.trim() || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update supplier");
      }

      setEditingSupplier(null);
      fetchSuppliers();
    } catch (err) {
      console.error("Error updating supplier:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
}
