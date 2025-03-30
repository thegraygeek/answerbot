import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Offline handling using localStorage and navigator.onLine
function initializeOfflineHandler() {
  window.addEventListener('online', () => {
    localStorage.setItem('online', 'true');
  });
  window.addEventListener('offline', () => {
    localStorage.setItem('online', 'false');
  });

  // Check on load
  if (navigator.onLine) {
    localStorage.setItem('online', 'true');
  } else {
    localStorage.setItem('online', 'false');
  }
}

initializeOfflineHandler();

createRoot(document.getElementById("root")!).render(<App />);