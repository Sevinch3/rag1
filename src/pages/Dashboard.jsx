import React from 'react';
import ChatInterface from '../components/ChatInterface';
import DocumentUpload from '../components/DocumentUpload';

export default function Dashboard({ token, view }) {
  return (
    <div className={`split-pane ${view === 'upload' ? 'show-documents' : 'show-chat'}`}>
      {/* Left Pane: Document Upload & List */}
      <div className="pane documents-pane">
        <div className="pane-header">
          <span className="eyebrow">Collection</span>
          <h3>Reading Passages</h3>
        </div>
        <div className="pane-body">
          <DocumentUpload token={token} />
        </div>
      </div>

      {/* Right Pane: Chat Interface */}
      <div className="pane chat-pane">
        <ChatInterface token={token} />
      </div>
    </div>
  );
}
