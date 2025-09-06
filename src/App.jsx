import React, { useState, useEffect } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";
import axios from "axios";

// Replace with your deployed Google Apps Script URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec";

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(null);
  const [history, setHistory] = useState([]);

  // Load agents and decision tree
  useEffect(() => {
    async function loadData() {
      const agentsData = await fetchSheetData("agents");
      const nodesData = await fetchSheetData("decisiontree");
      setAgents(agentsData);
      setNodes(nodesData);
    }
    loadData();
  }, []);

  // Send logs to Google Sheet
  const logAction = async (action, node, option) => {
    try {
      await axios.post(SCRIPT_URL, {
        Agent: selectedAgent,
        Action: action,
        NodeID: node?.NodeID || "",
        Label: node?.Label || "",
        OptionSelected: option?.Option || option?.Label || "",
        NextNodeID: option?.NextNodeID || ""
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

  // Start decision tree after agent selection
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    const firstNodeIndex = nodes.findIndex((n) => n.NodeID === "1");
    setCurrentNodeIndex(firstNodeIndex >= 0 ? firstNodeIndex : 0);
    setHistory([]);
    logAction("agentSelected", null, { Option: agent });
  };

  // Handle option click
  const handleOptionClick = (option) => {
    const currentNode = nodes[currentNodeIndex];
    logAction("selectOption", currentNode, option);

    if (option.OptionType === "MESSAGE") return;

    const nextNodeId = option.NextNodeID;
    setHistory([...history, currentNodeIndex]);

    if (nextNodeId) {
      const nextIndex = nodes.findIndex((n) => n.NodeID === nextNodeId);
      if (nextIndex !== -1) {
        setCurrentNodeIndex(nextIndex);
      }
    }
  };

  // Back button
  const handleBack = () => {
    if (history.length > 0) {
      const lastIndex = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentNodeIndex(lastIndex);
      logAction("back", nodes[lastIndex], {});
    }
  };

  // Restart button
  const handleRestart = () => {
    logAction("restart", nodes[currentNodeIndex], {});
    setSelectedAgent(null);
    setCurrentNodeIndex(null);
    setHistory([]);
  };

  // Copy message
  const handleCopyMessage = (message, node) => {
    navigator.clipboard.writeText(message).then(() => {
      alert("Message copied to clipboard!");
      logAction("copyMessage", node, { Label: message });
    });
  };

  // Render agent selection
  if (!selectedAgent) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Select Agent</h2>
        {agents.map((agent, index) => (
          <button
            key={index}
            onClick={() => handleAgentSelect(agent)}
            className="block bg-blue-500 text-white px-4 py-2 rounded mb-2"
          >
            {agent}
          </button>
        ))}
      </div>
    );
  }

  // Render decision tree
  const currentNode = nodes[currentNodeIndex];
  if (!currentNode) return <div>Loading decision tree...</div>;

  // Find all options for this node
  const options = nodes.filter((n) => n.NodeID === currentNode.NodeID);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Agent: {selectedAgent}</h2>
      <h3 className="text-lg mb-4">{currentNode.Label}</h3>

      {options.map((opt, index) => (
        <div key={index} className="mb-2">
          {opt.OptionType === "MESSAGE" ? (
            <div className="p-3 border rounded bg-gray-100">
              <p className="mb-2">{opt.Label}</p>
              <button
                onClick={() => handleCopyMessage(opt.Label, currentNode)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Copy Message
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleOptionClick(opt)}
              className="block bg-blue-500 text-white px-4 py-2 rounded mb-2"
            >
              {opt.Option}
            </button>
          )}
        </div>
      ))}

      <div className="mt-4 space-x-2">
        <button
          onClick={handleBack}
          disabled={history.length === 0}
          className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleRestart}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

export default App;
