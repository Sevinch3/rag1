import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { BookOpen, Upload, MessageSquare, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <BookOpen size={28} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>IELTS AI</h2>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Link to="/" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
              <MessageSquare size={18} /> Chat
            </Link>
            <Link to="/upload" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
              <Upload size={18} /> Documents
            </Link>
          </nav>

          <button className="btn btn-outline" onClick={() => setToken(null)}>
            <LogOut size={18} /> Logout
          </button>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/upload" element={<Dashboard token={token} view="upload" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
