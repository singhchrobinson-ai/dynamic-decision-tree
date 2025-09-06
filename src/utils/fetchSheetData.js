import axios from "axios";

export async function fetchSheetData(sheetUrl) {
  try {
    const response = await axios.get(sheetUrl);
    const rows = response.data.split("\n").map((row) => row.split(","));
    const headers = rows[0].map((h) => h.trim());

    return rows.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i]?.trim();
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}
