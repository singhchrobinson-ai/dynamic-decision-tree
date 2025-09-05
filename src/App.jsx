import { useEffect, useState } from "react";
import { getDecisionTreeData } from "./utils/fetchSheetData";

export default function App() {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getDecisionTreeData();
      setTreeData(data);
    }
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600">
        🚀 Dynamic Decision Tree
      </h1>
      <p className="mb-2">Google Sheet Data:</p>
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
        {JSON.stringify(treeData, null, 2)}
      </pre>
    </div>
  );
}
