import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { FileUp, Eye, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const History = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedUserId, setSelectedUserId] = useState(user?.id);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'dates'

  const { data: adminUsers = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
    enabled: user?.role === 'ADMIN'
  });

  const { data: submissions = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['submissions', selectedUserId],
    queryFn: async () => {
      if (user?.role === 'ADMIN' && selectedUserId !== user.id) {
        const { data } = await api.get(`/admin/submissions?userId=${selectedUserId}`);
        return data;
      } else {
        const { data } = await api.get('/submissions');
        return data;
      }
    }
  });
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [paper, setPaper] = useState('GS1');
  const [topic, setTopic] = useState('');
  const [qs, setQs] = useState(1);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('paper', paper);
    formData.append('topic', topic);
    formData.append('question_count', qs);
    
    try {
      await api.post('/submissions/upload', formData);
      setShowUpload(false);
      setFile(null);
      // Invalidate both submissions and stats to keep the dashboard in sync
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Group submissions by date
  const groupedByDate = submissions.reduce((acc, sub) => {
    const dateStr = format(new Date(sub.upload_date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(sub);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  const getSelectedUserName = () => {
    if (selectedUserId === user.id) return user.name;
    const found = adminUsers.find(u => u.id === selectedUserId);
    return found ? found.name : 'User';
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ height: '32px', width: '250px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '2rem' }}></div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="card" style={{ height: '80px', backgroundColor: '#e0e0e0' }}></div>
             <div className="card" style={{ height: '80px', backgroundColor: '#e0e0e0' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Submissions</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => refetch()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={() => setShowUpload(true)} className="btn btn-primary">
            <FileUp size={16} style={{ marginRight: '0.5rem' }} /> Upload PDF
          </button>
        </div>
      </div>

      {/* Breadcrumb / Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <button 
          onClick={() => { setActiveTab('users'); setSelectedDate(null); setSelectedPdfUrl(null); }}
          style={{ background: 'none', border: 'none', color: activeTab === 'users' ? 'var(--primary-color)' : 'inherit', fontWeight: activeTab === 'users' ? 600 : 400, cursor: 'pointer', fontSize: '1rem' }}
        >
          {user?.role === 'ADMIN' ? 'All Users' : `${user?.name}'s Folder`}
        </button>
        
        {activeTab === 'dates' && (
          <>
            <ChevronRight size={16} />
            <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{getSelectedUserName()} (Dates)</span>
          </>
        )}

        {selectedDate && (
          <>
            <ChevronRight size={16} />
            <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{format(new Date(selectedDate), 'MMM dd, yyyy')}</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Column: List/Tabs */}
        <div style={{ flex: selectedPdfUrl ? '0 0 300px' : '1', transition: 'var(--transition-normal)' }}>
          {activeTab === 'users' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user?.role === 'ADMIN' ? (
                adminUsers.map(u => (
                  <div 
                    key={u.id}
                    className="card" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'var(--transition-fast)', border: selectedUserId === u.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)' }}
                    onClick={() => { setSelectedUserId(u.id); setActiveTab('dates'); }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>{u.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div 
                  className="card" 
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'var(--transition-fast)' }}
                  onClick={() => { setSelectedUserId(user.id); setActiveTab('dates'); }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{user?.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>My Submissions</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!selectedDate ? (
                // Show Dates
                dates.length > 0 ? (
                  dates.map(date => (
                    <div 
                      key={date} 
                      className="card"
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span style={{ fontWeight: 500 }}>{format(new Date(date), 'MMMM dd, yyyy')}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{groupedByDate[date].length} PDF(s)</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No submissions found for this user.</p>
                )
              ) : (
                // Show PDFs for selected date
                <>
                  <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem' }}>
                    &larr; Back to Dates
                  </button>
                  {groupedByDate[selectedDate].map(sub => (
                    <div 
                      key={sub.id} 
                      className="card"
                      style={{ cursor: 'pointer', border: selectedPdfUrl === sub.file_url ? '2px solid var(--accent-color)' : '' }}
                      onClick={() => setSelectedPdfUrl(sub.file_url)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <FileText size={18} color="var(--accent-color)" />
                        <strong style={{ fontSize: '1.05rem' }}>{sub.paper}</strong>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{sub.topic}</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#888' }}>{sub.question_count} Questions</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Column: PDF Viewer */}
        {selectedPdfUrl && (
          <div style={{ flex: 1, backgroundColor: '#eee', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 'calc(100vh - 120px)' }}>
            <iframe 
              src={selectedPdfUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }} 
              allow="autoplay"
              title="PDF Viewer"
            ></iframe>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Upload Answer PDF</h2>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Paper</label>
                <select className="input" value={paper} onChange={e => setPaper(e.target.value)}>
                  {['GS1', 'GS2', 'GS3', 'GS4', 'ESSAY', 'OPTIONAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label>Topic</label>
                <input type="text" className="input" value={topic} onChange={e => setTopic(e.target.value)} required />
              </div>
              <div>
                <label>Question Count</label>
                <input type="number" className="input" value={qs} onChange={e => setQs(e.target.value)} min="1" required />
              </div>
              <div>
                <label>PDF File</label>
                <input type="file" className="input" accept="application/pdf" onChange={e => setFile(e.target.files[0])} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" style={{ flex: 1, border: '1px solid #ccc' }} onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
