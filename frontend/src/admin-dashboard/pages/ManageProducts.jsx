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
import { useLanguage } from "../../context/LanguageContext";

export default function ManageProducts() {
  const { t, isRTL } = useLanguage();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState("products"); // "products" or "suppliers"
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // "product" or "supplier"

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(t("Failed to load products"));
      const data = await res.json();
      console.log("📦 Products from backend:", data); // ⬅️ ADD THIS LINE

      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(t("Failed to load products"));
      setProducts([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (!res.ok) throw new Error(t("Failed to load suppliers"));
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      setError(t("Failed to load suppliers"));
      setSuppliers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      if (res.ok) {
        setNewCategory("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const updateCategory = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategoryName.trim() }),
      });
      if (res.ok) {
        setEditingCategoryId(null);
        setEditingCategoryName("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm(t("Are you sure you want to delete this category?"))) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
  }, []);

  const addProduct = async () => {
    const requiredFields = ["name", "price", "stock_quantity"];
    const missingFields = requiredFields.filter(
      (field) => !newProduct[field]?.toString().trim()
    );

    if (missingFields.length > 0) {
      setError(`${t("Required fields missing")}: ${missingFields.join(", ")}`);
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
        throw new Error(errorData.error || t("Failed to add product"));
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
      setError(t("Supplier name is required"));
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
        throw new Error(errorData.error || t("Failed to add supplier"));
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
      setError(`${t("Required fields missing")}: ${missingFields.join(", ")}`);
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
        throw new Error(errorData.error || t("Failed to update product"));
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
    const product = products.find((p) => p.id === id);
    setDeleteConfirmation({
      id: id,
      item: product,
      isVisible: true,
    });
    setDeleteType("product");
  };

  const deleteSupplier = async (id) => {
    const supplier = suppliers.find((s) => s.id === id);
    setDeleteConfirmation({
      id: id,
      item: supplier,
      isVisible: true,
    });
    setDeleteType("supplier");
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      ...deleteConfirmation,
      isVisible: false,
    });
    // Remove the confirmation after animation
    setTimeout(() => {
      setDeleteConfirmation(null);
      setDeleteType(null);
    }, 300);
  };

  const proceedWithDelete = async () => {
    if (!deleteConfirmation?.id || !deleteType) return;

    setLoading(true);
    setError("");

    try {
      const endpoint =
        deleteType === "product"
          ? `/api/products/${deleteConfirmation.id}`
          : `/api/suppliers/${deleteConfirmation.id}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to delete ${deleteType}`);
      }

      setDeleteConfirmation(null);
      setDeleteType(null);

      if (deleteType === "product") {
        fetchProducts();
      } else {
        fetchSuppliers();
      }
    } catch (err) {
      console.error(`Error deleting ${deleteType}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, reorderLevel = 5) => {
    if (quantity === 0)
      return { status: "out", color: "#dc2626", text: t("Out of Stock") };
    if (quantity <= reorderLevel)
      return { status: "low", color: "#f59e0b", text: t("Low Stock") };
    return { status: "good", color: "#10b981", text: t("In Stock") };
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : t("No Supplier");
  };

  const getMargin = (sellPrice, costPrice) => {
    if (!costPrice || !sellPrice) return null;
    const margin = (((sellPrice - costPrice) / sellPrice) * 100).toFixed(1);
    return `${margin}%`;
  };

  // Helper function for updating suppliers
  const updateSupplier = async (id, updatedSupplier) => {
    if (!updatedSupplier.name.trim()) {
      setError(t("Supplier name is required"));
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
        throw new Error(errorData.error || t("Failed to update supplier"));
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

  return (
    <div
      className="manage-products-page"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
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
          background: #ffffff;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #e5e5e5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
          color: #666666;
        }

        .tab-button.active {
          background: #000000;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tab-button:not(.active) {
          color: #666666;
        }

        .tab-button:not(.active):hover {
          background: #f5f5f5;
          color: #000000;
        }

        /* Add these CSS updates to your existing styles in ManageProducts.jsx */
          display: flex;
          flex-direction: column;
          gap: 16px; /* Increased gap for better spacing */
          width: 100%;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .edit-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .edit-form .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .edit-form input,
        .edit-form select,
        .edit-form textarea {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: #ffffff;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .edit-form input:focus,
        .edit-form select:focus,
        .edit-form textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .edit-form input:disabled,
        .edit-form select:disabled,
        .edit-form textarea:disabled {
          background-color: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
        }

        .edit-form .item-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .edit-form .action-button {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .edit-form .action-button.primary {
          background-color: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .edit-form .action-button.primary:hover:not(:disabled) {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }

        .edit-form .action-button:not(.primary) {
          background-color: #f8fafc;
          color: #374151;
          border-color: #d1d5db;
        }

        .edit-form .action-button:not(.primary):hover:not(:disabled) {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }

        .edit-form .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Enhanced form field styling for better UX */
        .edit-form input[type="number"] {
          text-align: right;
        }

        .edit-form textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .edit-form .item-actions {
            flex-direction: column;
          }

          .edit-form .action-button {
            width: 100%;
          }
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
        .category-badge {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
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

        /* Delete Confirmation Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 0.5rem;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e5e5;
          animation: slideIn 0.3s ease-out;
          transform-origin: center;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f1f5f9;
          color: #1a202c;
        }

        .modal-body {
          padding: 0 1.5rem 1.5rem 1.5rem;
          text-align: center;
        }

        .alert-icon {
          color: #dc2626;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .modal-body p {
          font-size: 1rem;
          color: #374151;
          margin: 0 0 2rem 0;
          line-height: 1.5;
        }

        .item-details-text {
          display: block;
          margin: 0.75rem 0;
          font-size: 0.9rem;
          color: #666666;
          font-style: italic;
          line-height: 1.4;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .cancel-button {
          background: #ffffff;
          color: #666666;
          border: 1px solid #e5e5e5;
          border-radius: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: inherit;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #000000;
          color: #000000;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .cancel-button:disabled {
          background: #f5f5f5;
          color: #999999;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .delete-confirmation-modal .delete-button {
          background: #dc2626;
          color: #ffffff;
          border: 1px solid #dc2626;
          border-radius: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: inherit;
        }

        .delete-confirmation-modal .delete-button:hover:not(:disabled) {
          background: #b91c1c;
          border-color: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }

        .delete-confirmation-modal .delete-button:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Animation Keyframes */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Responsive adjustments for delete modal */
        @media (max-width: 768px) {
          .modal-actions {
            flex-direction: column-reverse;
          }
          .modal-actions .cancel-button,
          .modal-actions .delete-button {
            width: 100%;
            justify-content: center;
          }
          .modal-content {
            margin: 0.5rem;
            max-width: none;
            width: auto;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          <Package size={32} />
          {t("Inventory Management")}
        </h1>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={16} />
            {t("Products")} ({products.length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "suppliers" ? "active" : ""
            }`}
            onClick={() => setActiveTab("suppliers")}
          >
            <Truck size={16} />
            {t("Suppliers")} ({suppliers.length})
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
                {t("Add New Product")}
              </h2>
              {!showSupplierForm && (
                <button
                  className="form-button secondary"
                  onClick={() => setShowSupplierForm(true)}
                >
                  <Plus size={16} />
                  {t("Quick Add Supplier")}
                </button>
              )}
              <button
                className="form-button secondary"
                onClick={() => setShowCategoryModal(true)}
              >
                <Package size={16} />
                {t("Manage Categories")}
              </button>
            </div>
            <p className="subtext">
              {t("Add a new retail product to your inventory")}
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
                    {t("Quick Add Supplier")}
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
                    <label className="form-label">{t("Supplier Name")} *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={newSupplier.name}
                      onChange={(e) =>
                        setNewSupplier({ ...newSupplier, name: e.target.value })
                      }
                      placeholder={t("Enter supplier name")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Contact Person")}</label>
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
                      placeholder={t("Contact person name")}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t("Phone")}</label>
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
                      {loading ? t("Adding...") : t("Add Supplier")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t("Product Name")} *</label>
                <input
                  className="form-input"
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder={t("Enter product name")}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("Selling Price (EGP)")} *
                </label>
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
                <label className="form-label">{t("Cost Price (EGP)")}</label>
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
                <label className="form-label">{t("Stock Quantity")} *</label>
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
                <label className="form-label">{t("Reorder Level")}</label>
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
                <label className="form-label">{t("Category")}</label>
                <select
                  className="form-select"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                >
                  <option value="">{t("Select Category (Optional)")}</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t("Supplier")}</label>
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
                  <option value="">{t("Select Supplier (Optional)")}</option>
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
                  {loading ? t("Adding...") : t("Add Product")}
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
                    {product.category_name && (
                      <div className="category-badge">
                        {product.category_name}
                      </div>
                    )}
                  </div>
                </div>

                {editingProduct?.id === product.id ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label className="form-label">
                        {t("Product Name")} *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target.value,
                          })
                        }
                        placeholder={t("Product name")}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Selling Price (EGP)")} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: e.target.value,
                          })
                        }
                        placeholder={t("Selling price")}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Cost Price (EGP)")}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={editingProduct.cost_price || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            cost_price: e.target.value,
                          })
                        }
                        placeholder={t("Cost price")}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("Stock Quantity")} *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={editingProduct.stock_quantity}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stock_quantity: e.target.value,
                          })
                        }
                        placeholder={t("Stock quantity")}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("Reorder Level")}</label>
                      <input
                        type="number"
                        className="form-input"
                        value={editingProduct.reorder_level || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            reorder_level: e.target.value,
                          })
                        }
                        placeholder={t("Reorder level")}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("Category")}</label>
                      <select
                        className="form-select"
                        value={editingProduct.category || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value,
                          })
                        }
                        disabled={loading}
                      >
                        <option value="">
                          {t("Select Category (Optional)")}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("Supplier")}</label>
                      <select
                        className="form-select"
                        value={editingProduct.supplier_id || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            supplier_id: e.target.value,
                          })
                        }
                        disabled={loading}
                      >
                        <option value="">
                          {t("Select Supplier (Optional)")}
                        </option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t("Description")}</label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        value={editingProduct.description || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        placeholder={t("Product description (optional)")}
                        disabled={loading}
                      />
                    </div>

                    <div className="item-actions">
                      <button
                        className="action-button primary"
                        onClick={() =>
                          updateProduct(product.id, editingProduct)
                        }
                        disabled={loading}
                      >
                        <Save size={16} />
                        {loading ? t("Saving...") : t("Save")}
                      </button>
                      <button
                        className="action-button"
                        onClick={() => setEditingProduct(null)}
                        disabled={loading}
                      >
                        <X size={16} />
                        {t("Cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-details">
                      <div className="detail-row">
                        <span className="detail-label">
                          {t("Selling Price:")}:
                        </span>
                        <span className="price-display">
                          {product.price.toFixed(2)} EGP
                        </span>
                      </div>
                      {product.cost_price && (
                        <div className="detail-row">
                          <span className="detail-label">
                            {t("Cost Price:")}:
                          </span>
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
                                {t("margin")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">{t("Stock:")}:</span>
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
                          {product.stock_quantity} {t("units")}
                          {product.stock_quantity <=
                            (product.reorder_level || 5) &&
                            product.stock_quantity > 0 && (
                              <AlertTriangle size={14} />
                            )}
                        </div>
                      </div>
                      {product.reorder_level && (
                        <div className="detail-row">
                          <span className="detail-label">
                            {t("Reorder Level:")}:
                          </span>
                          <span className="detail-value">
                            {product.reorder_level} {t("units")}
                          </span>
                        </div>
                      )}
                      {product.supplier_id && (
                        <div className="detail-row">
                          <span className="detail-label">
                            {t("Supplier:")}:
                          </span>
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
                        {t("Edit")}
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => deleteProduct(product.id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                        {t("Remove")}
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
              <h3>{t("No products yet")}</h3>
              <p>{t("Add your first product to get started")}</p>
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
              {t("Add New Supplier")}
            </h2>
            <p className="subtext">{t("Add a new supplier to your network")}</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t("Supplier Name")} *</label>
                <input
                  className="form-input"
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  placeholder={t("Enter supplier name")}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("Contact Person")}</label>
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
                  placeholder={t("Contact person name")}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("Phone Number")}</label>
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
                <label className="form-label">{t("Email")}</label>
                <input
                  className="form-input"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  placeholder={t("supplier@example.com")}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t("Address")}</label>
                <input
                  className="form-input"
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                  placeholder={t("Supplier address")}
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
                  {loading ? t("Adding...") : t("Add Supplier")}
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
                        {t("Contact:")}: {supplier.contact_person}
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
                      placeholder={t("Supplier name")}
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
                      placeholder={t("Contact person")}
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
                      placeholder={t("Phone number")}
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
                      placeholder={t("Email")}
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
                        {loading ? t("Saving...") : t("Save")}
                      </button>
                      <button
                        className="action-button"
                        onClick={() => setEditingSupplier(null)}
                        disabled={loading}
                      >
                        <X size={16} />
                        {t("Cancel")}
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
                        <span className="detail-label">
                          {t("Products Supplied:")}:
                        </span>
                        <span className="detail-value">
                          {
                            products.filter(
                              (p) => p.supplier_id === supplier.id
                            ).length
                          }{" "}
                          {t("items")}
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
                        {t("Edit")}
                      </button>
                      <button
                        className="action-button danger"
                        onClick={() => deleteSupplier(supplier.id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                        {t("Remove")}
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
              <h3>{t("No suppliers yet")}</h3>
              <p>{t("Add your first supplier to get started")}</p>
            </div>
          )}
        </>
      )}

      {showCategoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              width: "400px",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px" }}>{t("Manage Categories")}</h3>

            <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
              <input
                className="form-input"
                placeholder={t("New category name")}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button className="form-button" onClick={addCategory}>
                {t("Add")}
              </button>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        className="form-input"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                      />
                      <button
                        className="form-button"
                        onClick={() => updateCategory(cat.id)}
                      >
                        {t("Save")}
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{cat.name}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="action-button"
                          onClick={() => {
                            setEditingCategoryId(cat.id);
                            setEditingCategoryName(cat.name);
                          }}
                        >
                          {t("Edit")}
                        </button>
                        <button
                          className="action-button danger"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          {t("Delete")}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirmation-modal">
            <div className="modal-header">
              <h2>
                {deleteType === "product"
                  ? t("Confirm Delete Product")
                  : t("Confirm Delete Supplier")}
              </h2>
              <button className="close-btn" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <AlertTriangle size={48} className="alert-icon" />
              <p>
                {deleteType === "product" ? (
                  <>
                    Are you sure you want to delete the product{" "}
                    <strong>"{deleteConfirmation.item?.name}"</strong>?
                    <br />
                    <span className="item-details-text">
                      Price: {deleteConfirmation.item?.price?.toFixed(2)} EGP
                      {deleteConfirmation.item?.stock_quantity !==
                        undefined && (
                        <>
                          <br />
                          Stock: {deleteConfirmation.item.stock_quantity} units
                        </>
                      )}
                      {deleteConfirmation.item?.category && (
                        <>
                          <br />
                          Category: {deleteConfirmation.item.category}
                        </>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    Are you sure you want to delete the supplier{" "}
                    <strong>"{deleteConfirmation.item?.name}"</strong>?
                    <br />
                    <span className="item-details-text">
                      {deleteConfirmation.item?.contact_person && (
                        <>
                          Contact: {deleteConfirmation.item.contact_person}
                          <br />
                        </>
                      )}
                      {deleteConfirmation.item?.phone && (
                        <>
                          Phone: {deleteConfirmation.item.phone}
                          <br />
                        </>
                      )}
                      {deleteConfirmation.item?.email && (
                        <>
                          Email: {deleteConfirmation.item.email}
                          <br />
                        </>
                      )}
                      Products Supplied:{" "}
                      {
                        products.filter(
                          (p) => p.supplier_id === deleteConfirmation.item?.id
                        ).length
                      }{" "}
                      items
                    </span>
                  </>
                )}
                <br />
                This action cannot be undone and will remove all associated
                data.
              </p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={cancelDelete}>
                  {t("Cancel")}
                </button>
                <button
                  className="delete-button"
                  onClick={proceedWithDelete}
                  disabled={loading}
                >
                  {loading ? t("Deleting...") : t("Delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
