import express from "express";
import dbPromise from "../utils/db.js";

const router = express.Router();

// GET all customers with search and pagination
router.get("/", async (req, res) => {
  try {
    const {
      search = "",
      limit = 50,
      offset = 0,
      sortBy = "name",
      order = "ASC",
    } = req.query;
    const db = await dbPromise;

    let query = `
      SELECT 
        c.*,
        b.name as preferred_barber_name,
        b.specialty as preferred_barber_specialty
      FROM customers c
      LEFT JOIN barbers b ON c.preferred_barber_id = b.id
    `;

    const params = [];

    if (search) {
      query += ` WHERE c.name LIKE ? OR c.mobile LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Validate sortBy to prevent SQL injection
    const validSortFields = [
      "name",
      "mobile",
      "total_visits",
      "total_spent",
      "last_visit",
      "created_at",
    ];
    const validOrders = ["ASC", "DESC"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    const sortOrder = validOrders.includes(order.toUpperCase())
      ? order.toUpperCase()
      : "ASC";

    query += ` ORDER BY c.${sortField} ${sortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const customers = await db.all(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM customers c`;
    const countParams = [];

    if (search) {
      countQuery += ` WHERE c.name LIKE ? OR c.mobile LIKE ?`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const { total } = await db.get(countQuery, countParams);

    res.json({
      customers,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET single customer with full details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const customer = await db.get(
      `
      SELECT 
        c.*,
        b.name as preferred_barber_name,
        b.specialty as preferred_barber_specialty
      FROM customers c
      LEFT JOIN barbers b ON c.preferred_barber_id = b.id
      WHERE c.id = ?
    `,
      [id]
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get customer's booking history
    const bookings = await db.all(
      `
      SELECT 
        bk.*,
        b.name as barber_name,
        b.specialty as barber_specialty
      FROM bookings bk
      LEFT JOIN barbers b ON bk.barber_id = b.id
      WHERE bk.customer_id = ?
      ORDER BY bk.booking_date DESC, bk.booking_time DESC
      LIMIT 10
    `,
      [id]
    );

    // Get customer's transaction history
    const transactions = await db.all(
      `
      SELECT 
        t.*,
        b.name as barber_name
      FROM transactions t
      LEFT JOIN barbers b ON t.barber_id = b.id
      WHERE t.customer_id = ?
      ORDER BY t.created_at DESC
      LIMIT 10
    `,
      [id]
    );

    // Get customer's visit history
    const visits = await db.all(
      `
      SELECT 
        cv.*,
        b.name as barber_name
      FROM customer_visits cv
      LEFT JOIN barbers b ON cv.barber_id = b.id
      WHERE cv.customer_id = ?
      ORDER BY cv.visit_date DESC
      LIMIT 10
    `,
      [id]
    );

    res.json({
      ...customer,
      bookings,
      transactions,
      visits,
    });
  } catch (err) {
    console.error("Failed to fetch customer:", err);
    res.status(500).json({ error: "Failed to fetch customer details" });
  }
});

// POST create new customer
router.post("/", async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      preferred_barber_id,
      service_preferences,
      notes,
    } = req.body;

    // Validation
    if (!name || !mobile) {
      return res
        .status(400)
        .json({ error: "Name and mobile number are required" });
    }

    // Validate mobile format (basic validation)
    const mobileRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ error: "Invalid mobile number format" });
    }

    const db = await dbPromise;

    // Check if mobile already exists
    const existingCustomer = await db.get(
      `SELECT id FROM customers WHERE mobile = ?`,
      [mobile]
    );
    if (existingCustomer) {
      return res
        .status(400)
        .json({ error: "Customer with this mobile number already exists" });
    }

    const customerId = `cust_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.run(
      `
      INSERT INTO customers (
        id, name, mobile, email, preferred_barber_id, service_preferences, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        customerId,
        name.trim(),
        mobile.trim(),
        email?.trim() || null,
        preferred_barber_id || null,
        service_preferences?.trim() || null,
        notes?.trim() || null,
      ]
    );

    // Get the created customer with barber details
    const newCustomer = await db.get(
      `
      SELECT 
        c.*,
        b.name as preferred_barber_name,
        b.specialty as preferred_barber_specialty
      FROM customers c
      LEFT JOIN barbers b ON c.preferred_barber_id = b.id
      WHERE c.id = ?
    `,
      [customerId]
    );

    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("Failed to create customer:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// PUT update customer
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      preferred_barber_id,
      service_preferences,
      notes,
    } = req.body;

    // Validation
    if (!name || !mobile) {
      return res
        .status(400)
        .json({ error: "Name and mobile number are required" });
    }

    // Validate mobile format
    const mobileRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ error: "Invalid mobile number format" });
    }

    const db = await dbPromise;

    // Check if customer exists
    const existingCustomer = await db.get(
      `SELECT id FROM customers WHERE id = ?`,
      [id]
    );
    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if mobile already exists for another customer
    const duplicateMobile = await db.get(
      `SELECT id FROM customers WHERE mobile = ? AND id != ?`,
      [mobile, id]
    );
    if (duplicateMobile) {
      return res.status(400).json({
        error: "Another customer with this mobile number already exists",
      });
    }

    await db.run(
      `
      UPDATE customers 
      SET 
        name = ?,
        mobile = ?,
        email = ?,
        preferred_barber_id = ?,
        service_preferences = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name.trim(),
        mobile.trim(),
        email?.trim() || null,
        preferred_barber_id || null,
        service_preferences?.trim() || null,
        notes?.trim() || null,
        id,
      ]
    );

    // Get the updated customer with barber details
    const updatedCustomer = await db.get(
      `
      SELECT 
        c.*,
        b.name as preferred_barber_name,
        b.specialty as preferred_barber_specialty
      FROM customers c
      LEFT JOIN barbers b ON c.preferred_barber_id = b.id
      WHERE c.id = ?
    `,
      [id]
    );

    res.json(updatedCustomer);
  } catch (err) {
    console.error("Failed to update customer:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Check if customer exists
    const existingCustomer = await db.get(
      `SELECT id FROM customers WHERE id = ?`,
      [id]
    );
    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if customer has transactions
    const hasTransactions = await db.get(
      `SELECT COUNT(*) as count FROM transactions WHERE customer_id = ?`,
      [id]
    );
    if (hasTransactions.count > 0) {
      return res.status(400).json({
        error:
          "Cannot delete customer with existing transactions. Consider archiving instead.",
      });
    }

    // Start transaction for safe deletion
    await db.run("BEGIN TRANSACTION");

    try {
      // Delete related records
      await db.run(`DELETE FROM bookings WHERE customer_id = ?`, [id]);
      await db.run(`DELETE FROM customer_visits WHERE customer_id = ?`, [id]);
      await db.run(`DELETE FROM customers WHERE id = ?`, [id]);

      await db.run("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Failed to delete customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// POST update customer stats (visits and spending)
router.post("/:id/update-stats", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Calculate customer stats from transactions
    const stats = await db.get(
      `
      SELECT 
        COUNT(*) as total_visits,
        COALESCE(SUM(total), 0) as total_spent,
        MAX(created_at) as last_visit
      FROM transactions
      WHERE customer_id = ?
    `,
      [id]
    );

    await db.run(
      `
      UPDATE customers 
      SET 
        total_visits = ?,
        total_spent = ?,
        last_visit = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [stats.total_visits, stats.total_spent, stats.last_visit, id]
    );

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Failed to update customer stats:", err);
    res.status(500).json({ error: "Failed to update customer statistics" });
  }
});

// POST create customer from POS
router.post("/pos-register", async (req, res) => {
  try {
    const { name, mobile, email } = req.body;

    // Validation
    if (!name || !mobile) {
      return res
        .status(400)
        .json({ error: "Name and mobile number are required" });
    }

    const db = await dbPromise;

    // Check if customer already exists
    let existingCustomer = await db.get(
      `SELECT id, name, mobile, email FROM customers WHERE mobile = ?`,
      [mobile.trim()]
    );

    if (existingCustomer) {
      // Update existing customer if needed
      if (
        name.trim() !== existingCustomer.name ||
        (email && email !== existingCustomer.email)
      ) {
        await db.run(
          `UPDATE customers SET name = ?, email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE mobile = ?`,
          [name.trim(), email?.trim(), mobile.trim()]
        );
      }
      return res.json({
        success: true,
        customer: existingCustomer,
        isNew: false,
      });
    }

    // Create new customer
    const customerId = `cust_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.run(
      `INSERT INTO customers (
        id, name, mobile, email, total_visits, total_spent, created_at
      ) VALUES (?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`,
      [customerId, name.trim(), mobile.trim(), email?.trim() || null]
    );

    const newCustomer = await db.get(
      `SELECT id, name, mobile, email FROM customers WHERE id = ?`,
      [customerId]
    );

    res.json({ success: true, customer: newCustomer, isNew: true });
  } catch (err) {
    console.error("Failed to register POS customer:", err);
    res.status(500).json({ error: "Failed to register customer" });
  }
});

// GET customer statistics summary
router.get("/stats/summary", async (req, res) => {
  try {
    const db = await dbPromise;

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN total_visits > 0 THEN 1 END) as active_customers,
        COUNT(CASE WHEN total_visits = 0 THEN 1 END) as new_customers,
        AVG(total_spent) as avg_customer_spend,
        MAX(total_spent) as highest_spender,
        COUNT(CASE WHEN preferred_barber_id IS NOT NULL THEN 1 END) as customers_with_preferences
      FROM customers
    `);

    // Get top customers by spending
    const topCustomers = await db.all(`
      SELECT name, mobile, total_spent, total_visits
      FROM customers
      WHERE total_spent > 0
      ORDER BY total_spent DESC
      LIMIT 5
    `);

    // Get recent registrations
    const recentCustomers = await db.all(`
      SELECT name, mobile, created_at
      FROM customers
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      summary: stats,
      topCustomers,
      recentCustomers,
    });
  } catch (err) {
    console.error("Failed to fetch customer statistics:", err);
    res.status(500).json({ error: "Failed to fetch customer statistics" });
  }
});

export default router;
