
import { createRoot } from "react-dom/client";
import "./index.css";

// Super minimal static app with no hooks
function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '1rem',
      backgroundColor: '#93c5fd',
      color: '#1e3a8a' 
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        TTwW Answerbot
      </h1>
      <p>Minimal React Test - NO HOOKS</p>
    </div>
  );
}

// Get the container
const container = document.getElementById("root");

// Render the app
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
