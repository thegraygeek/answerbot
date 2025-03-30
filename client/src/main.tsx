
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Get the container
const container = document.getElementById("root");

// Render the app
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
