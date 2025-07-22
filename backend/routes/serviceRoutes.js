import express from "express";
import {
  getAllServices,
  addService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

// GET /api/services - fetch all services
router.get("/", getAllServices);

// POST /api/services - add a new service
router.post("/", addService);

// PUT /api/services/:id - update a service by ID
router.put("/:id", updateService);

// DELETE /api/services/:id - delete a service by ID
router.delete("/:id", deleteService);

export default router;
