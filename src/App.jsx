import React, { useState, useEffect } from "react";
import  fetchSheetData  from "./utils/fetchSheetData";

function App() {
  const [agents, setAgents] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch Agents and Nodes
    async function fetchData() {
      const agentData = await fetchSheetData("agents");
      setAgents(agentData);

      const nodeData = await fetchSheetData("decisiontree");
      setNodes(nodeData);
    }
    fetchData();
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setCurrentNodeIndex(0);
    setHistory([]);
  };

  const currentNode = nodes[currentNodeIndex];

  const handleOptionClick = (selectedOption) => {
    if (!currentNode) return;

    const nextNodeID = currentNode.NextNodeID;
    const nextIndex = nodes.findIndex((n) => n.NodeID === nextNodeID);

    // Update history for back button
    setHistory([...history, currentNodeIndex]);

    // Move to next node or reset if no next node
    if (nextIndex !== -1) {
      setCurrentNodeIndex(nextIndex);
    } else {
      setCurrentNodeIndex(nodes.length); // end node
    }

    // Log action to Google Sheet
    logAction(selectedAgent, currentNode, selectedOption);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prevIndex = history[history.length - 1];
    setCurrentNodeIndex(prevIndex);
    setHistory(history.slice(0, -1));
  };

  const handleRestart = () => {
    setCurrentNodeIndex(0);
    setHistory([]);
  };

  const logAction = async (agent, node, option) => {
    try {
      await fetch("https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec", {
        method: "POST",
        body: JSON.stringify({
          Agent: agent,
          NodeID: node.NodeID,
          Label: node.Label,
          OptionSelected: option,
          NextNodeID: node.NextNodeID,
          Action: "Option Selected",
        }),
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!selectedAgent ? (
        <div>
          <h2>Select Agent</h2>
          {agents.map((agent, idx) => (
            <button key={idx} onClick={() => handleAgentSelect(agent)}>
              {agent}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <h2>Agent: {selectedAgent}</h2>

          {currentNode ? (
            <div style={{ marginTop: "1rem" }}>
              {currentNode.Option === "MESSAGE" ? (
                <div>
                  <p>{currentNode.Label}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentNode.Label)
                        .then(() => alert("Message copied to clipboard!"))
                        .catch((err) => console.error("Copy failed:", err));
                    }}
                  >
                    Copy Message
                  </button>
                  <button onClick={() => handleOptionClick("MESSAGE")}>
                    Next
                  </button>
                </div>
              ) : currentNode.Option === "RESTART" ? (
                <button onClick={handleRestart}>Restart</button>
              ) : (
                <div>
                  <p>{currentNode.Label}</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {nodes
                      .filter((n) => n.NodeID === currentNode.NodeID)
                      .map((n, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(n.Option)}
                        >
                          {n.Option}
                        </button>
                      ))}
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    {history.length > 0 && (
                      <button onClick={handleBack}>Back</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p>End of Nodes</p>
              <button onClick={handleRestart}>Restart</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
