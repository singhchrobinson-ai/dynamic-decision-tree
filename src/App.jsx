import React, { useState, useEffect } from "react";
import axios from "axios";

// Replace with your Google Apps Script published URLs
const AGENTS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv";
const NODES_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv";
const LOG_URL = "https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec"; // POST endpoint

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(
    localStorage.getItem("selectedAgent") || ""
  );
  const [nodes, setNodes] = useState([]);
  const [currentNodeID, setCurrentNodeID] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [messageCopied, setMessageCopied] = useState(false);

  // Fetch Agents
  useEffect(() => {
    axios.get(AGENTS_URL).then((res) => {
      setAgents(res.data);
    });
  }, []);

  // Fetch DecisionTree nodes
  useEffect(() => {
    axios.get(NODES_URL).then((res) => {
      setNodes(res.data);
    });
  }, []);

  // Set current options when node changes
  useEffect(() => {
    if (currentNodeID) {
      const options = nodes.filter((n) => n.NodeID.toString() === currentNodeID.toString());
      setCurrentOptions(options);
    }
  }, [currentNodeID, nodes]);

  // Handle Agent selection
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    localStorage.setItem("selectedAgent", agent);
    // Start with NodeID 1
    setCurrentNodeID("1");
  };

  // Handle Option click
  const handleOptionClick = (option) => {
    // Log action
    axios.post(LOG_URL, {
      Agent: selectedAgent,
      Action: "SELECT_OPTION",
      NodeID: option.NodeID,
      Label: option.Label,
      OptionSelected: option.Option,
      NextNodeID: option.NextNodeID,
    });

    if (option.OptionType === "MESSAGE") {
      setCurrentOptions([option]); // Show message only
    } else if (option.Option === "RESTART") {
      setCurrentNodeID("1");
    } else {
      setCurrentNodeID(option.NextNodeID);
    }
  };

  // Copy message
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  };

  // Handle Restart (go back to agent selection if desired)
  const handleRestart = () => {
    // If you want to skip asking agent again:
    setCurrentNodeID("1");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Dynamic Decision Tree</h2>

      {!selectedAgent && (
        <div>
          <h3>Select Agent</h3>
          {agents.map((agent) => (
            <button
              key={agent}
              onClick={() => handleAgentSelect(agent)}
              style={{
                margin: "5px",
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              {agent}
            </button>
          ))}
        </div>
      )}

      {selectedAgent && currentOptions.length > 0 && (
        <div>
          <h3>Agent: {selectedAgent}</h3>
          {currentOptions.map((option, idx) => (
            <div key={idx} style={{ margin: "10px 0" }}>
              <div>
                <strong>{option.Label}</strong>
              </div>

              {option.OptionType === "MESSAGE" ? (
                <div>
                  <p>{option.Option}</p>
                  <button onClick={() => handleCopy(option.Option)}>Copy</button>
                  <button onClick={handleRestart} style={{ marginLeft: "10px" }}>
                    Restart
                  </button>
                  {messageCopied && <span style={{ marginLeft: "10px" }}>Message Copied!</span>}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => handleOptionClick(option)}
                    style={{ margin: "5px", padding: "5px 10px", cursor: "pointer" }}
                  >
                    {option.Option}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
