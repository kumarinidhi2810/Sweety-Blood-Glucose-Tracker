
import { useEffect, useState } from "react";

import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

import {
  getAllReadings,
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} from "../services/dashboardService";

// Format glucose values
const formatGlucose = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${Number(value).toFixed(2)} mg/dL`;
};

// Summary Card Component
function SummaryCard({ title, value, description }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
      }}
    >
      <Typography color="text.secondary" fontWeight={500}>
        {title}
      </Typography>

      <Typography variant="h4" fontWeight={700} mt={2}>
        {value}
      </Typography>

      <Typography color="text.secondary" variant="body2" mt={1}>
        {description}
      </Typography>
    </Paper>
  );
}

function Dashboard() {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    todayReadings: 0,
    monthlyAverage: null,
    previousMonthAverage: null,
    totalReadings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get today's local date in YYYY-MM-DD format
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const today = `${year}-${month}-${day}`;

        // Fetch all dashboard APIs together
        const [
          allReadings,
          dailyReport,
          monthlyReport,
          previousMonthReport,
        ] = await Promise.all([
          getAllReadings(),
          getDailyReport(today),
          getMonthToDateReport(),
          getPreviousMonthReport(),
        ]);

        if (!isMounted) return;

        setDashboardData({
          todayReadings:
            dailyReport.summary?.total_readings ?? 0,

          monthlyAverage:
            monthlyReport.summary?.average_glucose ?? null,

          previousMonthAverage:
            previousMonthReport.summary?.average_glucose ?? null,

          totalReadings:
            allReadings.total ?? allReadings.readings?.length ?? 0,
        });
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        py: 4,
      }}
    >
      <Container maxWidth="xl">

        {/* Dashboard Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Welcome back, {user?.name || "User"}!
            Here's your glucose tracking overview.
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="250px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Today's Readings"
                value={dashboardData.todayReadings}
                description="Readings recorded today"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Monthly Average"
                value={formatGlucose(dashboardData.monthlyAverage)}
                description="Current month average"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Previous Month"
                value={formatGlucose(dashboardData.previousMonthAverage)}
                description="Previous month average"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Total Readings"
                value={dashboardData.totalReadings}
                description="All recorded readings"
              />
            </Grid>

          </Grid>
        )}

      </Container>
    </Box>
  );
}

export default Dashboard;
