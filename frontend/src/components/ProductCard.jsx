import React from "react";
import { usePOS } from "../context/POSContext";
import { Package, AlertTriangle } from "lucide-react";

const ProductCard = ({ product }) => {
  const { addProduct } = usePOS();

  const getStockStatus = (quantity) => {
    if (quantity === 0)
      return { status: "out", color: "#666666", text: "Out of Stock" };
    if (quantity < 5)
      return { status: "low", color: "#666666", text: "Low Stock" };
    return { status: "good", color: "#000000", text: "In Stock" };
  };

  const stockInfo = getStockStatus(product.stock_quantity);
  const isOutOfStock = product.stock_quantity === 0;

  // Extract only serializable data
  const handleAddProduct = () => {
    if (isOutOfStock) return;

    const serializableProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category,
      // Add any other properties you need, but NO React icons
    };
    addProduct(serializableProduct);
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}
      onClick={handleAddProduct}
      style={{ opacity: isOutOfStock ? 0.5 : 1 }}
    >
      <style jsx>{`
        .product-card {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 0.5rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .product-card:hover:not(.out-of-stock) {
          transform: translateY(-2px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border-color: #000000;
        }

        .product-card.out-of-stock {
          cursor: not-allowed;
          background: #f5f5f5;
        }

        .product-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .product-icon {
          width: 3rem;
          height: 3rem;
          background: #f5f5f5;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666666;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 1rem;
          font-weight: 600;
          color: #000000;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
          line-height: 1.4;
        }

        .product-category {
          font-size: 0.75rem;
          color: #666666;
          background: #f5f5f5;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          display: inline-block;
          font-weight: 500;
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000000;
          margin: 0.5rem 0;
          letter-spacing: -0.025em;
        }

        .product-stock {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stock-indicator {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
        }

        .product-btn {
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          border-radius: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.5rem;
        }

        .product-btn:hover:not(:disabled) {
          background: #ffffff;
          color: #000000;
        }

        .product-btn:disabled {
          background: #cccccc;
          border-color: #cccccc;
          cursor: not-allowed;
        }

        .stock-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666666;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #000000;
          color: #ffffff;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
          handleAddProduct();
        }}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Bill"}
      </button>
    </div>
  );
};

export default ProductCard;
