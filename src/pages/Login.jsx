import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/auth';

export default function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/login`, formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        setToken(response.data.access_token);
      } else {
        await axios.post(`${API_URL}/register`, { email, password });
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card surface">
        <div className="brand">
          <div className="brand-mark">
            <BookOpen size={20} />
          </div>
          <div className="brand-text">
            <h2>IELTS AI</h2>
          </div>
        </div>

        <p className="auth-subtitle">
          {isLogin ? 'Sign in to continue' : 'Create an account'}
        </p>

        {error && (
          <div className={`auth-message ${error.includes('successful') ? 'success' : 'error'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn" style={{ marginTop: '0.5rem' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
