import React, { useState, useEffect } from "react";

// Replace these with your deployed Apps Script URLs
const AGENTS_URL = "https://script.google.com/macros/s/AKfycbw8WDVWIrZDuVn2n33Np-Rxd-FRDJzOQDpj_beR0qudLdXxoJg5M4lkQxSKEkz6t6am/exec";
const NODES_URL = "https://script.google.com/macros/s/AKfycbw8WDVWIrZDuVn2n33Np-Rxd-FRDJzOQDpj_beR0qudLdXxoJg5M4lkQxSKEkz6t6am/exec";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]); // For back button

  // Fetch Agents and Nodes on mount
  useEffect(() => {
    fetch(AGENTS_URL)
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch(console.error);

    fetch(NODES_URL)
      .then((res) => res.json())
      .then((data) => setNodes(data))
      .catch(console.error);
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);

    // Start with NodeID = 1
    const firstNode = nodes.find((n) => Number(n.NodeID) === 1);
    setCurrentNode(firstNode);
    setHistory([]); // Reset history
  };

  const handleOptionSelect = (option) => {
    if (option.NextNodeID) {
      const nextNode = nodes.find((n) => Number(n.NodeID) === Number(option.NextNodeID));
      if (nextNode) {
        setHistory((prev) => [...prev, currentNode]);
        setCurrentNode(nextNode);
      } else {
        setCurrentNode(null);
      }
    } else {
      setCurrentNode(null);
    }

    // Optionally, POST to logs here
  };

  const handleBack = () => {
    const previousNode = history.pop();
    setCurrentNode(previousNode || null);
    setHistory([...history]);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Message copied to clipboard!");
    });
  };

  // Render Agent selection
  if (!selectedAgent) {
    return (
      <div style={styles.container}>
        <h2>Dynamic Decision Tree</h2>
        <h3>Select Agent</h3>
        <div style={styles.grid}>
          {agents.map((agent) => (
            <button
              key={agent}
              style={styles.agentButton}
              onClick={() => handleAgentSelect(agent)}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render current node
  if (!currentNode) {
    return (
      <div style={styles.container}>
        <h2>End of Decision Tree</h2>
        <button style={styles.agentButton} onClick={() => setSelectedAgent(null)}>
          Restart
        </button>
      </div>
    );
  }

  // Filter options for the current node
  const nodeOptions = nodes.filter(
    (n) => Number(n.NodeID) === Number(currentNode.NodeID)
  );

  return (
    <div style={styles.container}>
      <h2>Dynamic Decision Tree</h2>
      <h3>Agent: {selectedAgent}</h3>

      <div style={styles.nodeContainer}>
        <p style={styles.nodeLabel}>{currentNode.Label}</p>

        <div style={styles.grid}>
          {nodeOptions.map((option, index) => {
            if (option.OptionType === "MESSAGE") {
              return (
                <div key={index} style={styles.messageBox}>
                  <p>{option.Option}</p>
                  <button
                    style={styles.copyButton}
                    onClick={() => handleCopyMessage(option.Option)}
                  >
                    Copy
                  </button>
                </div>
              );
            }

            return (
              <button
                key={index}
                style={styles.optionButton}
                onClick={() => handleOptionSelect(option)}
              >
                {option.Option}
              </button>
            );
          })}
        </div>

        {history.length > 0 && (
          <button style={styles.backButton} onClick={handleBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    width: "100%",
    maxWidth: "800px",
    marginTop: "20px",
  },
  agentButton: {
    padding: "15px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "1px solid #0070f3",
    backgroundColor: "#0070f3",
    color: "#fff",
    textAlign: "center",
  },
  nodeContainer: {
    marginTop: "30px",
    width: "100%",
    maxWidth: "800px",
    textAlign: "center",
  },
  nodeLabel: {
    fontSize: "18px",
    marginBottom: "20px",
  },
  optionButton: {
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "1px solid #0070f3",
    backgroundColor: "#fff",
    color: "#0070f3",
  },
  backButton: {
    marginTop: "30px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "1px solid #999",
    backgroundColor: "#f0f0f0",
  },
  messageBox: {
    padding: "15px",
    border: "1px solid #0070f3",
    borderRadius: "8px",
    backgroundColor: "#e6f0ff",
    textAlign: "center",
  },
  copyButton: {
    marginTop: "10px",
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "1px solid #0070f3",
    backgroundColor: "#0070f3",
    color: "#fff",
  },
};

export default App;
