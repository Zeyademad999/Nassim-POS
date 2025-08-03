import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all products with supplier information
router.get("/", async (req, res) => {
  try {
    console.log("📥 GET /api/products - Fetching all products");
    const db = await dbPromise;
    const products = await db.all(`
  SELECT 
    p.*,
    s.name AS supplier_name,
    s.contact_person AS supplier_contact,
    c.name AS category_name
  FROM products p
  LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN categories c ON p.category = c.name

  ORDER BY p.name ASC
`);

    console.log("✅ Found products:", products.length);
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET single product with full details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 GET /api/products/:id - Fetching product:", id);

    const db = await dbPromise;
    const product = await db.get(
      `
      SELECT 
        p.*,
        s.name as supplier_name,
        s.contact_person as supplier_contact,
        s.phone as supplier_phone,
        s.email as supplier_email
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST - Add a new product with supplier support
router.post("/", async (req, res) => {
  try {
    console.log("📥 POST /api/products - Request body:", req.body);

    const {
      name,
      price,
      cost_price,
      stock_quantity,
      reorder_level,
      category,
      description,
      supplier_id,
    } = req.body;

    // Validate input
    if (!name || price === undefined || stock_quantity === undefined) {
      console.log("❌ Missing required fields");
      return res
        .status(400)
        .json({ error: "Name, price, and stock quantity are required" });
    }

    // Validate supplier if provided
    if (supplier_id) {
      const db = await dbPromise;
      const supplier = await db.get("SELECT id FROM suppliers WHERE id = ?", [
        supplier_id,
      ]);
      if (!supplier) {
        return res.status(400).json({ error: "Invalid supplier ID" });
      }
    }

    console.log("✅ All required fields provided, creating product...");

    const db = await dbPromise;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    console.log("🔑 Generated ID:", id);
    console.log("💾 Inserting into database...");

    const result = await db.run(
      `INSERT INTO products (
        id, name, price, cost_price, stock_quantity, reorder_level, 
        category, description, supplier_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        price,
        cost_price || null,
        stock_quantity,
        reorder_level || 5,
        category?.trim() || null,
        description?.trim() || null,
        supplier_id || null,
        createdAt,
        createdAt,
      ]
    );

    console.log("✅ Insert result:", result);
    console.log("✅ Product created successfully with ID:", id);

    res.status(201).json({
      message: "Product added successfully",
      id,
      name: name.trim(),
      price,
      cost_price: cost_price || null,
      stock_quantity,
      reorder_level: reorder_level || 5,
      category: category?.trim() || null,
      description: description?.trim() || null,
      supplier_id: supplier_id || null,
    });
  } catch (err) {
    console.error("❌ Error adding product - Full error:", err);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ error: "Failed to add product: " + err.message });
  }
});

// PUT - Update product with supplier support
router.put("/:id", async (req, res) => {
  try {
    console.log("📥 PUT /api/products/:id - Updating product:", req.params.id);
    console.log("📥 Request body:", req.body);

    const { id } = req.params;
    const {
      name,
      price,
      cost_price,
      stock_quantity,
      reorder_level,
      category,
      description,
      supplier_id,
    } = req.body;

    if (!name || price === undefined || stock_quantity === undefined) {
      console.log("❌ Missing required fields for update");
      return res
        .status(400)
        .json({ error: "Name, price, and stock quantity are required" });
    }

    // Validate supplier if provided
    if (supplier_id) {
      const db = await dbPromise;
      const supplier = await db.get("SELECT id FROM suppliers WHERE id = ?", [
        supplier_id,
      ]);
      if (!supplier) {
        return res.status(400).json({ error: "Invalid supplier ID" });
      }
    }

    const db = await dbPromise;
    const updatedAt = new Date().toISOString();

    const result = await db.run(
      `UPDATE products 
       SET name = ?, price = ?, cost_price = ?, stock_quantity = ?, reorder_level = ?, 
           category = ?, description = ?, supplier_id = ?, updated_at = ? 
       WHERE id = ?`,
      [
        name.trim(),
        price,
        cost_price || null,
        stock_quantity,
        reorder_level || 5,
        category?.trim() || null,
        description?.trim() || null,
        supplier_id || null,
        updatedAt,
        id,
      ]
    );

    console.log("✅ Update result:", result);

    if (result.changes === 0) {
      console.log("❌ Product not found for update");
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Product updated successfully");
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: "Failed to update product: " + err.message });
  }
});

