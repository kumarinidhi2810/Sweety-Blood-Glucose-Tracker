import express from "express";
import {
  addGlucoseReading,
  getGlucoseReadings,
  updateGlucoseReading,
  deleteGlucoseReading
} from "../controllers/glucoseController.js";

import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.post(
  "/add",
  authenticateToken,
  addGlucoseReading
);
router.get(
  "/",
  authenticateToken,
  getGlucoseReadings
);
router.put(
  "/:id",
  authenticateToken,
  updateGlucoseReading
);
router.delete(
  "/:id",
  authenticateToken,
  deleteGlucoseReading
);

export default router;