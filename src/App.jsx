import React, { useState, useEffect } from "react";
import axios from "axios";

const AGENTS_CSV = "YOUR_AGENTS_SHEET_CSV_LINK";
const DECISION_TREE_CSV = "YOUR_DECISION_TREE_SHEET_CSV_LINK";

async function fetchCSV(url) {
  try {
    const response = await axios.get(url);
    const rows = response.data.split("\n").map(r => r.split(","));
    const headers = rows[0];
    return rows.slice(1).map(r => {
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = r[i]?.trim();
      });
      if (obj.NodeID) obj.NodeID = Number(obj.NodeID);
      if (obj.NextNodeID) obj.NextNodeID = Number(obj.NextNodeID);
      return obj;
    });
  } catch (err) {
    console.error("Error fetching CSV:", err);
    return [];
  }
}

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [agent, setAgent] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCSV(AGENTS_CSV).then(setAgents);
    fetchCSV(DECISION_TREE_CSV).then(setNodes);
  }, []);

  useEffect(() => {
    if (agent && nodes.length > 0 && !currentNode) {
      const firstNode = nodes.find(n => n.NodeID === 1);
      setCurrentNode(firstNode);
    }
  }, [agent, nodes, currentNode]);

  const handleAgentSelect = (name) => {
    setAgent(name);
  };

  const handleNext = (option) => {
    axios.post("YOUR_APPS_SCRIPT_WEB_APP_URL", {
      Agent: agent,
      NodeID: option.NodeID,
      Label: option.Label,
      OptionSelected: option.Option,
      NextNodeID: option.NextNodeID,
      Action: "Selected"
    }).catch(console.error);

    setHistory(prev => [...prev, currentNode]);

    const nextNode = nodes.find(n => n.NodeID === option.NextNodeID);
    setCurrentNode(nextNode);
  };

  const handleBack = () => {
    const prevHistory = [...history];
    const lastNode = prevHistory.pop();
    setHistory(prevHistory);
    setCurrentNode(lastNode);
  };

  const handleRestart = () => {
    const firstNode = nodes.find(n => n.NodeID === 1);
    setCurrentNode(firstNode);
    setHistory([]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Message copied!");
  };

  if (!agents.length || !nodes.length) return <div>Loading...</div>;

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
        <h2>No node found</h2>
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
          return (
            <button
              key={opt.Option}
              onClick={() => handleNext(opt)}
              style={{ display: "block", margin: "5px 0" }}
            >
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
