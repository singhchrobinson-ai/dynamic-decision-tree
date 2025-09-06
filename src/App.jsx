// src/App.jsx
import { useEffect, useState } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";

function App() {
  const [nodes, setNodes] = useState([]); // Will hold rows from Google Sheet

  // Load CSV data from Google Sheet on component mount
  useEffect(() => {
    async function loadData() {
      const sheetRows = await fetchSheetData();
      setNodes(sheetRows);
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dynamic Decision Tree</h1>

      {nodes.length === 0 ? (
        <p>Loading...</p>
      ) : (
        nodes.map((row, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <strong>Node Label:</strong> {row[1]} <br />
            {row[2] && (
              <>
                <strong>Option:</strong> {row[2]} <br />
              </>
            )}
            {row[3] && (
              <>
                <strong>Next Node ID:</strong> {row[3]}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default App;
