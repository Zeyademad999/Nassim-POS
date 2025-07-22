import express from "express";
import dbPromise from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;

    const transactions = await db.all(`
      SELECT 
        t.id as id,
        t.customer_name,
        t.barber_name,
        t.total,
        t.created_at,
        GROUP_CONCAT(
          json_object(
            'name', s.name,
            'quantity', ti.quantity
          )
        ) AS services_json
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN services s ON ti.service_id = s.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    const parsed = transactions.map((tx) => {
      let services = [];

      try {
        if (tx.services_json) {
          const cleanJson = `[${tx.services_json}]`;
          services = JSON.parse(cleanJson);
        }
      } catch (e) {
        console.error("❌ Failed to parse services JSON:", e.message);
      }

      return {
        ...tx,
        services,
      };
    });

    res.json(parsed);
  } catch (err) {
    console.error("❌ Failed to fetch receipts:", err.message);
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
});

export default router;
