import axios from "axios";

export async function fetchSheetData(type) {
  const urls = {
    decisiontree: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv",
    agents: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv",
  };

  try {
    const response = await axios.get(urls[type]);
    const rows = response.data.split("\n").map((row) => row.split(","));

    if (type === "agents") {
      return rows.flat().filter(Boolean); // returns array of agent names
    }

    // For decision tree, map CSV into objects
    const headers = ["NodeID", "Label", "Option", "NextNodeID", "OptionType"];
    return rows.map((r) => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = r[i] || "");
      return obj;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}
