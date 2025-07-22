import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all barbers
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const barbers = await db.all("SELECT * FROM barbers ORDER BY name ASC");
    res.json(barbers);
  } catch (err) {
    console.error("❌ Error fetching barbers:", err);
    res.status(500).json({ error: "Failed to fetch barbers" });
  }
});

// POST - Add a new barber profile
router.post("/", async (req, res) => {
  try {
    const { name, mobile, specialty } = req.body;

    if (!name || !mobile || !specialty) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = await dbPromise;
    await db.run(
      "INSERT INTO barbers (id, name, mobile, specialty) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), name, mobile, specialty]
    );

    res.status(201).json({ message: "Barber profile added" });
  } catch (err) {
    console.error("❌ Error adding barber:", err);
    res.status(500).json({ error: "Failed to add barber" });
  }
});

// PUT - Update barber profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, specialty } = req.body;

    if (!name || !mobile || !specialty) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = await dbPromise;
    const result = await db.run(
      "UPDATE barbers SET name = ?, mobile = ?, specialty = ? WHERE id = ?",
      [name, mobile, specialty, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Barber not found" });
    }

    res.json({ message: "Barber profile updated successfully" });
  } catch (err) {
    console.error("❌ Error updating barber:", err);
    res.status(500).json({ error: "Failed to update barber" });
  }
});

// DELETE - Remove barber profile
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const result = await db.run("DELETE FROM barbers WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Barber not found" });
    }

    res.json({ message: "Barber profile deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting barber:", err);
    res.status(500).json({ error: "Failed to delete barber" });
  }
});

export default router;
