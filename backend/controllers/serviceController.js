import dbPromise from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";

// GET /api/services
export const getAllServices = async (req, res) => {
  const db = await dbPromise;
  try {
    const services = await db.all("SELECT * FROM services ORDER BY name ASC");
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

// POST /api/services
export const addService = async (req, res) => {
  const { name, price, icon } = req.body;
  const db = await dbPromise;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  try {
    const id = uuidv4();
    await db.run(
      "INSERT INTO services (id, name, price, icon) VALUES (?, ?, ?, ?)",
      [id, name, price, icon || ""]
    );
    res.status(201).json({ id, name, price, icon });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ message: "Failed to add service" });
  }
};

// PUT /api/services/:id
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, price, icon } = req.body;
  const db = await dbPromise;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  try {
    await db.run(
      "UPDATE services SET name = ?, price = ?, icon = ? WHERE id = ?",
      [name, price, icon || "", id]
    );
    res.json({ message: "Service updated" });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Failed to update service" });
  }
};

// DELETE /api/services/:id
export const deleteService = async (req, res) => {
  const { id } = req.params;
  const db = await dbPromise;

  try {
    await db.run("DELETE FROM services WHERE id = ?", [id]);
    res.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
};
