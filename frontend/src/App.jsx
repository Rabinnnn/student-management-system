import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Streams from './pages/Streams';
import Subjects from './pages/Subjects';
import Students from './pages/Students';
import Scores from './pages/Scores';
import StudentPerformance from './pages/StudentPerformance';
import ClassPerformance from './pages/ClassPerformance';



function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm p-4 flex gap-4 flex-wrap">
          <Link to="/" className="text-blue-600 font-semibold">Home</Link>
          <Link to="/streams" className="text-blue-600">Class Streams</Link>
          <Link to="/subjects" className="text-blue-600">Subjects</Link>
          <Link to="/students" className="text-blue-600">Students</Link>
          <Link to="/scores" className="text-blue-600">Scores</Link>
          <Link to="/student-performance" className="text-blue-600">Student Performance</Link>
          <Link to="/class-performance" className="text-blue-600">Class Performance</Link>


        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/streams" element={<Streams />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/students" element={<Students />} />
            <Route path="/scores" element={<Scores />} />
            <Route path="/student-performance" element={<StudentPerformance />} />
            <Route path="/class-performance" element={<ClassPerformance />} />
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