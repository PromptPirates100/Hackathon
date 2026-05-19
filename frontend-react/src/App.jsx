// src/App.jsx
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import StaffPanel from './pages/StaffPanel';
import Analytics from './pages/Analytics';

const NAV = [
  { to: '/',          label: 'Dashboard',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { to: '/queue',     label: 'Live Queue',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
  { to: '/alerts',    label: 'Critical Alerts',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { to: '/hospitals', label: 'Hospitals',         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { to: '/analytics', label: 'Analytics',         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { to: '/intake',    label: 'Emergency Intake',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
  { to: '/logs',      label: 'System Logs',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { to: '/ai',        label: 'AI Insights',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
];

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">♥</span>
        <span className="logo-text">PulseGrid AI</span>
      </div>
      <ul className="nav-links">
        {NAV.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              {icon}{label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE SYSTEM ACTIVE
        </div>
      </div>
      <div className="top-bar-right">
        <span className="load-label">Emergency Load: <strong className="load-high">HIGH</strong></span>
        <div className="load-bar-wrap"><div className="load-bar-fill"></div></div>
        <Link to="/intake" className="btn-new-intake">+ New Intake</Link>
      </div>
    </header>
  );
}

// Simple placeholder for pages not yet fully implemented
function ComingSoon({ title }) {
  return (
    <div className="page-content">
      <div className="page-title-row"><h1 className="page-title">{title}</h1></div>
      <div className="panel" style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <p>This section will connect to the backend API when ready.</p>
        <p style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>See <code>src/services/api.js</code> for endpoint stubs.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <TopBar />
          <Routes>
            <Route path="/"          element={<AdminDashboard />} />
            <Route path="/intake"    element={<StaffPanel />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/queue"     element={<ComingSoon title="Live Queue" />} />
            <Route path="/alerts"    element={<ComingSoon title="Critical Alerts" />} />
            <Route path="/hospitals" element={<ComingSoon title="Hospital Grid" />} />
            <Route path="/logs"      element={<ComingSoon title="System Logs" />} />
            <Route path="/ai"        element={<ComingSoon title="AI Insights" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
