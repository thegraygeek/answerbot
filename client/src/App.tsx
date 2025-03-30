import React from "react";

function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">TTwW Answerbot</h1>
      <p className="mb-4 text-gray-700">Simple test page for deployment verification</p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4 text-xl">Counter: {count}</p>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-md transition-colors"
          onClick={() => setCount(count + 1)}
        >
          Increment Counter
        </button>
      </div>
      
      <div className="mt-8 text-center text-gray-600 max-w-md">
        <p className="mb-2">If you see this page and the counter increases when clicked, the application is working correctly!</p>
        <p>Deployed version: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default App;