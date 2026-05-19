// src/App.jsx
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmergencyStoreProvider, useEmergencyStore } from './context/EmergencyStore';
import useWebSocket from './hooks/useWebSocket';
import ProtectedRoute from './components/ProtectedRoute';
import Login          from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffPanel     from './pages/StaffPanel';
import Analytics      from './pages/Analytics';

const ADMIN_NAV = [
  { to:'/',          label:'Dashboard',        icon:'⊞' },
  { to:'/queue',     label:'Live Queue',        icon:'≡' },
  { to:'/alerts',    label:'Critical Alerts',   icon:'⚠' },
  { to:'/hospitals', label:'Hospitals',         icon:'⌂' },
  { to:'/analytics', label:'Analytics',         icon:'↑' },
  { to:'/intake',    label:'Emergency Intake',  icon:'+' },
  { to:'/logs',      label:'System Logs',       icon:'☰' },
  { to:'/ai',        label:'AI Insights',       icon:'◎' },
];
const STAFF_NAV = [
  { to:'/intake', label:'Emergency Intake', icon:'+' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const nav = user?.role === 'admin' ? ADMIN_NAV : STAFF_NAV;
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">♥</span>
        <span className="logo-text">PulseGrid AI</span>
      </div>
      <ul className="nav-links">
        {nav.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink to={to} end={to==='/'} className={({ isActive }) => isActive ? 'active' : ''}>
              <span style={{ fontSize:15 }}>{icon}</span>{label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0] || 'U'}</div>
          <div>
            <div className="sidebar-username">{user?.name}</div>
            <div className="sidebar-role">{user?.role === 'admin' ? 'Administrator' : 'Staff Member'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}

function TopBar() {
  const { user } = useAuth();
  const { backendOnline } = useEmergencyStore();
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="live-badge"><span className="live-dot"></span>LIVE SYSTEM ACTIVE</div>
        <div className={`backend-badge ${backendOnline ? 'online' : 'offline'}`}>
          <span className={`backend-dot ${backendOnline ? 'online' : 'offline'}`}></span>
          {backendOnline ? 'Backend: Online' : 'Backend: Offline (local mode)'}
        </div>
      </div>
      <div className="top-bar-right">
        {user?.role === 'admin' && (
          <span className="load-label">Emergency Command Center</span>
        )}
        <Link to="/intake" className="btn-new-intake">+ New Intake</Link>
      </div>
    </header>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="page-content">
      <div className="page-title-row"><h1 className="page-title">{title}</h1></div>
      <div className="panel" style={{ textAlign:'center', padding:60, color:'#6b7280' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🚧</div>
        <h3 style={{ marginBottom:8 }}>{title}</h3>
        <p>This section connects to the backend API when ready.</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const { handleWsAlert } = useEmergencyStore();
  useWebSocket(handleWsAlert);
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <Routes>
          <Route path="/"          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/queue"     element={<ProtectedRoute allowedRoles={['admin']}><ComingSoon title="Live Queue" /></ProtectedRoute>} />
          <Route path="/alerts"    element={<ProtectedRoute allowedRoles={['admin']}><ComingSoon title="Critical Alerts" /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute allowedRoles={['admin']}><ComingSoon title="Hospital Grid" /></ProtectedRoute>} />
          <Route path="/logs"      element={<ProtectedRoute allowedRoles={['admin']}><ComingSoon title="System Logs" /></ProtectedRoute>} />
          <Route path="/ai"        element={<ProtectedRoute allowedRoles={['admin']}><ComingSoon title="AI Insights" /></ProtectedRoute>} />
          <Route path="/intake"    element={<ProtectedRoute allowedRoles={['admin','staff']}><StaffPanel /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AuthGate() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role==='admin' ? '/' : '/intake'} replace /> : <Login />} />
      <Route path="*"      element={user ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <EmergencyStoreProvider>
      <AuthProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </EmergencyStoreProvider>
  );
}
