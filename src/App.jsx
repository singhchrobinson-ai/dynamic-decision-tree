import React, { useState, useEffect } from "react";

// Replace with your deployed Apps Script web app URL
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec";

// Fetch helper
async function fetchSheetData(type) {
  try {
    const res = await fetch(`${SHEET_URL}?data=${type}`);
    return res.json();
  } catch (err) {
    console.error("Error fetching", type, err);
    return [];
  }
}

function App() {
  const [agents, setAgents] = useState([]);
  const [decisionTree, setDecisionTree] = useState([]);
  const [agent, setAgent] = useState("");
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Load agents + decision tree
  useEffect(() => {
    async function loadData() {
      const [agentsData, treeData] = await Promise.all([
        fetchSheetData("agents"),
        fetchSheetData("decisiontree"),
      ]);
      setAgents(agentsData);
      setDecisionTree(treeData);
    }
    loadData();
  }, []);

  // Restart session
  const restart = () => {
    setCurrentNode(null);
    setAgent("");
    setHistory([]);
  };

  // Start decision tree after selecting agent
  const startDecisionTree = () => {
    const startNode = decisionTree.find((n) => String(n.NodeID) === "1");
    setCurrentNode(startNode || null);
    setHistory([]);
  };

  // Handle option click
  const handleOptionClick = (option) => {
    if (option === "MESSAGE") {
      setCopied(true);
      navigator.clipboard.writeText(currentNode.Label);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const nextNode = decisionTree.find(
      (n) => String(n.NodeID) === String(option)
    );

    setHistory([...history, currentNode]);
    setCurrentNode(nextNode || null);

    // Save log
    fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({
        Agent: agent,
        Action: "OptionSelected",
        NodeID: currentNode.NodeID,
        Label: currentNode.Label,
        OptionSelected: option,
        NextNodeID: nextNode ? nextNode.NodeID : "",
      }),
    });
  };

  // Go back one step
  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentNode(prev);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dynamic Decision Tree</h1>

      {/* Step 1: Select Agent */}
      {!agent && (
        <div>
          <h2 className="text-lg mb-2">Select your name:</h2>
          <select
            className="border rounded p-2 w-full"
            onChange={(e) => setAgent(e.target.value)}
          >
            <option value="">-- Select Agent --</option>
            {agents.map((a, i) => (
              <option key={i} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            onClick={startDecisionTree}
            disabled={!agent}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Start
          </button>
        </div>
      )}

      {/* Step 2: Show Decision Tree */}
      {agent && currentNode && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{currentNode.Label}</h2>

          {/* Show options */}
          <div className="space-y-2">
            {currentNode.Option &&
              currentNode.Option.split("|").map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt.trim())}
                  className="block w-full px-4 py-2 bg-green-500 text-white rounded"
                >
                  {opt}
                </button>
              ))}
          </div>

          {/* Copy message option */}
          {currentNode.Option &&
            currentNode.Option.includes("MESSAGE") &&
            copied && (
              <p className="mt-2 text-sm text-green-600">
                Message copied to clipboard!
              </p>
            )}

          {/* Navigation buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={goBack}
              disabled={history.length === 0}
              className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={restart}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {/* End of tree */}
      {agent && !currentNode && (
        <div className="mt-4">
          <p className="mb-4">End of the decision tree.</p>
          <button
            onClick={restart}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
