import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/documents';

export default function DocumentUpload({ token }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [book, setBook] = useState('');
  const [testNum, setTestNum] = useState('');
  const [passageNum, setPassageNum] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const metadata = {};
    if (book) metadata.book = book;
    if (testNum) metadata.test_number = parseInt(testNum);
    if (passageNum) metadata.passage_number = parseInt(passageNum);

    formData.append('metadata_json', JSON.stringify(metadata));

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      setBook('');
      setTestNum('');
      setPassageNum('');
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <form onSubmit={handleUpload} className="upload-form">
        <h4><Upload size={17} /> Upload New Passage</h4>

        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          required
        />

        <div className="upload-grid">
          <input type="text" placeholder="Book (e.g. Cambridge 18)" value={book} onChange={e => setBook(e.target.value)} />
          <input type="number" placeholder="Test #" value={testNum} onChange={e => setTestNum(e.target.value)} />
          <input type="number" placeholder="Passage #" value={passageNum} onChange={e => setPassageNum(e.target.value)} />
        </div>

        <button type="submit" className="btn" disabled={!file || uploading} style={{ alignSelf: 'flex-start' }}>
          {uploading ? 'Processing...' : 'Upload & Index'}
        </button>
      </form>

      <div>
        <h4 style={{ marginBottom: '0.9rem' }}>Indexed Passages</h4>
        <div className="doc-list">
          {documents.length === 0 ? (
            <p className="doc-list-empty">No passages uploaded yet.</p>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="doc-card">
                <div className="doc-card-icon"><FileText size={18} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="doc-card-name">{doc.filename}</div>
                  <div className="doc-card-meta">
                    {doc.metadata_json?.book} • Test {doc.metadata_json?.test_number} • Passage {doc.metadata_json?.passage_number}
                  </div>
                </div>
                <CheckCircle size={17} color="var(--success)" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
