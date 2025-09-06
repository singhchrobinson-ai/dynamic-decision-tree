import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchSheetData } from "./utils/fetchSheetData";

const WEB_APP_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL"; // Replace with your Apps Script Web App URL

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [nodes, setNodes] = useState([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [history, setHistory] = useState([]);

  // Fetch agents on load
  useEffect(() => {
    const fetchAgents = async () => {
      const data = await fetchSheetData("agents");
      setAgents(data);
    };
    fetchAgents();
  }, []);

  // Fetch decision tree nodes after agent is selected
  useEffect(() => {
    if (selectedAgent) {
      const fetchNodes = async () => {
        const data = await fetchSheetData("decisiontree");
        setNodes(data);
      };
      fetchNodes();
    }
  }, [selectedAgent]);

  // Log node actions to Google Sheets
  const logAction = async (node, optionSelected) => {
    try {
      await axios.post(WEB_APP_URL, {
        Agent: selectedAgent,
        Action: "Node Selection",
        NodeID: node.NodeID,
        Label: node.Label,
        OptionSelected: optionSelected,
        NextNodeID: node.NextNodeID,
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  // Handle agent selection
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setCurrentNodeIndex(0); // Start at first node
    setHistory([]);
  };

  // Handle option click
  const handleOptionClick = (option) => {
    const currentNode = nodes[currentNodeIndex];
    logAction(currentNode, option);
    setHistory([...history, currentNodeIndex]);
    if (currentNodeIndex < nodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    } else {
      alert("End of Decision Tree");
    }
  };

  // Go back to previous node
  const handleBack = () => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setCurrentNodeIndex(lastIndex);
    setHistory(history.slice(0, -1));
  };

  // Restart the session
  const handleRestart = () => {
    setSelectedAgent(null);
    setCurrentNodeIndex(0);
    setHistory([]);
  };

  // Current node
  const currentNode = nodes[currentNodeIndex];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {!selectedAgent ? (
        <div>
          <h2>Select Agent:</h2>
          {agents.map((agent) => (
            <button
              key={agent}
              onClick={() => handleAgentSelect(agent)}
              style={{ margin: "5px", padding: "10px 20px" }}
            >
              {agent}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <h2>Agent: {selectedAgent}</h2>
          {currentNode ? (
            <div>
              <h3>{currentNode.Label}</h3>
              {currentNode.Option ? (
                <button
                  onClick={() => handleOptionClick(currentNode.Option)}
                  style={{ margin: "5px", padding: "10px 20px" }}
                >
                  {currentNode.Option}
                </button>
              ) : (
                <p>No options available</p>
              )}
              <div style={{ marginTop: "10px" }}>
                <button onClick={handleBack} style={{ marginRight: "10px" }}>
                  Back
                </button>
                <button onClick={handleRestart}>Restart</button>
              </div>
            </div>
          ) : (
            <p>Loading nodes...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
