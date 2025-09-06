import React, { useState, useEffect } from "react";
import { fetchSheetData } from "./utils/fetchSheetData"; // Ensure this is a named export
import "./App.css"; // optional: your styles

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [nodes, setNodes] = useState([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadAgents() {
      const agentData = await fetchSheetData("agents");
      setAgents(agentData);
    }

    async function loadNodes() {
      const nodeData = await fetchSheetData("decisiontree");
      setNodes(nodeData);
    }

    loadAgents();
    loadNodes();
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setCurrentNodeIndex(0);
    setHistory([]);
  };

  const handleOptionClick = (option) => {
    const nextNodeId = option.NextNodeID;
    const currentNode = nodes[currentNodeIndex];
    setHistory([...history, currentNodeIndex]); // store current node index in history

    // Find the index of the next node
    const nextIndex = nodes.findIndex((node) => node.NodeID === nextNodeId);
    if (nextIndex !== -1) {
      setCurrentNodeIndex(nextIndex);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const previousIndex = history[history.length - 1];
    setCurrentNodeIndex(previousIndex);
    setHistory(history.slice(0, history.length - 1));
  };

  const handleRestart = () => {
    setSelectedAgent("");
    setCurrentNodeIndex(0);
    setHistory([]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Message copied to clipboard!");
    });
  };

  if (!selectedAgent) {
    return (
      <div className="container">
        <h2>Select Agent</h2>
        {agents.map((agent) => (
          <button key={agent} onClick={() => handleAgentSelect(agent)}>
            {agent}
          </button>
        ))}
      </div>
    );
  }

  const currentNode = nodes[currentNodeIndex];

  if (!currentNode) {
    return (
      <div className="container">
        <h2>End of decision tree</h2>
        <button onClick={handleRestart}>Restart</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{currentNode.Label}</h2>

      {currentNode.OptionType === "MESSAGE" ? (
        <div>
          <p>{currentNode.Option}</p>
          <button onClick={() => handleCopy(currentNode.Option)}>Copy</button>
          <button onClick={handleRestart}>Restart</button>
        </div>
      ) : (
        <div>
          {nodes
            .filter((node) => node.NodeID === currentNode.NodeID)
            .map((node) => (
              <button
                key={node.Option}
                onClick={() => handleOptionClick(node)}
              >
                {node.Option}
              </button>
            ))}
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        {history.length > 0 && <button onClick={handleBack}>Back</button>}
      </div>
    </div>
  );
}

export default App;
