import express from "express";

import {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport
} from "../controllers/reportController.js";

import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Daily Report
router.get("/daily", authenticateToken, getDailyReport);

// Month-to-Date Report
router.get("/month-to-date", authenticateToken, getMonthToDateReport);

// Previous Month Report
router.get("/previous-month", authenticateToken, getPreviousMonthReport);

export default router;