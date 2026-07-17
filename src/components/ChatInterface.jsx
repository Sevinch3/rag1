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
        return <div key={idx} className="ai-section ai-section--correct">
          <h4>✅ Correct Answer</h4>
          <p>{sec.replace(/.*?Correct Answer.*?:/i, '').trim()}</p>
        </div>;
      }
      if (sec.includes('Evidence')) {
        return <div key={idx} className="ai-section ai-section--evidence">
          <h4>📖 Evidence</h4>
          <blockquote>&ldquo;{sec.replace(/.*?Evidence.*?:/i, '').replace(/["*]/g, '').trim()}&rdquo;</blockquote>
        </div>;
      }
      if (sec.includes('Explanation')) {
        return <div key={idx} className="ai-section ai-section--explanation">
          <h4>💡 Explanation</h4>
          <p>{sec.replace(/.*?Explanation.*?:/i, '').trim()}</p>
        </div>;
      }
      if (sec.includes('Incorrect Option') || sec.includes('Why Other Options')) {
        return <div key={idx} className="ai-section ai-section--incorrect">
          <h4>❌ Incorrect Options</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{sec.replace(/.*?Incorrect Option.*?:/i, '').replace(/.*?Why Other Options.*?:/i, '').trim()}</p>
        </div>;
      }
      if (sec.includes('Question Type')) {
        return <div key={idx} className="qtype-tag">
          <span>Question Type:</span> <strong>{sec.replace(/.*?Question Type.*?:/i, '').trim()}</strong>
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
      <div className="pane-header">
        <h3><Bot size={22} color="var(--primary)" /> IELTS Assistant</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
          Ask questions based on your uploaded reading passages.
        </p>
      </div>

      <div className="chat-container">
        {messages.length === 0 && (
          <div className="chat-empty">
            <MessageSquare size={40} />
            <p>Upload a passage on the left, then ask a question here!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}${msg.error ? ' error' : ''}`}>
            <div className="message-icon">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-bubble">
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : msg.error ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={17} /> {msg.content}
                </div>
              ) : (
                <div>{formatAIResponse(msg.content)}</div>
              )}

              {/* Context References */}
              {msg.context && msg.context.length > 0 && (
                <div className="sources">
                  <strong>Sources: </strong>
                  {msg.context.map((c, i) => (
                    <span key={i} className="source-tag" title={c.text}>
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
            <div className="message-icon"><Bot size={16} /></div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          placeholder="E.g. Is it True, False, or Not Given that...?"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn" disabled={!input.trim() || loading}>
          <Send size={18} />
        </button>
      </form>
    </>
  );
}
