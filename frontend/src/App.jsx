import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Streams from './pages/Streams';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm p-4 flex gap-4 flex-wrap">
          <Link to="/" className="text-blue-600 font-semibold">Home</Link>
          <Link to="/streams" className="text-blue-600">Class Streams</Link>
        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/streams" element={<Streams />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  const [status, setStatus] = useState('Checking...');
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Error'));
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-blue-600">Ikonex Academy</h1>
      <p>Backend: <span className={status === 'ok' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
    </div>
  );
}

export default App;