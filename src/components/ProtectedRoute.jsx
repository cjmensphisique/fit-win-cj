import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user, isLoading } = useAuth();

  // Wait until localStorage has been checked before making any redirect decision
  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect based on role if they try to access wrong portal
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <Outlet />;
}
