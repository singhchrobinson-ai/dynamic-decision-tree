import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);

  // Apps Script URLs
  const AGENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv";
  const NODES_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv";

  useEffect(() => {
    fetchAgents();
    fetchNodes();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get(AGENTS_URL);
      if (Array.isArray(res.data)) setAgents(res.data);
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const fetchNodes = async () => {
    try {
      const res = await axios.get(NODES_URL);
      if (Array.isArray(res.data)) setNodes(res.data);
    } catch (err) {
      console.error("Error fetching nodes:", err);
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    // Start at NodeID 1
    const node1 = nodes.find((n) => n.NodeID === 1);
    setCurrentNode(node1);
    setHistory([node1]);
  };

  const handleOptionClick = (option) => {
    if (!option.NextNodeID) return;

    const nextNode =
      option.OptionType === "RESTART"
        ? null
        : nodes.find((n) => n.NodeID === option.NextNodeID);

    if (option.OptionType === "MESSAGE") {
      alert("Message: " + option.Option);
    }

    setCurrentNode(nextNode);
    setHistory((prev) => (nextNode ? [...prev, nextNode] : prev));

    // Optionally, log action to Google Sheet via POST
    logAction({
      Agent: selectedAgent,
      Action: "Selected Option",
      NodeID: option.NodeID,
      Label: option.Label,
      OptionSelected: option.Option,
      NextNodeID: option.NextNodeID,
    });
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, history.length - 1);
    setHistory(newHistory);
    setCurrentNode(newHistory[newHistory.length - 1]);
  };

  const handleRestart = () => {
    setSelectedAgent(null);
    setCurrentNode(null);
    setHistory([]);
  };

  const logAction = async (data) => {
    try {
      await axios.post("https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec", data);
    } catch (err) {
      console.error("Error logging action:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Dynamic Decision Tree</h2>

      {!selectedAgent && (
        <div>
          <h3>Select Agent</h3>
          {agents.map((agent) => (
            <button
              key={agent}
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
          <h3>Agent: {selectedAgent}</h3>
          <p>
            <strong>{currentNode.Label}</strong>
          </p>
          {nodes
            .filter((n) => n.NodeID === currentNode.NodeID)
            .map((node) => (
              <div key={node.Option + node.NextNodeID}>
                {node.OptionType === "MESSAGE" ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(node.Option);
                      alert("Message copied!");
                    }}
                    style={{ margin: "5px", padding: "10px" }}
                  >
                    {node.Option}
                  </button>
                ) : (
                  <button
                    onClick={() => handleOptionClick(node)}
                    style={{ margin: "5px", padding: "10px" }}
                  >
                    {node.Option}
                  </button>
                )}
              </div>
            ))}
          <div style={{ marginTop: "20px" }}>
            <button onClick={handleBack} style={{ marginRight: "10px" }}>
              Back
            </button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
