import React from "react";
import { usePOS } from "../context/POSContext";
import { Package, AlertTriangle } from "lucide-react";

const ProductCard = ({ product }) => {
  const { addProduct } = usePOS();

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return { status: "out", color: "#dc2626", text: "Out of Stock" };
    if (quantity < 5)
      return { status: "low", color: "#f59e0b", text: "Low Stock" };
    return { status: "good", color: "#10b981", text: "In Stock" };
  };

  const stockInfo = getStockStatus(product.stock_quantity);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div
      className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}
      onClick={() => !isOutOfStock && addProduct(product)}
      style={{ opacity: isOutOfStock ? 0.5 : 1 }}
    >
      <style jsx>{`
        .product-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .product-card:hover:not(.out-of-stock) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .product-card.out-of-stock {
          cursor: not-allowed;
          background: #f9fafb;
        }

        .product-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .product-category {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: green;
          margin: 8px 0;
        }

        .product-stock {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .stock-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .product-btn {
          background: black;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: 8px;
        }

        .product-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .stock-warning {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f59e0b;
          font-size: 12px;
          margin-top: 4px;
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(220, 38, 38, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      {isOutOfStock && <div className="out-of-stock-overlay">OUT OF STOCK</div>}

      <div className="product-header">
        <div className="product-icon">
          <Package size={20} />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          {product.category && (
            <span className="product-category">{product.category}</span>
          )}
        </div>
      </div>

      <div className="product-price">{product.price.toFixed(2)} EGP</div>

      <div className="product-stock" style={{ color: stockInfo.color }}>
        <div
          className="stock-indicator"
          style={{ backgroundColor: stockInfo.color }}
        />
        {product.stock_quantity} units available
      </div>

      {product.stock_quantity < 5 && product.stock_quantity > 0 && (
        <div className="stock-warning">
          <AlertTriangle size={14} />
          Low stock warning
        </div>
      )}

      <button
        className="product-btn"
        disabled={isOutOfStock}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOutOfStock) addProduct(product);
        }}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Bill"}
      </button>
    </div>
  );
};

export default ProductCard;
