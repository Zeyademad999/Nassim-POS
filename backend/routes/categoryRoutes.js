import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const categories = await db.all(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    res.json(categories);
  } catch (err) {
    console.error("❌ Failed to fetch categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST create a new category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const db = await dbPromise;

    // Optional: Prevent duplicate names
    const existing = await db.get("SELECT * FROM categories WHERE name = ?", [
      name.trim(),
    ]);
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const id = crypto.randomUUID();
    await db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [
      id,
      name.trim(),
    ]);
    res.status(201).json({ id, name: name.trim() });
  } catch (err) {
    console.error("❌ Failed to create category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT update category name
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const db = await dbPromise;
    await db.run("UPDATE categories SET name = ? WHERE id = ?", [
      name.trim(),
      id,
    ]);
    res.json({ id, name: name.trim() });
  } catch (err) {
    console.error("❌ Failed to update category:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    await db.run("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
