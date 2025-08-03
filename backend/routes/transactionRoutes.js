import express from "express";
import dbPromise from "../utils/db.js";

const router = express.Router();

const getCurrentTaxRate = async (db) => {
  try {
    const enabledTaxes = await db.all(`
      SELECT * FROM tax_settings 
      WHERE is_enabled = 1 
      ORDER BY created_at ASC
    `);

    return enabledTaxes.reduce((sum, tax) => sum + tax.tax_rate, 0);
  } catch (err) {
    console.error("Error fetching tax rate:", err);
    return 8.0; // fallback to default 8%
  }
};
// GET all transactions with filtering and items
// GET all transactions with filtering and items
router.get("/", async (req, res) => {
  try {
    const {
      period = "30days",
      startDate,
      endDate,
      limit = 100,
      customer_id, // Add this parameter
    } = req.query;
    const db = await dbPromise;

    let dateCondition = "";
    let params = [];

    // Handle customer filtering
    if (customer_id) {
      dateCondition = `WHERE t.customer_id = ?`;
      params = [customer_id];
    } else if (period === "custom" && startDate && endDate) {
      dateCondition = `WHERE DATE(t.created_at) BETWEEN ? AND ?`;
      params = [startDate, endDate];
    } else {
      const days = { today: 0, "7days": 7, "30days": 30, "3months": 90 };
      const daysBack = days[period] || 30;
      if (period === "today") {
        dateCondition = `WHERE DATE(t.created_at) = DATE('now')`;
      } else {
        dateCondition = `WHERE DATE(t.created_at) >= DATE('now', '-${daysBack} day')`;
      }
    }

    // First get all transactions
    const transactions = await db.all(
      `
      SELECT 
        t.*,
        b.name as barber_full_name,
        b.specialty as barber_specialty
      FROM transactions t
      LEFT JOIN barbers b ON t.barber_id = b.id
      ${dateCondition}
      ORDER BY t.created_at DESC
      LIMIT ?
    `,
      [...params, parseInt(limit)]
    );

    // Then get items for each transaction
    const transactionsWithItems = await Promise.all(
      transactions.map(async (transaction) => {
        const items = await db.all(
          `
          SELECT 
            ti.*,
            COALESCE(s.name, p.name, ti.item_name) as item_name,
            ti.item_type
          FROM transaction_items ti
          LEFT JOIN services s ON ti.service_id = s.id AND ti.item_type = 'service'
          LEFT JOIN products p ON ti.product_id = p.id AND ti.item_type = 'product'
          WHERE ti.transaction_id = ?
        `,
          [transaction.id]
        );

        // Format items as services and products for receipt compatibility
        const services = items
          .filter((item) => item.item_type === "service")
          .map((item) => ({
            id: item.service_id,
            name: item.item_name,
            price: item.price,
            quantity: item.quantity,
          }));

        const products = items
          .filter((item) => item.item_type === "product")
          .map((item) => ({
            id: item.product_id,
            name: item.item_name,
            price: item.price,
            quantity: item.quantity,
          }));

        return {
          ...transaction,
          items: items || [],
          services,
          products,
        };
      })
    );

    res.json(transactionsWithItems);
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET single transaction with items - FIXED
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const transaction = await db.get(
      `
      SELECT 
        t.*,
        b.name as barber_full_name,
        b.specialty as barber_specialty
      FROM transactions t
      LEFT JOIN barbers b ON t.barber_id = b.id
      WHERE t.id = ?
    `,
      [id]
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Get transaction items - FIXED QUERY
    const items = await db.all(
      `
      SELECT 
        ti.*,
        COALESCE(s.name, p.name, ti.item_name) as item_name,
        ti.item_type
      FROM transaction_items ti
      LEFT JOIN services s ON ti.service_id = s.id AND ti.item_type = 'service'
      LEFT JOIN products p ON ti.product_id = p.id AND ti.item_type = 'product'
      WHERE ti.transaction_id = ?
    `,
      [id]
    );

    res.json({ ...transaction, items });
  } catch (err) {
    console.error("Failed to fetch transaction:", err);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// POST create new transaction
// POST create new transaction with auto customer registration
router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      customer_mobile,
      customer_email,
      barber_name,
      barber_id,
      service_date,
      subtotal,
      discount_amount = 0,
      tax,
      total,
      payment_method = "cash",
      send_invoice = false,
      items = [],
    } = req.body;

    const db = await dbPromise;
    const transactionId = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Start transaction
    await db.run("BEGIN TRANSACTION");

    try {
      let customer_id = null;

      // Auto-register customer if mobile provided
      if (customer_mobile && customer_mobile.trim()) {
        // Check if customer exists
        let customer = await db.get(
          `SELECT id FROM customers WHERE mobile = ?`,
          [customer_mobile.trim()]
        );

        if (!customer && customer_name && customer_name.trim()) {
          // Create new customer
          customer_id = `cust_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;

          await db.run(
            `INSERT INTO customers (
              id, name, mobile, email, total_visits, total_spent, created_at
            ) VALUES (?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`,
            [
              customer_id,
              customer_name.trim(),
              customer_mobile.trim(),
              customer_email?.trim() || null,
            ]
          );
        } else if (customer) {
          customer_id = customer.id;
        }
      }

      // Insert main transaction
      await db.run(
        `INSERT INTO transactions (
          id, customer_id, customer_name, barber_name, barber_id, service_date,
          subtotal, discount_amount, tax, total, payment_method, send_invoice, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          transactionId,
          customer_id,
          customer_name,
          barber_name,
          barber_id,
          service_date,
          subtotal,
          discount_amount,
          tax,
          total,
          payment_method,
          send_invoice ? 1 : 0,
        ]
      );

      // Insert transaction items if provided
      for (const item of items) {
        const itemId = `ti_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        await db.run(
          `INSERT INTO transaction_items (
            id, transaction_id, item_type, service_id, product_id, item_name, price, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            transactionId,
            item.type,
            item.type === "service" ? item.id : null,
            item.type === "product" ? item.id : null,
            item.name,
            item.price,
            item.quantity,
          ]
        );

        // Update product stock if it's a product
        if (item.type === "product") {
          await db.run(
            `UPDATE products 
            SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [item.quantity, item.id]
          );
        }
      }

      // Update customer stats if customer was created/found
      if (customer_id) {
        await db.run(
          `UPDATE customers 
          SET 
            total_visits = total_visits + 1,
            total_spent = total_spent + ?,
            last_visit = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [total, customer_id]
        );
      }

      await db.run("COMMIT");
      res.json({
        success: true,
        id: transactionId,
        customer_created: !!customer_id,
      });
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Failed to create transaction:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// PUT update transaction
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      barber_name,
      barber_id,
      service_date,
      subtotal,
      discount_amount,
      tax,
      total,
      payment_method,
      send_invoice,
    } = req.body;

    const db = await dbPromise;

    // Check if transaction exists
    const existingTransaction = await db.get(
      `SELECT id FROM transactions WHERE id = ?`,
      [id]
    );
    if (!existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Update transaction
    await db.run(
      `
      UPDATE transactions 
      SET 
        customer_name = ?, 
        barber_name = ?, 
        barber_id = ?,
        service_date = ?, 
        subtotal = ?,
        discount_amount = ?,
        tax = ?,
        total = ?, 
        payment_method = ?, 
        send_invoice = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        customer_name,
        barber_name,
        barber_id,
        service_date,
        subtotal,
        discount_amount,
        tax,
        total,
        payment_method,
        send_invoice ? 1 : 0,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update transaction:", err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE transaction - FIXED
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Check if transaction exists
    const existingTransaction = await db.get(
      `SELECT id FROM transactions WHERE id = ?`,
      [id]
    );
    if (!existingTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Start transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Get transaction items to restore product stock - FIXED QUERY
      const items = await db.all(
        `
        SELECT ti.*, ti.product_id, ti.quantity
        FROM transaction_items ti
        WHERE ti.transaction_id = ? AND ti.item_type = 'product'
      `,
        [id]
      );

      // Restore product stock
      for (const item of items) {
        if (item.product_id) {
          await db.run(
            `
            UPDATE products 
            SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
            [item.quantity, item.product_id]
          );
        }
      }

      // Delete transaction items
      await db.run(`DELETE FROM transaction_items WHERE transaction_id = ?`, [
        id,
      ]);

      // Delete receipts
      await db.run(`DELETE FROM receipts WHERE transaction_id = ?`, [id]);

      // Delete transaction
      await db.run(`DELETE FROM transactions WHERE id = ?`, [id]);

      await db.run("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Failed to delete transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// GET transaction statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    const db = await dbPromise;

    const days = { "7days": 7, "30days": 30, "3months": 90 };
    const daysBack = days[period] || 30;

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(total) as total_revenue,
        AVG(total) as avg_transaction_value,
        MIN(total) as min_transaction,
        MAX(total) as max_transaction,
        COUNT(DISTINCT customer_name) as unique_customers,
        COUNT(DISTINCT barber_name) as active_barbers
      FROM transactions
      WHERE DATE(created_at) >= DATE('now', '-${daysBack} day')
    `);

    const paymentMethods = await db.all(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as amount
      FROM transactions
      WHERE DATE(created_at) >= DATE('now', '-${daysBack} day')
      GROUP BY payment_method
    `);

    res.json({ stats, paymentMethods });
  } catch (err) {
    console.error("Failed to fetch transaction stats:", err);
    res.status(500).json({ error: "Failed to fetch transaction statistics" });
  }
});

// POST duplicate transaction
router.post("/:id/duplicate", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Get original transaction
    const originalTransaction = await db.get(
      `
      SELECT * FROM transactions WHERE id = ?
    `,
      [id]
    );

    if (!originalTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Get original items
    const originalItems = await db.all(
      `
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `,
      [id]
    );

    const newTransactionId = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Start transaction
    await db.run("BEGIN TRANSACTION");

    try {
      // Create new transaction
      await db.run(
        `
        INSERT INTO transactions (
          id, customer_name, barber_name, barber_id, service_date,
          subtotal, discount_amount, tax, total, payment_method, send_invoice, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
        [
          newTransactionId,
          originalTransaction.customer_name,
          originalTransaction.barber_name,
          originalTransaction.barber_id,
          originalTransaction.service_date,
          originalTransaction.subtotal,
          originalTransaction.discount_amount,
          originalTransaction.tax,
          originalTransaction.total,
          originalTransaction.payment_method,
          originalTransaction.send_invoice,
        ]
      );

      // Duplicate items
      for (const item of originalItems) {
        const newItemId = `ti_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        await db.run(
          `
          INSERT INTO transaction_items (
            id, transaction_id, item_type, service_id, product_id, item_name, price, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            newItemId,
            newTransactionId,
            item.item_type,
            item.service_id,
            item.product_id,
            item.item_name,
            item.price,
            item.quantity,
          ]
        );

        // Update product stock if it's a product
        if (item.product_id) {
          await db.run(
            `
            UPDATE products 
            SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
            [item.quantity, item.product_id]
          );
        }
      }

      await db.run("COMMIT");
      res.json({ success: true, id: newTransactionId });
    } catch (err) {
      await db.run("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Failed to duplicate transaction:", err);
    res.status(500).json({ error: "Failed to duplicate transaction" });
  }
});

export default router;
