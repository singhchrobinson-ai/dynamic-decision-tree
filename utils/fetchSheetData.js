import axios from "axios";

const SHEET_URL = "YOUR_CSV_LINK"; // Replace with your sheet's CSV link

export async function getDecisionTreeData() {
  try {
    const response = await axios.get(SHEET_URL);
    const csv = response.data;

    // Convert CSV → JSON
    const rows = csv.split("\n").map((row) => row.split(","));
    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = row[i] ? row[i].trim() : "";
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}
