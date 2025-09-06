import axios from "axios";

// Generic CSV fetcher
export async function fetchCSVData(csvUrl) {
  try {
    const response = await axios.get(csvUrl);
    // Convert CSV to array of rows
    const rows = response.data.split("\n").map(row => row.split(","));
    return rows;
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    return [];
  }
}
