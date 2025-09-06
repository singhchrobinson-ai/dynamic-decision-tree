export async function getDecisionTreeData() {
  try {
    const response = await fetch("YOUR_CSV_LINK"); // replace with your CSV link
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
