import { useState } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Search, FileText, ChevronLeft, Eye, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAllSubmissions = () => {
  const navigate = useNavigate();
  
  // Filters state
  const [filters, setFilters] = useState({
    userId: '',
    paper: '',
    topic: '',
    startDate: '',
    endDate: ''
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    }
  });

  // Convert filters to query string
  const queryParams = new URLSearchParams();
  if (filters.userId) queryParams.append('userId', filters.userId);
  if (filters.paper) queryParams.append('paper', filters.paper);
  if (filters.topic) queryParams.append('topic', filters.topic);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);

  const { data: submissions = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'submissions', filters],
    queryFn: async () => {
      const { data } = await api.get(`/admin/submissions?${queryParams.toString()}`);
      return data;
    }
  });

  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      paper: '',
      topic: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={20} /> Back to Admin
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>All Submissions</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <button onClick={() => refetch()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} /> Filters
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>User</label>
            <select name="userId" value={filters.userId} onChange={handleFilterChange} className="input">
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paper</label>
            <select name="paper" value={filters.paper} onChange={handleFilterChange} className="input">
              <option value="">All Papers</option>
              {['GS1', 'GS2', 'GS3', 'GS4', 'ESSAY', 'OPTIONAL'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Topic Search</label>
            <input type="text" name="topic" value={filters.topic} onChange={handleFilterChange} className="input" placeholder="Keyword..." />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Start Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>End Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input" />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={clearFilters} className="btn" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>Clear Filters</button>
        </div>
      </div>

      {isLoading ? (
        <div className="card" style={{ height: '400px', backgroundColor: '#e0e0e0', animation: 'pulse 1.5s infinite' }}></div>
      ) : submissions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No submissions found matching these filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {submissions.map(sub => (
            <div key={sub.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--primary-color)" /> {sub.user?.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>[{sub.paper}]</span>
                  <span>{sub.topic}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                  <span>Questions: {sub.question_count}</span>
                  <span>Date: {format(new Date(sub.upload_date), 'dd MMM yyyy')}</span>
                </div>
              </div>
              <button 
                className="btn" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#0f172a' }}
                onClick={() => setSelectedPdfUrl(sub.file_url)}
              >
                <Eye size={16} /> Preview PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Modal */}
      {selectedPdfUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setSelectedPdfUrl(null)} className="btn" style={{ backgroundColor: 'white', color: 'black' }}>
              Close Preview
            </button>
          </div>
          <div style={{ flex: 1, backgroundColor: '#eee', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <iframe 
              src={selectedPdfUrl} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }} 
              title="PDF Viewer"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllSubmissions;
