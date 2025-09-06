import React, { useState, useEffect } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [previousNodes, setPreviousNodes] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [greeting, setGreeting] = useState("Welcome! Please select your name:");

  useEffect(() => {
    async function fetchData() {
      const agentData = await fetchSheetData("agents");
      const nodeData = await fetchSheetData("decisiontree");
      setAgents(agentData);
      setNodes(nodeData);
    }
    fetchData();
  }, []);

  const handleAgentSelect = (agentName) => {
    setSelectedAgent(agentName);
    setGreeting(`Hello ${agentName}!`);
    const firstNode = nodes.find((n) => n.NodeID === "1");
    setCurrentNode(firstNode);
    setPreviousNodes([]);
  };

  const handleOptionSelect = (option) => {
    if (!currentNode) return;

    // Log to Google Sheet via AppScript endpoint
    fetch("https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec", {
      method: "POST",
      body: JSON.stringify({
        Agent: selectedAgent,
        Action: "OptionSelected",
        NodeID: currentNode.NodeID,
        Label: currentNode.Label,
        OptionSelected: option,
        NextNodeID: currentNode.NextNodeID,
      }),
    });

    setPreviousNodes((prev) => [...prev, currentNode]);
    const nextNode = nodes.find((n) => n.NodeID === currentNode.NextNodeID);
    setCurrentNode(nextNode);
  };

  const handleBack = () => {
    if (previousNodes.length === 0) return;
    const prevNode = previousNodes[previousNodes.length - 1];
    setPreviousNodes((prev) => prev.slice(0, prev.length - 1));
    setCurrentNode(prevNode);
  };

  const handleRestart = () => {
    const firstNode = nodes.find((n) => n.NodeID === "1");
    setCurrentNode(firstNode);
    setPreviousNodes([]);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard!");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>{greeting}</h2>

      {!selectedAgent && (
        <div>
          {agents.map((agent, index) => (
            <button
              key={index}
              onClick={() => handleAgentSelect(agent)}
              style={{ margin: "5px", padding: "10px" }}
            >
              {agent}
            </button>
          ))}
        </div>
      )}

      {selectedAgent && currentNode && (
        <div>
          <h3>{currentNode.Label}</h3>

          {currentNode.OptionType === "MESSAGE" ? (
            <div>
              <p>{currentNode.Option}</p>
              <button onClick={() => handleCopyMessage(currentNode.Option)}>
                Copy Message
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => handleOptionSelect(currentNode.Option)}
                style={{ margin: "5px", padding: "10px" }}
              >
                {currentNode.Option}
              </button>
            </div>
          )}

          <div style={{ marginTop: "15px" }}>
            <button onClick={handleBack} style={{ marginRight: "10px" }}>
              Back
            </button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        </div>
      )}

      {!currentNode && selectedAgent && (
        <div>
          <h3>End of Decision Tree</h3>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;
