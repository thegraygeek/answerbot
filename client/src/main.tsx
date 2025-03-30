
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeOfflineHandler } from "./utils/offline-handler";

// Initialize offline handling on app start
initializeOfflineHandler();

createRoot(document.getElementById("root")!).render(<App />);
