import React from 'react';
import ChatInterface from '../components/ChatInterface';
import DocumentUpload from '../components/DocumentUpload';

export default function Dashboard({ token, view }) {
  return (
    <div className="split-pane">
      {/* Left Pane: Document Upload & List */}
      <div className="pane glass" style={{ padding: '1.5rem', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Reading Passages</h3>
        <DocumentUpload token={token} />
      </div>

      {/* Right Pane: Chat Interface */}
      <div className="pane glass" style={{ display: 'flex', flexDirection: 'column' }}>
        <ChatInterface token={token} />
      </div>
    </div>
  );
}
