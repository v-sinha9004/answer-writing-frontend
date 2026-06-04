import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, FileText, Settings } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItemStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    color: location.pathname === path ? 'var(--primary-color)' : 'var(--text-secondary)',
    backgroundColor: location.pathname === path ? '#e2e8f0' : 'transparent',
    fontWeight: location.pathname === path ? '600' : '500',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} />
          UPSC Tracker
        </h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link to="/" style={navItemStyle('/')}><Home size={18} /> Dashboard</Link>
          <Link to="/history" style={navItemStyle('/history')}><FileText size={18} /> Submissions</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" style={navItemStyle('/admin')}><Settings size={18} /> Admin</Link>
          )}
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Logged in as <br /><strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', border: '1px solid var(--border-color)', color: 'var(--danger-color)', display: 'flex', gap: '0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
