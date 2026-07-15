import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, AlertCircle, MessageSquare } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/chat';

export default function ChatInterface({ token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formatted = [];
      res.data.reverse().forEach(h => {
        formatted.push({ id: `q_${h.id}`, role: 'user', content: h.question });
        formatted.push({ id: `a_${h.id}`, role: 'ai', content: h.answer, context: h.context_used });
      });
      setMessages(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/ask`, { question: userMsg, filters: {} }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'ai', 
        content: res.data.answer,
        context: res.data.context 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatAIResponse = (text) => {
    if (!text.includes('✅ Correct Answer') && !text.includes('**Correct Answer**')) {
      return <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>;
    }
    
    // Custom renderer for structured IELTS response
    const sections = text.split('\n\n');
    return sections.map((sec, idx) => {
      if (sec.includes('Correct Answer')) {
        return <div key={idx} className="ai-section" style={{ borderLeftColor: 'var(--success)' }}>
          <h4 style={{ color: 'var(--success)' }}>✅ Correct Answer</h4>
          <p>{sec.replace(/.*?Correct Answer.*?:/i, '').trim()}</p>
        </div>;
      }
      if (sec.includes('Evidence')) {
        return <div key={idx} className="ai-section" style={{ borderLeftColor: 'var(--primary)' }}>
          <h4 style={{ color: 'var(--primary)' }}>📖 Evidence</h4>
          <p style={{ fontStyle: 'italic' }}>"{sec.replace(/.*?Evidence.*?:/i, '').replace(/["*]/g, '').trim()}"</p>
        </div>;
      }
      if (sec.includes('Explanation')) {
        return <div key={idx} className="ai-section" style={{ borderLeftColor: 'var(--warning)' }}>
          <h4 style={{ color: 'var(--warning)' }}>💡 Explanation</h4>
          <p>{sec.replace(/.*?Explanation.*?:/i, '').trim()}</p>
        </div>;
      }
      if (sec.includes('Incorrect Option') || sec.includes('Why Other Options')) {
        return <div key={idx} className="ai-section" style={{ borderLeftColor: 'var(--danger)' }}>
          <h4 style={{ color: 'var(--danger)' }}>❌ Incorrect Options</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{sec.replace(/.*?Incorrect Option.*?:/i, '').replace(/.*?Why Other Options.*?:/i, '').trim()}</p>
        </div>;
      }
      if (sec.includes('Question Type')) {
        return <div key={idx} style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Question Type:</strong> {sec.replace(/.*?Question Type.*?:/i, '').trim()}
        </div>;
      }
      if (sec.trim()) {
        return <p key={idx} style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{sec}</p>;
      }
      return null;
    });
  };

  return (
    <>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={24} color="var(--primary)" /> IELTS Assistant
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Ask questions based on your uploaded reading passages.
        </p>
      </div>

      <div className="chat-container">
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Upload a passage on the left, then ask a question here!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`} style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flexShrink: 0, marginTop: '0.2rem' }}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} color="var(--primary)" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : msg.error ? (
                <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} /> {msg.content}
                </div>
              ) : (
                <div style={{ lineHeight: 1.6 }}>{formatAIResponse(msg.content)}</div>
              )}
              
              {/* Context References */}
              {msg.context && msg.context.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Sources used: </strong>
                  {msg.context.map((c, i) => (
                    <span key={i} title={c.text} style={{ cursor: 'help', textDecoration: 'underline' }}>
                      [{c.metadata?.book || 'Passage'} T{c.metadata?.test_number || '?'} P{c.metadata?.passage_number || '?'}]
                      {i < msg.context.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
              <div className="typing-dot" style={{ animation: 'bounce 1.4s infinite ease-in-out both' }}>●</div>
              <div className="typing-dot" style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}>●</div>
              <div className="typing-dot" style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}>●</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="E.g. Is it True, False, or Not Given that...?" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            style={{ borderRadius: '24px', paddingLeft: '1.5rem' }}
          />
          <button type="submit" className="btn" disabled={!input.trim() || loading} style={{ borderRadius: '24px', width: '48px', height: '48px', padding: 0 }}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </>
  );
}
