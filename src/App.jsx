import React, { useState, useEffect } from "react";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec";

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
  const [agent, setAgent] = useState(localStorage.getItem("agent") || "");
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Load agents + tree
  useEffect(() => {
    async function loadData() {
      const [agentsData, treeData] = await Promise.all([
        fetchSheetData("agents"),
        fetchSheetData("decisiontree"),
      ]);
      setAgents(agentsData);
      setDecisionTree(treeData);

      if (localStorage.getItem("agent")) {
        const startNode = treeData.find((n) => String(n.NodeID) === "1");
        setCurrentNode(startNode || null);
      }
    }
    loadData();
  }, []);

  const restart = () => {
    const startNode = decisionTree.find((n) => String(n.NodeID) === "1");
    setCurrentNode(startNode || null);
    setHistory([]);
  };

  const startDecisionTree = (selectedAgent) => {
    setAgent(selectedAgent);
    localStorage.setItem("agent", selectedAgent);
    const startNode = decisionTree.find((n) => String(n.NodeID) === "1");
    setCurrentNode(startNode || null);
    setHistory([]);
  };

  const handleOptionClick = (option) => {
    if (option === "MESSAGE") {
      setCopied(true);
      navigator.clipboard.writeText(currentNode.Label);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    // ✅ Look up NextNodeID for the selected option
    const nextNode = decisionTree.find(
      (n) =>
        String(n.NodeID) ===
        String(
          currentNode.NextNodeID &&
            currentNode.NextNodeID.split("|")[
              currentNode.Option.split("|").indexOf(option)
            ]
        )
    );

    setHistory([...history, currentNode]);
    setCurrentNode(nextNode || null);

    // Log
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

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentNode(prev);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dynamic Decision Tree</h1>

      {agent && (
        <div className="mb-6 p-3 bg-blue-100 rounded text-blue-800 font-medium">
          👋 Hello, <span className="font-bold">{agent}</span>! Welcome back.
        </div>
      )}

      {!agent && (
        <div>
          <h2 className="text-lg mb-2">Select your name:</h2>
          <div className="space-y-2">
            {agents.map((a, i) => (
              <button
                key={i}
                onClick={() => startDecisionTree(a)}
                className="block w-full px-4 py-2 bg-blue-500 text-white rounded"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {agent && currentNode && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{currentNode.Label}</h2>

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

          {currentNode.Option &&
            currentNode.Option.includes("MESSAGE") &&
            copied && (
              <p className="mt-2 text-sm text-green-600">
                📋 Message copied to clipboard!
              </p>
            )}

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

      {agent && !currentNode && (
        <div className="mt-4">
          <p className="mb-4">🎉 End of the decision tree.</p>
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
