import axios from "axios";

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwbHD3sSBjGXtI_jDIA7BHkPfAGyaAnDaO3Is1LUotTxRDsDIWYC8tzdX4YxB3IbCyy/exec"; // Replace with your deployed web app URL

export async function fetchDecisionTree() {
  try {
    const response = await axios.get(`${WEB_APP_URL}?data=decisiontree`);
    return response.data; // This should be an array of nodes
  } catch (error) {
    console.error("Error fetching decision tree:", error);
    return [];
  }
}

export async function fetchAgents() {
  try {
    const response = await axios.get(`${WEB_APP_URL}?data=agents`);
    return response.data; // This should be an array of agent names
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}
