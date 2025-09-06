import React, { useState, useEffect } from "react";
import axios from "axios";

// Replace these with your published CSV URLs
const AGENTS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv";
const DECISION_TREE_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv";

// Utility to fetch CSV and parse into arrays of objects
async function fetchSheetData(url) {
  try {
    const response = await axios.get(url);
    const rows = response.data.split("\n").map(r => r.split(","));
    const headers = rows[0];
    return rows.slice(1).map(r => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = r[i]?.trim();
      });
      // Convert NodeID and NextNodeID to numbers
      if (obj.NodeID) obj.NodeID = Number(obj.NodeID);
      if (obj.NextNodeID) obj.NextNodeID = Number(obj.NextNodeID);
      return obj;
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [agent, setAgent] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);

  // Load agents and nodes on mount
  useEffect(() => {
    fetchSheetData(AGENTS_CSV).then(setAgents);
    fetchSheetData(DECISION_TREE_CSV).then(setNodes);
  }, []);

  // When agent is selected, start with first node (NodeID=1)
  useEffect(() => {
    if (agent && nodes.length > 0) {
      const firstNode = nodes.find(n => n.NodeID === 1);
      setCurrentNode(firstNode);
      setHistory([]);
    }
  }, [agent, nodes]);

  if (!agents.length || !nodes.length) return <div>Loading...</div>;

  const handleAgentSelect = (name) => {
    setAgent(name);
  };

  const handleNext = (option) => {
    // Log the action to Google Sheets via Apps Script endpoint (adjust URL)
    axios.post("https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec", {
      Agent: agent,
      NodeID: option.NodeID,
      Label: option.Label,
      OptionSelected: option.Option,
      NextNodeID: option.NextNodeID,
      Action: "Selected"
    }).catch(console.error);

    // Update history for back button
    setHistory(prev => [...prev, currentNode]);

    // Move to next node
    const nextNode = nodes.find(n => n.NodeID === option.NextNodeID);
    setCurrentNode(nextNode);
  };

  const handleBack = () => {
    const prev = [...history];
    const lastNode = prev.pop();
    setHistory(prev);
    setCurrentNode(lastNode);
  };

  const handleRestart = () => {
    setCurrentNode(nodes.find(n => n.NodeID === 1));
    setHistory([]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard!");
  };

  if (!agent) {
    return (
      <div>
        <h2>Select Agent</h2>
        {agents.map(a => (
          <button key={a} onClick={() => handleAgentSelect(a)}>
            {a}
          </button>
        ))}
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div>
        <h2>No Node Found</h2>
        <button onClick={handleRestart}>Restart</button>
      </div>
    );
  }

  const options = nodes.filter(n => n.NodeID === currentNode.NodeID);

  return (
    <div>
      <h3>Agent: {agent}</h3>
      <h2>{currentNode.Label}</h2>
      <div style={{ marginTop: "10px" }}>
        {options.map(opt => {
          if (opt.OptionType === "MESSAGE") {
            return (
              <div key={opt.Option} style={{ marginBottom: "10px" }}>
                <div>{opt.Option}</div>
                <button onClick={() => handleCopy(opt.Option)}>Copy Message</button>
                <button onClick={handleRestart} style={{ marginLeft: "5px" }}>Restart</button>
              </div>
            );
          }
          // Regular option button
          return (
            <button key={opt.Option} onClick={() => handleNext(opt)} style={{ display: "block", margin: "5px 0" }}>
              {opt.Option}
            </button>
          );
        })}
      </div>
      {history.length > 0 && <button onClick={handleBack}>Back</button>}
    </div>
  );
}

export default App;
