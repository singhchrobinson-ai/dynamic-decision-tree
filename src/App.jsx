import React, { useState, useEffect } from "react";
import axios from "axios";

const AGENTS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv";
const NODES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [currentNodeID, setCurrentNodeID] = useState(null);
  const [history, setHistory] = useState([]);
  const [copiedMessage, setCopiedMessage] = useState("");

  // Fetch CSV and parse
  const fetchCSVData = async (url) => {
    try {
      const res = await axios.get(url);
      const rows = res.data.split("\n").map((row) => row.split(","));
      const headers = rows[0].map((h) => h.trim());
      return rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i]?.trim();
        });
        return obj;
      });
    } catch (err) {
      console.error("Error fetching CSV:", err);
      return [];
    }
  };

  // Load agents and nodes
  useEffect(() => {
    fetchCSVData(AGENTS_CSV_URL).then(setAgents);
    fetchCSVData(NODES_CSV_URL).then((data) => {
      console.log("Nodes loaded:", data);
      setNodes(data);
    });
  }, []);

  // Get current options for the node
  const currentOptions = nodes.filter(
    (n) => n.NodeID === currentNodeID
  );

  // Handle option click
  const handleOptionClick = (option) => {
    if (option.OptionType === "OPTION") {
      setHistory([...history, currentNodeID]);
      setCurrentNodeID(option.NextNodeID);
    } else if (option.OptionType === "MESSAGE") {
      navigator.clipboard.writeText(option.Label).then(() => {
        setCopiedMessage("Message copied!");
        setTimeout(() => setCopiedMessage(""), 2000);
      });
      // Move to NextNodeID if specified
      if (option.NextNodeID) {
        setHistory([...history, currentNodeID]);
        setCurrentNodeID(option.NextNodeID);
      }
    } else if (option.OptionType === "RESTART") {
      setCurrentNodeID("1"); // start from node 1
      setHistory([]);
    }
  };

  // Handle back button
  const handleBack = () => {
    const prevHistory = [...history];
    const lastNode = prevHistory.pop();
    setHistory(prevHistory);
    setCurrentNodeID(lastNode || "1");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {!selectedAgent && (
        <div>
          <h2>Hello! Please select your name:</h2>
          {agents.map((agent, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedAgent(agent);
                setCurrentNodeID("1"); // start node
              }}
              style={{ margin: "5px", padding: "10px" }}
            >
              {agent}
            </button>
          ))}
        </div>
      )}

      {selectedAgent && (
        <div>
          <h3>Hi {selectedAgent}!</h3>

          {currentOptions.length === 0 && <p>Loading options...</p>}

          {currentOptions.map((option, i) => (
            <div key={i} style={{ margin: "10px 0" }}>
              {option.OptionType === "MESSAGE" ? (
                <div>
                  <p>{option.Label}</p>
                  <button onClick={() => handleOptionClick(option)}>
                    Copy & Next
                  </button>
                  {copiedMessage && <span style={{ marginLeft: "10px" }}>{copiedMessage}</span>}
                </div>
              ) : (
                <button onClick={() => handleOptionClick(option)}>
                  {option.Option}
                </button>
              )}
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            {history.length > 0 && (
              <button onClick={handleBack} style={{ marginRight: "10px" }}>
                Back
              </button>
            )}
            <button
              onClick={() => {
                setCurrentNodeID("1");
                setHistory([]);
              }}
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