// DELETE - Remove product
router.delete("/:id", async (req, res) => {
  try {
    console.log(
      "📥 DELETE /api/products/:id - Deleting product:",
      req.params.id
    );

    const { id } = req.params;
    const db = await dbPromise;

    // Check if product is used in any transactions
    const transactionCount = await db.get(
      "SELECT COUNT(*) as count FROM transaction_items WHERE service_id = ?",
      [id]
    );

    if (transactionCount.count > 0) {
      return res.status(400).json({
        error: `Cannot delete product. It has been used in ${transactionCount.count} transactions.`,
      });
    }

    const result = await db.run("DELETE FROM products WHERE id = ?", [id]);

    console.log("✅ Delete result:", result);

    if (result.changes === 0) {
      console.log("❌ Product not found for deletion");
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("✅ Product deleted successfully");
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product: " + err.message });
  }
});

// PUT - Update stock quantity (for POS purchases and manual adjustments)
router.put("/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type = "sale" } = req.body; // type: 'sale', 'restock', 'adjustment'

    if (quantity === undefined) {
      return res.status(400).json({ error: "Quantity is required" });
    }

    const db = await dbPromise;
    const updatedAt = new Date().toISOString();

    // Get current stock
    const product = await db.get(
      "SELECT stock_quantity, name, reorder_level FROM products WHERE id = ?",
      [id]
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let newStock;

    switch (type) {
      case "sale":
        newStock = product.stock_quantity - quantity;
        if (newStock < 0) {
          return res.status(400).json({ error: "Insufficient stock" });
        }
        break;
      case "restock":
        newStock = product.stock_quantity + quantity;
        break;
      case "adjustment":
        newStock = quantity; // Set absolute quantity
        break;
      default:
        return res.status(400).json({ error: "Invalid stock update type" });
    }

    const result = await db.run(
      "UPDATE products SET stock_quantity = ?, updated_at = ? WHERE id = ?",
      [newStock, updatedAt, id]
    );

    // Check if product needs reordering
    const needsReorder = newStock <= (product.reorder_level || 5);

    console.log(
      `✅ Stock updated - Product: ${product.name}, Old: ${product.stock_quantity}, New: ${newStock}, Type: ${type}`
    );

    res.json({
      message: "Stock updated successfully",
      newStock,
      needsReorder,
      reorderLevel: product.reorder_level || 5,
    });
  } catch (err) {
    console.error("❌ Error updating stock:", err);
    res.status(500).json({ error: "Failed to update stock: " + err.message });
  }
});

// GET low stock products
router.get("/alerts/low-stock", async (req, res) => {
  try {
    console.log(
      "📥 GET /api/products/alerts/low-stock - Fetching low stock products"
    );
    const db = await dbPromise;

    const lowStockProducts = await db.all(`
      SELECT 
        p.*,
        s.name as supplier_name,
        s.contact_person as supplier_contact,
        s.phone as supplier_phone
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.stock_quantity <= p.reorder_level
      ORDER BY p.stock_quantity ASC, p.name ASC
    `);

    console.log("⚠️ Found low stock products:", lowStockProducts.length);
    res.json(lowStockProducts);
  } catch (err) {
    console.error("❌ Error fetching low stock products:", err);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

// GET products by supplier
router.get("/supplier/:supplierId", async (req, res) => {
  try {
    const { supplierId } = req.params;
    console.log(
      "📥 GET /api/products/supplier/:id - Fetching products for supplier:",
      supplierId
    );

    const db = await dbPromise;
    const products = await db.all(
      `
      SELECT 
        p.*,
        s.name as supplier_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.supplier_id = ?
      ORDER BY p.name ASC
    `,
      [supplierId]
    );

    console.log("✅ Found products for supplier:", products.length);
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products by supplier:", err);
    res.status(500).json({ error: "Failed to fetch products by supplier" });
  }
});

// GET inventory report
router.get("/reports/inventory", async (req, res) => {
  try {
    console.log(
      "📥 GET /api/products/reports/inventory - Generating inventory report"
    );
    const db = await dbPromise;

    const report = await db.get(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock_units,
        SUM(stock_quantity * price) as total_stock_value,
        SUM(stock_quantity * COALESCE(cost_price, 0)) as total_cost_value,
        COUNT(CASE WHEN stock_quantity <= reorder_level THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count,
        COUNT(DISTINCT supplier_id) as supplier_count
      FROM products
    `);

    // Get top categories
    const categories = await db.all(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*) as product_count,
        SUM(stock_quantity) as stock_units,
        SUM(stock_quantity * price) as stock_value
      FROM products
      GROUP BY category
      ORDER BY product_count DESC
      LIMIT 10
    `);

    res.json({
      summary: report,
      categories,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error generating inventory report:", err);
    res.status(500).json({ error: "Failed to generate inventory report" });
  }
});

export default router;
