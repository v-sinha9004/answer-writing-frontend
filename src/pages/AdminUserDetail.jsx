import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, RefreshCw, Eye, FileText, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityCalendar } from 'react-activity-calendar';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${id}`);
      return data;
    }
  });

  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const calendarData = useMemo(() => {
    if (!user || !user.submissions) return [];
    const counts = {};
    user.submissions.forEach(sub => {
      const dateStr = sub.upload_date.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + sub.question_count;
    });

    const cal = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const count = counts[dateStr] || 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 5) level = 2;
      if (count >= 10) level = 3;
      if (count >= 20) level = 4;

      cal.push({ date: dateStr, count, level });
    }
    return cal;
  }, [user]);

  if (isLoading) {
    return <div className="card" style={{ height: '400px', animation: 'pulse 1.5s infinite' }}></div>;
  }

  if (!user) {
    return <div className="card">User not found</div>;
  }

  const totalUploads = user.submissions?.length || 0;
  const totalQuestions = user.submissions?.reduce((acc, sub) => acc + sub.question_count, 0) || 0;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>User Profile</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          <button onClick={() => refetch()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* User Header */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>{user.name}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{user.email}</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Joined: {format(new Date(user.createdAt), 'dd MMM yyyy')}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <FileText size={24} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{totalUploads}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Uploads</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{totalQuestions}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Questions</div>
          </div>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} /> Consistency Heatmap
        </h3>
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          <ActivityCalendar 
            data={calendarData} 
            theme={{
              light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
              dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
            }}
            labels={{
              totalCount: '{{count}} contributions in the last year'
            }}
            tooltips={{
              activity: {
                text: (activity) => {
                  const date = new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  if (activity.count === 0) return `No contributions on ${date}`;
                  return `${activity.count} contributions on ${date}`;
                }
              }
            }}
            blockRadius={2}
            blockMargin={4}
            blockSize={12}
          />
        </div>
      </div>

      {/* Upload History */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> Upload History
        </h3>
        {user.submissions?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No uploads yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {user.submissions.map(sub => (
              <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>[{sub.paper}]</span>
                    <span style={{ fontWeight: 500 }}>{sub.topic}</span>
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
      </div>

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

export default AdminUserDetail;
