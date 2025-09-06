import axios from "axios";

export async function fetchSheetData() {
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv"; // Replace with your CSV link
  try {
    const response = await axios.get(CSV_URL);
    const rows = response.data.split("\n").map((row) => row.split(","));
    return rows;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}
