
import api from "./api";

// Get all glucose readings
export const getAllReadings = async () => {
  const response = await api.get("/glucose");
  return response.data;
};

// Get today's glucose report
export const getDailyReport = async (date) => {
  const response = await api.get(`/reports/daily?date=${date}`);
  return response.data;
};

// Get current month report
export const getMonthToDateReport = async () => {
  const response = await api.get("/reports/month-to-date");
  return response.data;
};

// Get previous month report
export const getPreviousMonthReport = async () => {
  const response = await api.get("/reports/previous-month");
  return response.data;
};
