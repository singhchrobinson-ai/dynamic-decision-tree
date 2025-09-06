import { useState, useEffect } from "react";
import { fetchCSVData } from "./utils/fetchSheetData";

// Replace with your published CSV links
const NODES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv";
const AGENTS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [nodes, setNodes] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState("start"); // assuming start node ID
  const [history, setHistory] = useState([]); // To store navigation history

  // Load CSV data
  useEffect(() => {
    fetchCSVData(AGENTS_CSV).then(setAgents);
    fetchCSVData(NODES_CSV).then(setNodes);
  }, []);

  // Get current node data based on ID
  const currentNode = nodes.find(node => node[0] === currentNodeId);

  // Handle node button click
  const handleNodeClick = (nextNodeId) => {
    setHistory(prev => [...prev, currentNodeId]); // Add current node to history
    setCurrentNodeId(nextNodeId);
  };

  // Handle back button click
  const handleBackClick = () => {
    if (history.length === 0) return;
    const previousNodeId = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setCurrentNodeId(previousNodeId);
  };

  // Render agent selection
  if (!selectedAgent) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Select your agent name:</h2>
        {agents.map((agent, idx) => (
          <button
            key={idx}
            style={{ margin: "5px", padding: "10px 20px" }}
            onClick={() => setSelectedAgent(agent[0])}
          >
            {agent[0]}
          </button>
        ))}
      </div>
    );
  }

  // Render decision tree nodes
  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {selectedAgent}!</h2>
      {currentNode ? (
        <div>
          <h3>{currentNode[1]}</h3>
          <div style={{ marginTop: "15px" }}>
            {currentNode.slice(2).map((nextNodeId, idx) => (
              <button
                key={idx}
                style={{ margin: "5px", padding: "10px 20px" }}
                onClick={() => handleNodeClick(nextNodeId)}
              >
                {nextNodeId}
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <button
              style={{ marginTop: "15px", padding: "10px 20px" }}
              onClick={handleBackClick}
            >
              Back
            </button>
          )}
        </div>
      ) : (
        <div>
          <h3>End of this path</h3>
          <button
            style={{ marginTop: "15px", padding: "10px 20px" }}
            onClick={() => setCurrentNodeId("start")}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
