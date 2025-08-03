// backend/routes/settingsRoutes.js
import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all tax settings
router.get("/taxes", async (req, res) => {
  try {
    const db = await dbPromise;
    const taxes = await db.all(`
      SELECT * FROM tax_settings 
      ORDER BY created_at ASC
    `);

    res.json(taxes);
  } catch (err) {
    console.error("❌ Error fetching tax settings:", err);
    res.status(500).json({ error: "Failed to fetch tax settings" });
  }
});

// GET enabled tax settings (for POS calculations)
router.get("/taxes/enabled", async (req, res) => {
  try {
    const db = await dbPromise;
    const enabledTaxes = await db.all(`
      SELECT * FROM tax_settings 
      WHERE is_enabled = 1 
      ORDER BY created_at ASC
    `);

    // Calculate total tax rate
    const totalTaxRate = enabledTaxes.reduce(
      (sum, tax) => sum + tax.tax_rate,
      0
    );

    res.json({
      taxes: enabledTaxes,
      totalTaxRate,
      hasTaxes: enabledTaxes.length > 0,
    });
  } catch (err) {
    console.error("❌ Error fetching enabled taxes:", err);
    res.status(500).json({ error: "Failed to fetch enabled taxes" });
  }
});

// POST - Create new tax setting
router.post("/taxes", async (req, res) => {
  try {
    const { tax_name, tax_rate, description, is_enabled = true } = req.body;

    if (!tax_name || tax_rate === undefined) {
      return res.status(400).json({ error: "Tax name and rate are required" });
    }

    if (tax_rate < 0 || tax_rate > 100) {
      return res
        .status(400)
        .json({ error: "Tax rate must be between 0 and 100" });
    }

    const db = await dbPromise;
    const id = crypto.randomUUID();

    await db.run(
      `
      INSERT INTO tax_settings (id, tax_name, tax_rate, is_enabled, description, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        tax_name,
        tax_rate,
        is_enabled ? 1 : 0,
        description || "",
        new Date().toISOString(),
      ]
    );

    res.status(201).json({
      message: "Tax setting created successfully",
      id,
    });
  } catch (err) {
    console.error("❌ Error creating tax setting:", err);
    res.status(500).json({ error: "Failed to create tax setting" });
  }
});

// PUT - Update tax setting
router.put("/taxes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tax_name, tax_rate, description, is_enabled } = req.body;

    if (!tax_name || tax_rate === undefined) {
      return res.status(400).json({ error: "Tax name and rate are required" });
    }

    if (tax_rate < 0 || tax_rate > 100) {
      return res
        .status(400)
        .json({ error: "Tax rate must be between 0 and 100" });
    }

    const db = await dbPromise;
    const result = await db.run(
      `
      UPDATE tax_settings 
      SET tax_name = ?, tax_rate = ?, description = ?, is_enabled = ?, updated_at = ?
      WHERE id = ?
    `,
      [
        tax_name,
        tax_rate,
        description || "",
        is_enabled ? 1 : 0,
        new Date().toISOString(),
        id,
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Tax setting not found" });
    }

    res.json({ message: "Tax setting updated successfully" });
  } catch (err) {
    console.error("❌ Error updating tax setting:", err);
    res.status(500).json({ error: "Failed to update tax setting" });
  }
});

// DELETE - Remove tax setting
router.delete("/taxes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run("DELETE FROM tax_settings WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Tax setting not found" });
    }

    res.json({ message: "Tax setting deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting tax setting:", err);
    res.status(500).json({ error: "Failed to delete tax setting" });
  }
});

// GET all general settings
router.get("/general", async (req, res) => {
  try {
    const db = await dbPromise;
    const settings = await db.all(`
      SELECT * FROM general_settings 
      ORDER BY category, setting_key ASC
    `);

    // Group by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.json(groupedSettings);
  } catch (err) {
    console.error("❌ Error fetching general settings:", err);
    res.status(500).json({ error: "Failed to fetch general settings" });
  }
});

// PUT - Update general setting
router.put("/general/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;

    if (setting_value === undefined) {
      return res.status(400).json({ error: "Setting value is required" });
    }

    const db = await dbPromise;
    const result = await db.run(
      `
      UPDATE general_settings 
      SET setting_value = ?, updated_at = ?
      WHERE setting_key = ?
    `,
      [setting_value, new Date().toISOString(), key]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json({ message: "Setting updated successfully" });
  } catch (err) {
    console.error("❌ Error updating general setting:", err);
    res.status(500).json({ error: "Failed to update general setting" });
  }
});

// POST - Create new general setting
router.post("/general", async (req, res) => {
  try {
    const {
      setting_key,
      setting_value,
      setting_type = "text",
      description,
      category = "general",
    } = req.body;

    if (!setting_key || setting_value === undefined) {
      return res
        .status(400)
        .json({ error: "Setting key and value are required" });
    }

    const db = await dbPromise;
    const id = crypto.randomUUID();

    await db.run(
      `
      INSERT INTO general_settings (id, setting_key, setting_value, setting_type, description, category, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        setting_key,
        setting_value,
        setting_type,
        description || "",
        category,
        new Date().toISOString(),
      ]
    );

    res.status(201).json({
      message: "General setting created successfully",
      id,
    });
  } catch (err) {
    console.error("❌ Error creating general setting:", err);
    if (err.message.includes("UNIQUE constraint")) {
      res.status(400).json({ error: "Setting key already exists" });
    } else {
      res.status(500).json({ error: "Failed to create general setting" });
    }
  }
});

export default router;
