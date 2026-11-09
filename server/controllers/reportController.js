import pool from "../config/db.js";

// Reusable function to generate report
const generateReport = async (userId, dateCondition, params = []) => {

  const queryParams = [userId, ...params];

  // Get summary
  const summary = await pool.query(
    `SELECT
       COUNT(*)::int AS total_readings,
       ROUND(AVG(glucose_value), 2) AS average_glucose,
       MIN(glucose_value) AS min_glucose,
       MAX(glucose_value) AS max_glucose
     FROM glucose_readings
     WHERE user_id = $1 AND ${dateCondition}`,
    queryParams
  );

  // Get all readings
  const readings = await pool.query(
    `SELECT id, glucose_value, reading_date,
            reading_time, created_at
     FROM glucose_readings
     WHERE user_id = $1 AND ${dateCondition}
     ORDER BY reading_date DESC, reading_time DESC`,
    queryParams
  );

  return {
    summary: summary.rows[0],
    readings: readings.rows
  };
};


// 1. DAILY REPORT
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Please provide date in YYYY-MM-DD format"
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Invalid date"
      });
    }

    const report = await generateReport(
      req.user.id,
      "reading_date = $2::date",
      [date]
    );

    res.status(200).json({
      message: "Daily report generated successfully",
      date,
      ...report
    });

  } catch (error) {
    console.error("Daily report error:", error.message);

    res.status(500).json({
      message: "Failed to generate daily report"
    });
  }
};


// 2. MONTH-TO-DATE REPORT
export const getMonthToDateReport = async (req, res) => {
  try {
    const report = await generateReport(
      req.user.id,
      `reading_date >= DATE_TRUNC('month', CURRENT_DATE)::date
       AND reading_date <= CURRENT_DATE`
    );

    res.status(200).json({
      message: "Month-to-date report generated successfully",
      period: "Current month",
      ...report
    });

  } catch (error) {
    console.error("MTD report error:", error.message);

    res.status(500).json({
      message: "Failed to generate month-to-date report"
    });
  }
};


// 3. PREVIOUS MONTH REPORT
export const getPreviousMonthReport = async (req, res) => {
  try {
    const report = await generateReport(
      req.user.id,
      `reading_date >=
       (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::date
       AND reading_date < DATE_TRUNC('month', CURRENT_DATE)::date`
    );

    res.status(200).json({
      message: "Previous month report generated successfully",
      period: "Previous month",
      ...report
    });

  } catch (error) {
    console.error("Previous month report error:", error.message);

    res.status(500).json({
      message: "Failed to generate previous month report"
    });
  }
};