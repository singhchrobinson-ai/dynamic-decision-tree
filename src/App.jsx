import React, { useEffect, useState } from "react";
import { fetchSheetData } from "./utils/fetchSheetData";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchSheetData()
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Dynamic Decision Tree</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
