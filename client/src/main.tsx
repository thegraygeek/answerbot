
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Define a minimal app component
function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">TTwW Answerbot</h1>
      <p>Basic React Application Test</p>
    </div>
  );
}

// Create root and render
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
