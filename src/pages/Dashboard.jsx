import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActivityCalendar } from 'react-activity-calendar';
import api from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/submissions/stats');
      return data;
    }
  });

  const calendarData = useMemo(() => {
    if (!stats) return [];
    const counts = {};
    stats.forEach(sub => {
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
  }, [stats]);

  const totalQs = stats.reduce((acc, curr) => acc + curr.question_count, 0);

  if (isLoading) {
    return (
      <div>
        <div style={{ height: '32px', width: '300px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '2rem' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: '140px', backgroundColor: '#e0e0e0' }}></div>
          ))}
        </div>
        <div className="card" style={{ height: '250px', backgroundColor: '#e0e0e0' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Welcome back, {user?.name}!</h1>
        <button onClick={() => refetch()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }} disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🔥</div>
          <h3 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Current Streak</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.length > 0 ? 'Active' : '0 Days'}</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem' }}>📝</div>
          <h3 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Total Questions</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalQs}</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem' }}>📚</div>
          <h3 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Total PDFs</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.length}</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Consistency Heatmap</h2>
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          {calendarData.length > 0 ? (
            <ActivityCalendar
              data={calendarData}
              theme={{
                light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                dark: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
              }}
              labels={{
                totalCount: '{{count}} contributions in the last year'
              }}
              tooltips={{
                activity: {
                  text: (activity) => {
                    const date = new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    if (activity.count === 0) {
                      return `No contributions on ${date}`;
                    }
                    return `${activity.count} contributions on ${date}`;
                  }
                }
              }}
              blockRadius={2}
              blockMargin={4}
              blockSize={12}
            />
          ) : (
            <p>No activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
