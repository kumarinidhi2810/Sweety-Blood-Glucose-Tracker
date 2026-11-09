import pool from "../config/db.js";

// ADD GLUCOSE READING
export const addGlucoseReading = async (req, res) => {
  try {
    const { glucose_value, reading_date, reading_time } = req.body;

    // Validate input
    if (
      glucose_value === undefined ||
      !reading_date ||
      !reading_time
    ) {
      return res.status(400).json({
        message: "Glucose value, date and time are required"
      });
    }

    // Validate glucose value
    const value = Number(glucose_value);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({
        message: "Glucose value must be a valid positive number"
      });
    }

    // Insert reading into database
    const result = await pool.query(
      `INSERT INTO glucose_readings
       (user_id, glucose_value, reading_date, reading_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        req.user.id,
        value,
        reading_date,
        reading_time
      ]
    );

    res.status(201).json({
      message: "Glucose reading added successfully",
      reading: result.rows[0]
    });

  } catch (error) {
    console.error("Add glucose reading error:", error.message);

    res.status(500).json({
      message: "Failed to add glucose reading"
    });
  }
};
// GET ALL GLUCOSE READINGS
export const getGlucoseReadings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, glucose_value,
              reading_date, reading_time, created_at
       FROM glucose_readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, reading_time DESC`,
      [req.user.id]
    );

    res.status(200).json({
      message: "Glucose readings fetched successfully",
      total: result.rows.length,
      readings: result.rows
    });

  } catch (error) {
    console.error("Fetch readings error:", error.message);

    res.status(500).json({
      message: "Failed to fetch glucose readings"
    });
  }
};
// UPDATE GLUCOSE READING
export const updateGlucoseReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { glucose_value, reading_date, reading_time } = req.body;

    // Validate input
    if (
      glucose_value === undefined ||
      !reading_date ||
      !reading_time
    ) {
      return res.status(400).json({
        message: "Glucose value, date and time are required"
      });
    }

    const value = Number(glucose_value);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({
        message: "Glucose value must be a valid positive number"
      });
    }

    const result = await pool.query(
      `UPDATE glucose_readings
       SET glucose_value = $1,
           reading_date = $2,
           reading_time = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [value, reading_date, reading_time, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Glucose reading not found"
      });
    }

    res.status(200).json({
      message: "Glucose reading updated successfully",
      reading: result.rows[0]
    });

  } catch (error) {
    console.error("Update reading error:", error.message);

    res.status(500).json({
      message: "Failed to update glucose reading"
    });
  }
};
// DELETE GLUCOSE READING
export const deleteGlucoseReading = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM glucose_readings
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Glucose reading not found"
      });
    }

    res.status(200).json({
      message: "Glucose reading deleted successfully"
    });

  } catch (error) {
    console.error("Delete reading error:", error.message);

    res.status(500).json({
      message: "Failed to delete glucose reading"
    });
  }
};