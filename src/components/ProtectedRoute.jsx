import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ role }) {
  const { user, isLoading } = useAuth();

  // Wait until localStorage has been checked before making any redirect decision
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || 'client';
  if (role && userRole !== role) {
    // Redirect based on role if they try to access wrong portal
    return <Navigate to={userRole === 'admin' ? '/admin' : '/client'} replace />;
  }

  return <Outlet />;
}
