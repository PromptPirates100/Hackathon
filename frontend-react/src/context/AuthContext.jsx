// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Demo credentials — replace with real API calls once backend is ready
const DEMO_USERS = [
  { id: 1, email: 'admin@pulsegrid.ai',  password: 'admin123',  role: 'admin',  name: 'Dr. Admin' },
  { id: 2, email: 'staff@pulsegrid.ai',  password: 'staff123',  role: 'staff',  name: 'Nurse Sarah' },
  { id: 3, email: 'john@pulsegrid.ai',   password: 'john123',   role: 'staff',  name: 'John Medic' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pg_user')) || null; }
    catch { return null; }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('pg_user', JSON.stringify(user));
    else localStorage.removeItem('pg_user');
  }, [user]);

  const login = async (email, password, role) => {
    setLoading(true);
    setError('');
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(
      u => u.email === email.trim() && u.password === password && u.role === role
    );
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe);
      setLoading(false);
      return true;
    }
    setError('Invalid credentials. Check email, password and selected role.');
    setLoading(false);
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
