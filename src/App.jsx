import React, { useEffect, useState } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";

function App() {
  const [nodes, setNodes] = useState([]); // Will hold rows from Google Sheet

  useEffect(() => {
    async function loadData() {
      const sheetRows = await fetchSheetData();
      setNodes(sheetRows);
    }

    loadData();
  }, []);

  return (
    <div>
      <h1>Dynamic Decision Tree</h1>
      {nodes.length === 0 ? (
        <p>Loading...</p>
      ) : (
        nodes.map((row, index) => (
          <div key={index} style={{ marginBottom: "10px", border: "1px solid #ccc", padding: "8px" }}>
            <strong>{row[1]}</strong>
            {row[2] && <p>Option: {row[2]}</p>}
            {row[3] && <p>Next Node: {row[3]}</p>}
          </div>
        ))
      )}
    </div>
  );
}
