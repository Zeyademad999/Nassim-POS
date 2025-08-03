import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all expense categories
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const categories = await db.all(
      "SELECT * FROM expense_categories ORDER BY name ASC"
    );
    res.json(categories);
  } catch (err) {
    console.error("❌ Failed to fetch expense categories:", err);
    res.status(500).json({ error: "Failed to fetch expense categories" });
  }
});

// POST create a new expense category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const db = await dbPromise;

    // Optional: Prevent duplicate names
    const existing = await db.get(
      "SELECT * FROM expense_categories WHERE name = ?",
      [name.trim()]
    );
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const id = crypto.randomUUID();
    await db.run("INSERT INTO expense_categories (id, name) VALUES (?, ?)", [
      id,
      name.trim(),
    ]);
    res.status(201).json({ id, name: name.trim() });
  } catch (err) {
    console.error("❌ Failed to create expense category:", err);
    res.status(500).json({ error: "Failed to create expense category" });
  }
});

// PUT update expense category name
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const db = await dbPromise;
    await db.run("UPDATE expense_categories SET name = ? WHERE id = ?", [
      name.trim(),
      id,
    ]);
    res.json({ id, name: name.trim() });
  } catch (err) {
    console.error("❌ Failed to update expense category:", err);
    res.status(500).json({ error: "Failed to update expense category" });
  }
});

// DELETE expense category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await db.run("DELETE FROM expense_categories WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete expense category:", err);
    res.status(500).json({ error: "Failed to delete expense category" });
  }
});

export default router;
