// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * allowedRoles: array of roles that can access this route.
 * If user is not logged in → redirect to /login
 * If user doesn't have the right role → redirect to their home
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Staff trying to access admin routes → send to intake
    // Admin trying to access staff-only routes → send to dashboard
    return <Navigate to={user.role === 'admin' ? '/' : '/intake'} replace />;
  }

  return children;
}
