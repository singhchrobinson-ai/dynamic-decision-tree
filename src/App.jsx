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
  const [agent, setAgent] = useState(localStorage.getItem("agent") || "");
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

      // If agent already selected → start from Node 1
      if (localStorage.getItem("agent")) {
        const startNode = treeData.find((n) => String(n.NodeID) === "1");
        setCurrentNode(startNode || null);
      }
    }
    loadData();
  }, []);

  // Restart (but keep agent)
  const restart = () => {
    const startNode = decisionTree.find((n) => String(n.NodeID) === "1");
    setCurrentNode(startNode || null);
    setHistory([]);
  };

  // Start decision tree after selecting agent
  const startDecisionTree = (selectedAgent) => {
    setAgent(selectedAgent);
    localStorage.setItem("agent", selectedAgent); // save name
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

    setHistory([.]()
