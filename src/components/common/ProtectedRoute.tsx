import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdminLoggedIn } = useAppStore();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
