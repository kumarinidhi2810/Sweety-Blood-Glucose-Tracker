import api from "./api";

// Add new glucose reading
export const addGlucoseReading = async (readingData) => {
  const response = await api.post(
    "/glucose/add",
    readingData
  );

  return response.data;
};