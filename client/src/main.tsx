
import React from 'react';
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

console.log('[TTwW] Application initializing...');

const container = document.getElementById("root");

if (!container) {
  console.error('[TTwW] Fatal: Root element not found!');
  // Create a visible error message on the page if container is missing
  document.body.innerHTML = `
    <div style="font-family: sans-serif; text-align: center; padding: 40px;">
      <h1 style="color: #e53e3e;">App Loading Error</h1>
      <p>The application could not initialize properly. Root element not found.</p>
    </div>
  `;
} else {
  console.log('[TTwW] Mounting application...');
  const root = createRoot(container);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('[TTwW] Application mounted successfully');
}
