import React, { useEffect, useState } from "react";
import { getDecisionTreeData } from "./utils/fetchSheetDataNew.js";

export default function App() {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDecisionTreeData();
        setTreeData(data);
      } catch (err) {
        setError("Failed to load Google Sheet data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p style={{ padding: "1rem" }}>⏳ Loading data...</p>;
  if (error) return <p style={{ padding: "1rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ color: "blue", fontSize: "1.5rem" }}>🚀 Dynamic Decision Tree</h1>
      <pre style={{ background: "#eee", padding: "1rem", borderRadius: "6px" }}>
        {JSON.stringify(treeData, null, 2)}
      </pre>
    </div>
  );
}
