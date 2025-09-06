import axios from "axios";

export async function fetchSheetData(url) {
  try {
    const res = await axios.get(url);
    const rows = res.data
      .split("\n")
      .map((row) => row.split(",")) // CSV parsing
      .filter((r) => r.length > 0);
    return rows;
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}
