import React, { useState, useEffect } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";

const DECISION_TREE_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=0&single=true&output=csv"; // Replace with your published Google Sheet CSV for nodes
const AGENTS_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKb0pyaGYBMYlRy8WIvUN1XIDcYpsycWuifS3I6oQFu42zbj6Sbf63xbjOlDr9mDTMoTEWo1EbatNa/pub?gid=1758495549&single=true&output=csv"; // Replace with your published Google Sheet CSV for agents

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(
    localStorage.getItem("selectedAgent") || ""
  );
  const [currentNodeID, setCurrentNodeID] = useState("1"); // Start at Node 1
  const [nodeHistory, setNodeHistory] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [messageCopied, setMessageCopied] = useState(false);

  // Fetch agents
  useEffect(() => {
    fetchSheetData(AGENTS_CSV).then((data) => {
      setAgents(data);
    });
  }, []);

  // Fetch nodes
  useEffect(() => {
    fetchSheetData(DECISION_TREE_CSV).then((data) => {
      // Parse CSV rows to objects
      const headers = data[0];
      const nodeRows = data.slice(1).map((row) => {
        let obj = {};
        headers.forEach((h, i) => (obj[h] = row[i]));
        return obj;
      });
      setNodes(nodeRows);
    });
  }, []);

  // Update current options whenever currentNodeID or nodes change
  useEffect(() => {
    if (nodes.length === 0) return;
    const options = nodes.filter(
      (n) => Number(n.NodeID) === Number(currentNodeID)
    );
    setCurrentOptions(options);
  }, [currentNodeID, nodes]);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    localStorage.setItem("selectedAgent", agent);
    setCurrentNodeID("1"); // Start from Node 1
    setNodeHistory([]);
  };

  const handleOptionSelect = (option) => {
    if (option.OptionType === "MESSAGE") {
      setMessageCopied(false); // Reset copy notification
    }
    if (option.NextNodeID) {
      setNodeHistory([...nodeHistory, currentNodeID]);
      setCurrentNodeID(option.NextNodeID);
    }
  };

  const handleBack = () => {
    if (nodeHistory.length === 0) return;
    const prevNodeID = nodeHistory[nodeHistory.length - 1];
    setNodeHistory(nodeHistory.slice(0, -1));
    setCurrentNodeID(prevNodeID);
  };

  const handleRestart = () => {
    setCurrentNodeID("1");
    setNodeHistory([]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {!selectedAgent ? (
        <div>
          <h2>Select Agent</h2>
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
      ) : (
        <div>
          <h2>Agent: {selectedAgent}</h2>
          {currentOptions.length > 0 ? (
            <div>
              {currentOptions.map((option, idx) => (
                <div key={idx} style={{ margin: "10px 0" }}>
                  {option.OptionType === "OPTION" && (
                    <button
                      onClick={() => handleOptionSelect(option)}
                      style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        marginRight: "10px",
                      }}
                    >
                      {option.Option}
                    </button>
                  )}
                  {option.OptionType === "MESSAGE" && (
                    <div>
                      <p>{option.Label}</p>
                      <button onClick={() => handleCopy(option.Label)}>
                        Copy Message
                      </button>
                      {messageCopied && <span> Message copied!</span>}
                      {option.NextNodeID && (
                        <button
                          onClick={handleRestart}
                          style={{ marginLeft: "10px" }}
                        >
                          Restart
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {nodeHistory.length > 0 && (
                <button onClick={handleBack} style={{ marginTop: "10px" }}>
                  Back
                </button>
              )}
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
