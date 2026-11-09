import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authenticateToken from "./middleware/authMiddleware.js";
import glucoseRoutes from "./routes/glucoseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/glucose", glucoseRoutes);
app.use("/api/reports", reportRoutes);
// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Sweety Blood Glucose Tracker API is running!",
  });
});
app.get("/api/protected", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "You are authenticated successfully!",
    user: req.user
  });
});
// Test database connection
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      message: "Database connected successfully!",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});