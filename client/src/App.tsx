import React from "react";

function App() {
  // Simple state to test if React is working
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">TTwW Answerbot - Basic Test Page</h1>
      <p className="mb-4">If you can see this page, the basic React setup is working correctly!</p>
      
      <div className="bg-white p-4 rounded shadow-md">
        <p className="mb-2">Counter: {count}</p>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
      </div>
      
      <div className="mt-8 text-gray-600">
        <p>This is a simplified test page to verify React functionality.</p>
        <p>We'll add the full application features once we confirm everything is working.</p>
      </div>
    </div>
  );
}

export default App;

export default App;