export async function getDecisionTreeData() {
  try {
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv"); // replace with your CSV link
    const csv = await response.text();

    const rows = csv.split("\n").map(row => row.split(","));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = row[i]?.trim() || "";
      });
      return obj;
    });

    return data;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}
