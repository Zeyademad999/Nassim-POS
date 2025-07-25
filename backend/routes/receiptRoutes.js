import express from "express";
import dbPromise from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;

    // Get all transactions with proper customer and barber joins
    const transactions = await db.all(`
      SELECT 
        t.id,
        t.customer_id,
        COALESCE(c.name, t.customer_name, 'Walk-in') as customer_name,
        t.barber_id,
        COALESCE(b.name, t.barber_name, 'N/A') as barber_name,
        t.total,
        t.payment_method,
        t.discount_amount,
        t.tax,
        t.service_date,
        t.created_at
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN barbers b ON t.barber_id = b.id
      ORDER BY t.created_at DESC
    `);

    // For each transaction, fetch both services and products
    const receipts = await Promise.all(
      transactions.map(async (tx) => {
        // Get services for this transaction
        const services = await db.all(
          `
          SELECT 
            ti.service_id as id,
            COALESCE(s.name, ti.item_name, 'Unknown Service') as name,
            ti.price,
            ti.quantity
          FROM transaction_items ti
          LEFT JOIN services s ON ti.service_id = s.id
          WHERE ti.transaction_id = ? AND ti.item_type = 'service'
        `,
          [tx.id]
        );

        // Get products for this transaction - FIXED QUERY
        const products = await db.all(
          `
          SELECT 
            ti.product_id as id,
            COALESCE(p.name, ti.item_name, 'Unknown Product') as name,
            ti.price,
            ti.quantity
          FROM transaction_items ti
          LEFT JOIN products p ON ti.product_id = p.id
          WHERE ti.transaction_id = ? AND ti.item_type = 'product'
        `,
          [tx.id]
        );

        console.log(
          `Transaction ${tx.id}: ${services.length} services, ${products.length} products`
        );

        return {
          ...tx,
          services: services || [],
          products: products || [],
        };
      })
    );

    res.json(receipts);
  } catch (err) {
    console.error("❌ Failed to fetch receipts:", err.message);
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
});

export default router;
