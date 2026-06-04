import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, User, Flame, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: users = [], isLoading: loadingUsers, isFetching: fetchingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    }
  });

  const { data: submissions = [], isLoading: loadingSubs, isFetching: fetchingSubs, refetch: refetchSubs } = useQuery({
    queryKey: ['admin', 'submissions'],
    queryFn: async () => {
      const { data } = await api.get('/admin/submissions');
      return data;
    }
  });
  
  // New user state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { name, email, password, role: 'USER' });
      alert('User created!');
      setName('');
      setEmail('');
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (err) {
      alert('Failed to create user');
    }
  };

  const handleRefresh = () => {
    refetchUsers();
    refetchSubs();
  };

  const isSuperAdmin = user?.email === 'vishalsinha15456@gmail.com';
  const isLoading = loadingUsers || loadingSubs;
  const isFetching = fetchingUsers || fetchingSubs;

  if (isLoading) {
    return (
      <div>
        <div style={{ height: '32px', width: '250px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '2rem' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ height: '200px', backgroundColor: '#e0e0e0' }}></div>
          <div className="card" style={{ height: '200px', backgroundColor: '#e0e0e0' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Admin Dashboard</h1>
        <button onClick={handleRefresh} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }} disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isSuperAdmin && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Create New User</h2>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Name</label>
              <input type="text" className="input" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>Email</label>
              <input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>Password</label>
              <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Create User</button>
          </form>
        </div>
      )}

      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>All Users</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {users.map(u => (
          <div 
            key={u.id} 
            className="card" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', borderTop: u.role === 'ADMIN' ? '4px solid var(--accent-color)' : '4px solid transparent' }}
            onClick={() => navigate(`/admin/users/${u.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{u.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: u.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9', color: u.role === 'ADMIN' ? '#0369a1' : '#475569', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                {u.role}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={16} color="var(--danger-color)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Streak</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.streak}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--accent-color)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uploads</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.totalUploads}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                <CheckCircle size={16} color="#10b981" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Questions</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Submissions (Global)</h2>
        {submissions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No submissions found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {submissions.slice(0, 5).map(sub => (
              <div key={sub.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{sub.user?.name}</strong> uploaded <em>{sub.paper}</em>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sub.topic}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {format(new Date(sub.upload_date), 'MMM dd')}
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="btn" style={{ marginTop: '1rem', width: '100%', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }} onClick={() => navigate('/admin/submissions')}>
          View All Submissions
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
