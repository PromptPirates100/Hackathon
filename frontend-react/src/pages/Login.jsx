// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, error, loading, setError } = useAuth();
  const navigate = useNavigate();
  const [role, setRole]       = useState('staff'); // 'staff' | 'admin'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password, role);
    if (ok) navigate(role === 'admin' ? '/' : '/intake');
  };

  const fillDemo = () => {
    if (role === 'admin') { setEmail('admin@pulsegrid.ai'); setPassword('admin123'); }
    else                   { setEmail('staff@pulsegrid.ai'); setPassword('staff123'); }
    setError('');
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="login-blob blob1"></div>
      <div className="login-blob blob2"></div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">♥</span>
          <span className="login-logo-text">PulseGrid AI</span>
        </div>
        <p className="login-subtitle">Emergency Triage &amp; Coordination Platform</p>

        {/* Role Tabs */}
        <div className="role-tabs">
          <button
            className={`role-tab ${role === 'staff' ? 'active' : ''}`}
            onClick={() => { setRole('staff'); setError(''); setEmail(''); setPassword(''); }}
            type="button"
          >
            <span className="role-tab-icon">👤</span>
            Staff Member
          </button>
          <button
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => { setRole('admin'); setError(''); setEmail(''); setPassword(''); }}
            type="button"
          >
            <span className="role-tab-icon">🛡️</span>
            Admin
          </button>
        </div>

        {/* Role description */}
        <div className={`role-info ${role}`}>
          {role === 'staff' ? (
            <><strong>Staff Access:</strong> Submit emergency patient intake forms and view triage results.</>
          ) : (
            <><strong>Admin Access:</strong> Full dashboard — live queue, analytics, hospitals, AI insights, and system management.</>
          )}
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder={role === 'admin' ? 'admin@pulsegrid.ai' : 'staff@pulsegrid.ai'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner"></span> : `Sign In as ${role === 'admin' ? 'Admin' : 'Staff'}`}
          </button>
        </form>

        {/* Demo hint */}
        <div className="login-demo">
          <span>Demo mode: </span>
          <button type="button" className="demo-fill-btn" onClick={fillDemo}>
            Fill {role === 'admin' ? 'Admin' : 'Staff'} credentials
          </button>
        </div>

        <div className="login-footer">
          &copy; 2026 PulseGrid AI — Real-time Emergency Intelligence
        </div>
      </div>
    </div>
  );
}
