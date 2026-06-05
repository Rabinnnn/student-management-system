import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Cannot reach backend'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          Ikonex Academy
        </h1>
        <p className="text-gray-700">
          Backend status: <span className={status === 'ok' ? 'text-green-600' : 'text-red-600'}>{status}</span>
        </p>
      </div>
    </div>
  );
}

export default App;
