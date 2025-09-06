import React, { useState, useEffect } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";

const NODES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv"; // Replace with your Nodes CSV link
const AGENTS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv"; // Replace with your Agents CSV link

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [nodes, setNodes] = useState([]); // Holds all nodes from Google Sheet
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [history, setHistory] = useState([]); // Keeps track of navigation for back button

  // Load agents
  useEffect(() => {
    fetchSheetData(AGENTS_CSV).then((data) => {
      setAgents(data.map((row) => row[0])); // Assuming agent names are in first column
    });
  }, []);

  // Load nodes
  useEffect(() => {
    fetchSheetData(NODES_CSV).then((data) => {
      setNodes(data);
      if (data.length > 0) setCurrentNodeId(data[0][0]); // Set first node as starting node
    });
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleNodeClick = (nextNodeId) => {
    setHistory((prev) => [...prev, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prevHistory = [...history];
    const lastNode = prevHistory.pop();
    setHistory(prevHistory);
    setCurrentNodeId(lastNode);
  };

  const handleRestart = () => {
    if (nodes.length > 0) {
      setCurrentNodeId(nodes[0][0]);
      setHistory([]);
    }
  };

  const currentNode = nodes.find((node) => node[0] === currentNodeId);

  if (!selectedAgent) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Select Agent</h2>
        {agents.map((agent, idx) => (
          <button
            key={idx}
            style={{ margin: "5px", padding: "10px 20px" }}
            onClick={() => handleAgentSelect(agent)}
          >
            {agent}
          </button>
        ))}
      </div>
    );
  }

  if (!currentNode) {
    return <div>Loading nodes...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Agent: {selectedAgent}</h2>
      <h3>{currentNode[1]}</h3> {/* Node Label */}

      <div>
        {currentNode.slice(2).length > 0 ? (
          currentNode.slice(2).map((nextNodeId, idx) => (
            <button
              key={idx}
              style={{ margin: "5px", padding: "10px 20px" }}
              onClick={() => handleNodeClick(nextNodeId)}
            >
              {nextNodeId}
            </button>
          ))
        ) : (
          <div>No further options</div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{ marginRight: "10px", padding: "10px 20px" }}
          onClick={handleBack}
          disabled={history.length === 0}
        >
          Back
        </button>
        <button style={{ padding: "10px 20px" }} onClick={handleRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default App;
