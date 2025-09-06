import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);

  const AGENTS_URL = "https://script.google.com/macros/s/AKfycbw8WDVWIrZDuVn2n33Np-Rxd-FRDJzOQDpj_beR0qudLdXxoJg5M4lkQxSKEkz6t6am/exec?data=agents";
  const NODES_URL = "https://script.google.com/macros/s/AKfycbw8WDVWIrZDuVn2n33Np-Rxd-FRDJzOQDpj_beR0qudLdXxoJg5M4lkQxSKEkz6t6am/exec?data=decisiontree";

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get(AGENTS_URL);
        if (Array.isArray(res.data)) setAgents(res.data);
      } catch (err) {
        console.error("Error fetching agents:", err);
      }
    };
    fetchAgents();
  }, []);

  // Fetch decision tree nodes
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await axios.get(NODES_URL);
        setNodes(res.data);
      } catch (err) {
        console.error("Error fetching nodes:", err);
      }
    };
    fetchNodes();
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    const firstNode = nodes.find(n => n.NodeID === "1");
    setCurrentNode(firstNode || null);
    setHistory([]);
  };

  const handleOptionSelect = (node) => {
    if (node.OptionType === "RESTART") {
      setSelectedAgent(null);
      setCurrentNode(null);
      setHistory([]);
      return;
    }

    setHistory([...history, currentNode]);
    const next = nodes.find(n => n.NodeID === String(node.NextNodeID));
    setCurrentNode(next || null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dynamic Decision Tree</h1>

      {!selectedAgent && (
        <div>
          <h2>Select Agent</h2>
          {agents.map(agent => (
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
          <h3>{currentNode.Label}</h3>
          {currentNode.OptionType === "MESSAGE" ? (
            <div>
              <p>{currentNode.Option}</p>
              <button onClick={() => {
                navigator.clipboard.writeText(currentNode.Option);
                alert("Message copied!");
              }}>Copy Message</button>
            </div>
          ) : (
            nodes
              .filter(n => n.NodeID === currentNode.NodeID)
              .map(option => (
                <button
                  key={option.Option}
                  onClick={() => handleOptionSelect(option)}
                  style={{ margin: "5px", padding: "10px" }}
                >
                  {option.Option}
                </button>
              ))
          )}
          {history.length > 0 && (
            <button
              style={{ marginTop: "10px" }}
              onClick={() => {
                const prev = history.pop();
                setCurrentNode(prev);
                setHistory([...history]);
              }}
            >
              Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
