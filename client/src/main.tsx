
import React from 'react';
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Log the start of the application
console.log('Application starting...');

// Get the container
const container = document.getElementById("root");

// Check and confirm the container exists
if (!container) {
  console.error('Root element not found in the DOM. Aborting render.');
} else {
  console.log('Root element found, rendering application...');
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Failed to render application:', error);
  }
}
