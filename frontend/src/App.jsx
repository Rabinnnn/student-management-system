import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Streams from './pages/Streams';
import Subjects from './pages/Subjects';
import Students from './pages/Students';
import Scores from './pages/Scores';
import StudentPerformance from './pages/StudentPerformance';
import ClassPerformance from './pages/ClassPerformance';

function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/streams', label: 'Class Streams', icon: '🏫' },
    { path: '/subjects', label: 'Subjects', icon: '📚' },
    { path: '/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/scores', label: 'Scores', icon: '📝' },
    { path: '/student-performance', label: 'Student Performance', icon: '📊' },
    { path: '/class-performance', label: 'Class Performance', icon: '📈' },
  ];

  return (
    // Sleek gradient background: from slate-100 to blue-100/indigo-100 for a calm, professional look
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      {/* Mobile header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          Ikonex Academy
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white/95 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
          flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-5 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Ikonex Academy
            </h1>
            <p className="text-xs text-gray-500 mt-1">Student Management System</p>
          </div>
          
          {/* Scrollable navigation area */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center flex-shrink-0">
            © 2025 Ikonex Academy
          </div>
        </aside>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardRedirect() {
  useEffect(() => {
    window.location.href = '/streams';
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/streams" element={<Streams />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/students" element={<Students />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/student-performance" element={<StudentPerformance />} />
          <Route path="/class-performance" element={<ClassPerformance />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;