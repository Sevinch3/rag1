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
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '3rem', width: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <BookOpen size={36} color="var(--primary)" />
          <h2>IELTS AI</h2>
        </div>
        
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          {isLogin ? 'Sign in to continue' : 'Create an account'}
        </p>

        {error && <div style={{ color: error.includes('successful') ? 'var(--success)' : 'var(--danger)', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <button type="submit" className="btn" style={{ marginTop: '1rem' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => {setIsLogin(!isLogin); setError('');}} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}
