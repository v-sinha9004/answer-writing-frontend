import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminAllSubmissions from './pages/AdminAllSubmissions';
import AdminUserDetail from './pages/AdminUserDetail';
import History from './pages/History';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="history" element={<History />} />
        
        {/* Admin Routes */}
        <Route 
          path="admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/submissions" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAllSubmissions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/users/:id" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUserDetail />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;
