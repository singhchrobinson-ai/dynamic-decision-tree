import axios from "axios";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv"; // Replace with your sheet's CSV link

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
