import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all suppliers
router.get("/", async (req, res) => {
  try {
    console.log("📥 GET /api/suppliers - Fetching all suppliers");
    const db = await dbPromise;
    const suppliers = await db.all(`
      SELECT 
        s.*,
        COUNT(p.id) as product_count
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    console.log("✅ Found suppliers:", suppliers.length);
    res.json(suppliers);
  } catch (err) {
    console.error("❌ Error fetching suppliers:", err);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// GET single supplier with products
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 GET /api/suppliers/:id - Fetching supplier:", id);

    const db = await dbPromise;

    // Get supplier details
    const supplier = await db.get("SELECT * FROM suppliers WHERE id = ?", [id]);

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Get products from this supplier
    const products = await db.all(
      `
      SELECT id, name, price, cost_price, stock_quantity, category
      FROM products 
      WHERE supplier_id = ?
      ORDER BY name ASC
    `,
      [id]
    );

    res.json({
      ...supplier,
      products,
      product_count: products.length,
    });
  } catch (err) {
    console.error("❌ Error fetching supplier:", err);
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
});

// POST - Add a new supplier
router.post("/", async (req, res) => {
  try {
    console.log("📥 POST /api/suppliers - Request body:", req.body);

    const { name, contact_person, phone, email, address, notes } = req.body;

    // Validate input
    if (!name || !name.trim()) {
      console.log("❌ Missing required field: name");
      return res.status(400).json({ error: "Supplier name is required" });
    }

    console.log("✅ Required fields provided, creating supplier...");

    const db = await dbPromise;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    console.log("🔑 Generated ID:", id);
    console.log("💾 Inserting into database...");

    const result = await db.run(
      `INSERT INTO suppliers (id, name, contact_person, phone, email, address, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        contact_person?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        address?.trim() || null,
        notes?.trim() || null,
        createdAt,
        createdAt,
      ]
    );

    console.log("✅ Insert result:", result);
    console.log("✅ Supplier created successfully with ID:", id);

    res.status(201).json({
      message: "Supplier added successfully",
      id,
      name: name.trim(),
      contact_person: contact_person?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    });
  } catch (err) {
    console.error("❌ Error adding supplier - Full error:", err);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ error: "Failed to add supplier: " + err.message });
  }
});

// PUT - Update supplier
router.put("/:id", async (req, res) => {
  try {
    console.log(
      "📥 PUT /api/suppliers/:id - Updating supplier:",
      req.params.id
    );
    console.log("📥 Request body:", req.body);

    const { id } = req.params;
    const { name, contact_person, phone, email, address, notes } = req.body;

    if (!name || !name.trim()) {
      console.log("❌ Missing required field: name");
      return res.status(400).json({ error: "Supplier name is required" });
    }

    const db = await dbPromise;
    const updatedAt = new Date().toISOString();

    const result = await db.run(
      `UPDATE suppliers 
       SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = ? 
       WHERE id = ?`,
      [
        name.trim(),
        contact_person?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        address?.trim() || null,
        notes?.trim() || null,
        updatedAt,
        id,
      ]
    );

    console.log("✅ Update result:", result);

    if (result.changes === 0) {
      console.log("❌ Supplier not found for update");
      return res.status(404).json({ error: "Supplier not found" });
    }

    console.log("✅ Supplier updated successfully");
    res.json({ message: "Supplier updated successfully" });
  } catch (err) {
    console.error("❌ Error updating supplier:", err);
    res
      .status(500)
      .json({ error: "Failed to update supplier: " + err.message });
  }
});

// DELETE - Remove supplier
router.delete("/:id", async (req, res) => {
  try {
    console.log(
      "📥 DELETE /api/suppliers/:id - Deleting supplier:",
      req.params.id
    );

    const { id } = req.params;
    const db = await dbPromise;

    // Check if supplier has associated products
    const productCount = await db.get(
      "SELECT COUNT(*) as count FROM products WHERE supplier_id = ?",
      [id]
    );

    if (productCount.count > 0) {
      return res.status(400).json({
        error: `Cannot delete supplier. ${productCount.count} products are associated with this supplier.`,
      });
    }

    const result = await db.run("DELETE FROM suppliers WHERE id = ?", [id]);

    console.log("✅ Delete result:", result);

    if (result.changes === 0) {
      console.log("❌ Supplier not found for deletion");
      return res.status(404).json({ error: "Supplier not found" });
    }

    console.log("✅ Supplier deleted successfully");
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting supplier:", err);
    res
      .status(500)
      .json({ error: "Failed to delete supplier: " + err.message });
  }
});

// GET supplier performance/stats
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Get supplier statistics
    const stats = await db.get(
      `
      SELECT 
        COUNT(p.id) as total_products,
        SUM(p.stock_quantity) as total_stock_value,
        AVG(p.price - COALESCE(p.cost_price, 0)) as avg_margin,
        COUNT(CASE WHEN p.stock_quantity <= p.reorder_level THEN 1 END) as low_stock_products
      FROM products p
      WHERE p.supplier_id = ?
    `,
      [id]
    );

    res.json(
      stats || {
        total_products: 0,
        total_stock_value: 0,
        avg_margin: 0,
        low_stock_products: 0,
      }
    );
  } catch (err) {
    console.error("❌ Error fetching supplier stats:", err);
    res.status(500).json({ error: "Failed to fetch supplier statistics" });
  }
});

export default router;
