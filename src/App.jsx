import { useState, useEffect } from "react";
import { fetchDecisionTree, fetchAgents } from "./utils/fetchSheetData";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);

  useEffect(() => {
    fetchAgents().then(setAgents);
    fetchDecisionTree().then(setNodes);
  }, []);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleNextNode = () => {
    if (currentNodeIndex < nodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    }
  };

  if (!selectedAgent) {
    return (
      <div>
        <h2>Select Agent</h2>
        {agents.map((agent) => (
          <button key={agent} onClick={() => handleAgentSelect(agent)}>
            {agent}
          </button>
        ))}
      </div>
    );
  }

  if (!nodes.length) return <p>Loading nodes...</p>;

  const currentNode = nodes[currentNodeIndex];

  return (
    <div>
      <h2>{currentNode.Label}</h2>
      <button onClick={handleNextNode}>Next</button>
      {currentNodeIndex > 0 && <button onClick={handleBack}>Back</button>}
    </div>
  );
}

export default App;
