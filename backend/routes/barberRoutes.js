import express from "express";
import dbPromise from "../utils/db.js";
import crypto from "crypto";

const router = express.Router();

// GET all barbers
// GET all barbers
router.get("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const barbers = await db.all(`
      SELECT id, name, mobile, specialty_ids, specialty
      FROM barbers 
      ORDER BY name ASC
    `);

    // For each barber, if they have specialty_ids, fetch the service names
    const barbersWithSpecialties = await Promise.all(
      barbers.map(async (barber) => {
        if (barber.specialty_ids && barber.specialty_ids.trim()) {
          // Split the comma-separated IDs and fetch service names
          const serviceIds = barber.specialty_ids
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);

          if (serviceIds.length > 0) {
            const placeholders = serviceIds.map(() => "?").join(",");
            const services = await db.all(
              `SELECT name FROM services WHERE id IN (${placeholders})`,
              serviceIds
            );
            barber.specialty_names = services.map((s) => s.name).join(", ");
          } else {
            barber.specialty_names = barber.specialty || "No specialties";
          }
        } else {
          // Fallback to old specialty field or default
          barber.specialty_names = barber.specialty || "No specialties";
        }
        return barber;
      })
    );

    res.json(barbersWithSpecialties);
  } catch (err) {
    console.error("❌ Error fetching barbers:", err);
    res.status(500).json({ error: "Failed to fetch barbers" });
  }
});

// PUT - Update barber profile
// PUT - Update barber profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, specialty_ids } = req.body; // Changed from 'specialty' to 'specialty_ids'

    if (!name || !mobile) {
      // Removed specialty check for now
      return res.status(400).json({ error: "Name and mobile are required" });
    }

    const db = await dbPromise;
    const result = await db.run(
      "UPDATE barbers SET name = ?, mobile = ?, specialty_ids = ? WHERE id = ?",
      [name, mobile, specialty_ids || "", id] // Handle empty specialty_ids
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

router.post("/", async (req, res) => {
  try {
    const { name, mobile, specialty_ids } = req.body;

    console.log("📝 Received barber data:", { name, mobile, specialty_ids }); // Add this line

    if (!name || !mobile) {
      return res.status(400).json({ error: "Name and mobile are required" });
    }

    const db = await dbPromise;
    await db.run(
      "INSERT INTO barbers (id, name, mobile, specialty_ids) VALUES (?, ?, ?, ?)",
      [crypto.randomUUID(), name, mobile, specialty_ids || ""]
    );

    console.log("✅ Added barber with specialty_ids:", specialty_ids); // Add this line

    res.status(201).json({ message: "Barber profile added" });
  } catch (err) {
    console.error("❌ Error adding barber:", err);
    res.status(500).json({ error: "Failed to add barber" });
  }
});

export default router;
