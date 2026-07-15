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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} /> Upload New Passage
        </h4>
        
        <input 
          type="file" 
          onChange={e => setFile(e.target.files[0])} 
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          required 
          style={{ background: 'transparent', padding: '0.5rem 0' }}
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input type="text" placeholder="Book (e.g. Cambridge 18)" value={book} onChange={e => setBook(e.target.value)} />
          <input type="number" placeholder="Test #" value={testNum} onChange={e => setTestNum(e.target.value)} />
          <input type="number" placeholder="Passage #" value={passageNum} onChange={e => setPassageNum(e.target.value)} />
        </div>

        <button type="submit" className="btn" disabled={!file || uploading} style={{ alignSelf: 'flex-start' }}>
          {uploading ? 'Processing...' : 'Upload & Index'}
        </button>
      </form>

      <div>
        <h4 style={{ marginBottom: '1rem' }}>Indexed Passages</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No passages uploaded yet.</p>
          ) : (
            documents.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <FileText size={24} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{doc.filename}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {doc.metadata_json?.book} • Test {doc.metadata_json?.test_number} • Passage {doc.metadata_json?.passage_number}
                  </div>
                </div>
                <CheckCircle size={18} color="var(--success)" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
