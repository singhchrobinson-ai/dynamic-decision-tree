import { useEffect, useState } from "react";
import { getDecisionTreeData } from "./utils/fetchSheetData.js";

export default function App() {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDecisionTreeData();
        setTreeData(data);
      } catch (err) {
        setError("Failed to load Google Sheet data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="p-4">⏳ Loading data...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        🚀 Dynamic Decision Tree
      </h1>
      <p>Google Sheet Data (raw JSON):</p>
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
        {JSON.stringify(treeData, null, 2)}
      </pre>
    </div>
  );
}
