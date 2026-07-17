import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
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
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">
              <BookOpen size={18} />
            </div>
            <div className="brand-text">
              <h2>IELTS AI</h2>
              <span>READING ASSISTANT</span>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <MessageSquare size={17} /> <span>Chat</span>
            </NavLink>
            <NavLink to="/upload" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Upload size={17} /> <span>Documents</span>
            </NavLink>
          </nav>

          <button className="btn btn-outline" onClick={() => setToken(null)}>
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard token={token} view="chat" />} />
            <Route path="/upload" element={<Dashboard token={token} view="upload" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
