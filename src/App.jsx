import React, { useState, useEffect } from "react";
import axios from "axios";

// CSV URLs for nodes and agents
const NODES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv";
const AGENTS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv";

// Utility to fetch CSV and parse
async function fetchCSVData(url) {
  try {
    const response = await axios.get(url);
    const rows = response.data
      .trim()
      .split("\n")
      .map((row) => row.split(","));
    const headers = rows[0];
    return rows.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return [];
  }
}

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [agent, setAgent] = useState(null);
  const [currentNodeID, setCurrentNodeID] = useState("1");
  const [message, setMessage] = useState("");

  // Fetch agents and nodes from Google Sheets CSV
  useEffect(() => {
    fetchCSVData(AGENTS_CSV_URL).then(setAgents);
    fetchCSVData(NODES_CSV_URL).then(setNodes);
  }, []);

  // Get all options for the current node
  const currentOptions = nodes.filter((n) => n.NodeID === currentNodeID);

  // Handle option selection
  const handleOptionClick = (option) => {
    if (option.OptionType === "MESSAGE") {
      setMessage(option.Option);
      setCurrentNodeID(option.NextNodeID || "1"); // go to RESTART node if defined
    } else if (option.OptionType === "OPTION") {
      setCurrentNodeID(option.NextNodeID);
      setMessage("");
    } else if (option.OptionType === "RESTART") {
      setCurrentNodeID("1");
      setMessage("");
    }

    // Send log to Google Apps Script
    axios.post(
      "https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec",
      {
        Agent: agent,
        Action: option.Option,
        NodeID: option.NodeID,
        Label: option.Label,
        OptionSelected: option.Option,
        NextNodeID: option.NextNodeID,
      }
    ).catch((err) => console.error("Logging error:", err));
  };

  // Copy message to clipboard
  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    alert("Message copied!");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {!agent ? (
        <>
          <h2>Select Agent</h2>
          {agents.map((a) => (
            <button
              key={a}
              onClick={() => setAgent(a)}
              style={{ margin: "5px", padding: "10px 20px" }}
            >
              {a}
            </button>
          ))}
        </>
      ) : (
        <>
          <h3>Hello {agent}!</h3>
          {message ? (
            <>
              <p>{message}</p>
              <button onClick={copyMessage}>Copy Message</button>
              <button onClick={() => handleOptionClick({ OptionType: "RESTART" })} style={{ marginLeft: "10px" }}>
                Restart
              </button>
            </>
          ) : (
            <>
              {currentOptions.map((opt) => (
                <button
                  key={opt.Option}
                  onClick={() => handleOptionClick(opt)}
                  style={{ display: "block", margin: "5px 0", padding: "10px 15px" }}
                >
                  {opt.Option}
                </button>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
