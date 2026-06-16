import { type ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/useUserStore';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useUserStore();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [currentUser, loading, navigate, location]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}
